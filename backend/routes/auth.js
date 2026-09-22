import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, subdomain, ownerEmail, password, upiId, gstPercent } = req.body;

    if (!name || !subdomain || !ownerEmail || !password) {
      return res.status(400).json({ error: 'name, subdomain, ownerEmail and password are required' });
    }

    const existingCompany = await Company.findOne({ subdomain });
    if (existingCompany) return res.status(400).json({ error: 'Subdomain is already taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const company = await Company.create({
      name,
      subdomain,
      ownerEmail,
      passwordHash,
      upiId,
      gstPercent: gstPercent ?? 5
    });

    res.status(201).json({ message: 'Company registered successfully', companyId: company._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { subdomain, ownerEmail, password } = req.body;
    
    if (!subdomain || !ownerEmail || !password) {
      return res.status(400).json({ error: 'subdomain, ownerEmail and password are required' });
    }

    const company = await Company.findOne({ subdomain, ownerEmail });
    if (!company) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, company.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { companyId: company._id, ownerEmail: company.ownerEmail },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({ token, companyId: company._id, name: company.name, subdomain: company.subdomain });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings', authenticateToken, async (req, res) => {
  const company = await Company.findById(req.user.companyId).select('name subdomain ownerEmail upiId gstPercent language printerEnabled');
  if (!company) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(company);
});

router.patch('/settings', authenticateToken, async (req, res) => {
  const allowed = ['upiId', 'gstPercent', 'language', 'whatsappToken', 'razorpayKey', 'printerEnabled'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (updates.language && !['english', 'marathi', 'hindi'].includes(updates.language)) {
    return res.status(400).json({ error: 'Invalid language' });
  }
  const company = await Company.findByIdAndUpdate(req.user.companyId, updates, { new: true }).select('name subdomain ownerEmail upiId gstPercent language printerEnabled');
  if (!company) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(company);
});

export default router;