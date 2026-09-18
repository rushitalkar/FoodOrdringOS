import express from 'express';
import Order from '../models/Order.js';
import KOT from '../models/KOT.js';
import Table from '../models/Table.js';
import Dish from '../models/Dish.js';

const router = express.Router();

// POST /api/orders/create
router.post('/create', async (req, res) => {
  try {
    const { companyId, tableId, customerName, phone, items, orderType } = req.body;

    let subtotal = 0;
    let gstTotal = 0;
    const populatedItems = [];

    // Process and calculate prices dynamically
    for (const item of items) {
      const dish = await Dish.findById(item.dishId);
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

    // Create Order
    const order = await Order.create({
      companyId,
      tableId: tableId || null,
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
      tableId: tableId || null,
      items: populatedItems.map((i) => ({ dishId: i.dishId, qty: i.qty, status: 'pending' }))
    });

    // Update Table status if dine-in
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
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
router.get('/list', async (req, res) => {
  try {
    const { companyId, status, tableId } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId is required' });

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
router.get('/stats', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId is required' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({
      companyId,
      createdAt: { $gte: startOfDay }
    });

    const totalOrdersCount = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, ord) => sum + (ord.paymentStatus === 'paid' ? ord.grandTotal : 0), 0);

    const pendingKOTCount = await KOT.countDocuments({
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
router.post('/status', async (req, res) => {
  try {
    const { orderId, status } = req.body; // status: preparing/ready/delivered/billed

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });

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