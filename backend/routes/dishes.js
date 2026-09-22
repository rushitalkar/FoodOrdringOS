import express from 'express';
import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import Dish from '../models/Dish.js';
import Category from '../models/Category.js';
import Company from '../models/Company.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Multer Storage Setup
const uploadDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads', 'dishes');
mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension).replace(/[^a-z0-9-_]/gi, '-');
    cb(null, `${Date.now()}-${baseName}${extension}`);
  }
});
const upload = multer({ storage });

// POST /api/dishes/create
router.post('/create', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, categoryId, price, gstPercent, isVeg, prepTime } = req.body;
    const companyId = req.user.companyId;

    if (!title?.trim() || !categoryId || !Number.isFinite(Number(price))) {
      return res.status(400).json({ error: 'title, category and a valid price are required' });
    }

    const category = await Category.findOne({ _id: categoryId, companyId });
    if (!category) return res.status(400).json({ error: 'Selected category is invalid' });

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

// PATCH /api/dishes/:dishId/availability
router.patch('/:dishId/availability', authenticateToken, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') return res.status(400).json({ error: 'isAvailable must be boolean' });

    const dish = await Dish.findOneAndUpdate(
      { _id: req.params.dishId, companyId: req.user.companyId },
      { isAvailable },
      { new: true }
    );
    if (!dish) return res.status(404).json({ error: 'Dish not found' });
    res.json(dish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dishes/list?companyId=&category=
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const companyId = req.user.companyId;

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