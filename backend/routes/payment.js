import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;

    if (!razorpay_payment_id || !orderId) {
      return res.status(400).json({ error: 'Missing payment signature parameters' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        paymentMode: 'Razorpay'
      },
      { new: true }
    );

    res.json({ message: 'Payment verified successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;