import express from 'express';
import KOT from '../models/KOT.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/kot/list
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const kots = await KOT.find({})
      .populate({ path: 'orderId', match: { companyId: req.user.companyId }, select: 'companyId items' })
      .populate('tableId', 'tableNo')
      .sort({ createdAt: -1 });

    res.json(kots.filter((kot) => kot.orderId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/kot/status
router.post('/status', authenticateToken, async (req, res) => {
  try {
    const { kotId, status } = req.body; // status: preparing/ready

    const kot = await KOT.findById(kotId).populate({
      path: 'orderId',
      match: { companyId: req.user.companyId },
      select: 'companyId'
    });
    if (!kot) return res.status(404).json({ error: 'KOT record not found' });
    if (!kot.orderId) return res.status(404).json({ error: 'KOT record not found' });

    kot.items.forEach((item) => { item.status = status; });
    kot.status = status;

    await kot.save();
    res.json({ message: 'KOT item status updated', kot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;