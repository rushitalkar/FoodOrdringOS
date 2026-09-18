import express from 'express';
import Category from '../models/Category.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/categories/create
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const companyId = req.user.companyId;

    const category = await Category.create({ companyId, name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/list?companyId=
router.get('/list', async (req, res) => {
  try {
    const companyId = req.query.companyId;
    if (!companyId) return res.status(400).json({ error: 'companyId query param is required' });

    const categories = await Category.find({ companyId }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;