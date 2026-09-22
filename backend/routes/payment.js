import express from 'express';
import Order from '../models/Order.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/payment/verify
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;

    if (!razorpay_payment_id || !orderId) {
      return res.status(400).json({ error: 'Missing payment signature parameters' });
    }

    const order = await Order.findOne({ _id: orderId, companyId: req.user.companyId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.paymentStatus = 'paid';
    order.paymentMode = 'Razorpay';
    await order.save();

    res.json({ message: 'Payment verified successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;