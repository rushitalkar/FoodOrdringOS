import express from 'express';
import Category from '../models/Category.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/categories/create
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const companyId = req.user.companyId;

    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const existing = await Category.findOne({ companyId, name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (existing) return res.status(409).json({ error: 'Category already exists' });

    const category = await Category.create({ companyId, name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/list?companyId=
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const categories = await Category.find({ companyId }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;