import express from 'express';
import multer from 'multer';
import path from 'path';
import Dish from '../models/Dish.js';
import Company from '../models/Company.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/dishes/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// POST /api/dishes/create
router.post('/create', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, categoryId, price, gstPercent, isVeg, prepTime } = req.body;
    const companyId = req.user.companyId;
    const imageUrl = req.file ? `/uploads/dishes/${req.file.filename}` : '';

    const dish = await Dish.create({
      companyId,
      categoryId,
      title,
      price: parseFloat(price),
      gstPercent: gstPercent !== undefined ? parseFloat(gstPercent) : 5,
      isVeg: isVeg === 'true' || isVeg === true,
      prepTime: prepTime ? parseInt(prepTime) : 15,
      imageUrl
    });

    res.status(201).json(dish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dishes/list?companyId=&category=
router.get('/list', async (req, res) => {
  try {
    const { companyId, category } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId is required' });

    const filter = { companyId };
    if (category) filter.categoryId = category;

    const dishes = await Dish.find(filter).populate('categoryId', 'name');
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dishes/public?subdomain=
router.get('/public', async (req, res) => {
  try {
    const { subdomain } = req.query;
    if (!subdomain) return res.status(400).json({ error: 'subdomain is required' });

    const company = await Company.findOne({ subdomain });
    if (!company) return res.status(404).json({ error: 'Restaurant not found' });

    const dishes = await Dish.find({ companyId: company._id, isAvailable: true })
      .populate('categoryId', 'name');

    res.json({ company, dishes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;