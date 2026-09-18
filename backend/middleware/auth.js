import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';

const router = express.Router();

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) return res.status(401).json({ error: 'Access token is required' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, subdomain, ownerEmail, password, upiId, gstPercent } = req.body;

    const existingCompany = await Company.findOne({ subdomain });
    if (existingCompany) {
      return res.status(400).json({ error: 'Subdomain is already taken' });
    }

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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { subdomain, ownerEmail, password } = req.body;

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

export default router;