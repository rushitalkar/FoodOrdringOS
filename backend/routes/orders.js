import express from 'express';
import Order from '../models/Order.js';
import KOT from '../models/KOT.js';
import Table from '../models/Table.js';
import Dish from '../models/Dish.js';
import Company from '../models/Company.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders/create
router.post('/create', async (req, res) => {
  try {
    const { companyId: requestedCompanyId, companySubdomain, tableId: requestedTableId, tableNo, customerName, phone, items, orderType } = req.body;
    const company = requestedCompanyId
      ? await Company.findById(requestedCompanyId)
      : await Company.findOne({ subdomain: companySubdomain });

    if (!company) return res.status(404).json({ error: 'Restaurant not found' });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one dish is required' });
    }

    const table = requestedTableId
      ? await Table.findOne({ _id: requestedTableId, companyId: company._id })
      : tableNo !== undefined
        ? await Table.findOne({ companyId: company._id, tableNo: String(tableNo) })
        : null;

    if (tableNo !== undefined && !table) return res.status(404).json({ error: 'Table not found' });

    let subtotal = 0;
    let gstTotal = 0;
    const populatedItems = [];

    // Process and calculate prices dynamically
    for (const item of items) {
      const dish = await Dish.findOne({ _id: item.dishId, companyId: company._id });
      if (!dish) continue;

      const itemTotal = dish.price * item.qty;
      const itemGst = (itemTotal * (dish.gstPercent || 5)) / 100;

      subtotal += itemTotal;
      gstTotal += itemGst;

      populatedItems.push({
        dishId: dish._id,
        title: dish.title,
        qty: item.qty,
        price: dish.price
      });
    }

    const grandTotal = subtotal + gstTotal;

    if (populatedItems.length === 0) {
      return res.status(400).json({ error: 'The selected dishes are no longer available' });
    }

    // Create Order
    const order = await Order.create({
      companyId: company._id,
      tableId: table?._id || null,
      customerName: customerName || 'Guest',
      phone,
      items: populatedItems,
      total: subtotal,
      gstTotal,
      grandTotal,
      orderType: orderType || 'dine-in'
    });

    // Create KOT
    const kot = await KOT.create({
      orderId: order._id,
      tableId: table?._id || null,
      items: populatedItems.map((i) => ({ dishId: i.dishId, qty: i.qty, status: 'pending' }))
    });

    // Update Table status if dine-in
    if (table) {
      await Table.findByIdAndUpdate(table._id, {
        status: 'occupied',
        currentOrderId: order._id
      });
    }

    res.status(201).json({ order, kot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/list?companyId=&status=&tableId=
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const { status, tableId } = req.query;
    const companyId = req.user.companyId;

    const query = { companyId };
    if (status) query.status = status;
    if (tableId) query.tableId = tableId;

    const orders = await Order.find(query)
      .populate('tableId', 'tableNo')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/stats?companyId=
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({
      companyId,
      createdAt: { $gte: startOfDay }
    });

    const totalOrdersCount = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, ord) => sum + (ord.paymentStatus === 'paid' ? ord.grandTotal : 0), 0);

    const companyOrderIds = todayOrders.map((order) => order._id);
    const pendingKOTCount = await KOT.countDocuments({
      orderId: { $in: companyOrderIds },
      status: { $in: ['pending', 'preparing'] }
    });

    const occupiedTablesCount = await Table.countDocuments({
      companyId,
      status: 'occupied'
    });

    res.json({
      totalOrdersToday: totalOrdersCount,
      revenueToday: totalRevenue,
      pendingKOTs: pendingKOTCount,
      occupiedTables: occupiedTablesCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/status
router.post('/status', authenticateToken, async (req, res) => {
  try {
    const { orderId, status } = req.body; // status: preparing/ready/delivered/billed
    if (!['preparing', 'ready', 'delivered', 'billed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await Order.findOne({ _id: orderId, companyId: req.user.companyId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updates = { status };
    if (status === 'billed') {
      updates.paymentStatus = 'paid';
      updates.paymentMode = 'Cash';
    }
    Object.assign(order, updates);
    await order.save();

    // Synchronize KOT Status
    if (['preparing', 'ready'].includes(status)) {
      await KOT.updateMany({ orderId }, { status });
      await KOT.updateMany(
        { orderId },
        { $set: { "items.$[].status": status } }
      );
    }

    // Vacate table if order is billed
    if (status === 'billed' && order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, {
        status: 'vacant',
        currentOrderId: null
      });
    }

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;