import express from 'express';
import KOT from '../models/KOT.js';

const router = express.Router();

// POST /api/kot/status
router.post('/status', async (req, res) => {
  try {
    const { kotId, dishId, status } = req.body; // status: preparing/ready

    const kot = await KOT.findById(kotId);
    if (!kot) return res.status(404).json({ error: 'KOT record not found' });

    // Update individual item status within array
    const item = kot.items.find((i) => i.dishId.toString() === dishId);
    if (item) {
      item.status = status;
    }

    // Check if all items share the same status to update master KOT status
    const allMatching = kot.items.every((i) => i.status === status);
    if (allMatching) {
      kot.status = status;
    }

    await kot.save();
    res.json({ message: 'KOT item status updated', kot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;