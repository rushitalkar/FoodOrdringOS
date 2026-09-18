import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Company from "../models/Company.js";
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, subdomain, ownerEmail, password } = req.body;

    const existing = await Company.findOne({ subdomain });
    if (existing) return res.status(400).json({ error: 'Subdomain already taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const business = await Company.create({ name, subdomain, ownerEmail, passwordHash });

    res.status(201).json({ message: 'Business registered successfully', businessId: business._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { subdomain, ownerEmail, password } = req.body;

    const business = await Company.findOne({ subdomain, ownerEmail });
    if (!business) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, business.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { businessId: business._id, role: 'business' },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({ token, businessId: business._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;