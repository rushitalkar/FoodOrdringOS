import express from 'express';
import Order from '../models/Order.js';
import Company from '../models/Company.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/whatsapp/send
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { orderId, type, language } = req.body; // type: order-confirmed / kot-ready / bill

    const order = await Order.findById(orderId).populate('companyId');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.companyId._id) !== String(req.user.companyId)) return res.status(404).json({ error: 'Order not found' });
    if (!['order-confirmed', 'kot-ready', 'bill'].includes(type)) return res.status(400).json({ error: 'Invalid notification type' });

    const company = order.companyId;
    const selectedLanguage = language || company.language || 'english';
    const upiLink = `upi://pay?pa=${company.upiId || 'merchant@upi'}&am=${order.grandTotal}`;

    let messageText = '';

    if (selectedLanguage === 'marathi') {
      if (type === 'order-confirmed') {
        messageText = `नमस्कार ${order.customerName}! ${company.name} मध्ये तुमची ऑर्डर नोंदवली गेली आहे. एकूण: ₹${order.grandTotal}. धन्यवाद!`;
      } else if (type === 'kot-ready') {
        messageText = `तुमची ऑर्डर तयार झाली आहे! कृपया गरम सर्व्ह असताना आस्वाद घ्या.`;
      } else if (type === 'bill') {
        messageText = `तुमचे बिल ₹${order.grandTotal} आहे. ऑनलाइन भरण्यासाठी UPI लिंक: ${upiLink}`;
      }
    } else if (selectedLanguage === 'hindi') {
      if (type === 'order-confirmed') {
        messageText = `नमस्ते ${order.customerName}! ${company.name} में आपका ऑर्डर दर्ज हो गया है। कुल राशि: ₹${order.grandTotal}।`;
      } else if (type === 'kot-ready') {
        messageText = `आपका ऑर्डर तैयार है! कृपया गरमा-गरम आनंद लें।`;
      } else if (type === 'bill') {
        messageText = `आपका कुल बिल ₹${order.grandTotal} है। UPI द्वारा भुगतान के लिए लिंक: ${upiLink}`;
      }
    } else {
      if (type === 'order-confirmed') {
        messageText = `Hello ${order.customerName}! Your order has been received by ${company.name}. Total: Rs. ${order.grandTotal}. Thank you!`;
      } else if (type === 'kot-ready') {
        messageText = 'Your order is ready. Please enjoy your meal!';
      } else if (type === 'bill') {
        messageText = `Your bill total is Rs. ${order.grandTotal}. Pay online using UPI: ${upiLink}`;
      }
    }

    // Mock WhatsApp Meta API Call Dispatch
    console.log(`[WHATSAPP DISPATCH] To: ${order.phone} | Msg: ${messageText}`);

    res.json({
      message: 'WhatsApp notification sent',
      phone: order.phone,
      content: messageText
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;