import express from 'express';
import Table from '../models/Table.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/tables/create
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { tableNo, domain = 'http://localhost:3000' } = req.body;
    const companyId = req.user.companyId;

    if (!tableNo || !/^\d+$/.test(String(tableNo))) {
      return res.status(400).json({ error: 'A numeric table number is required' });
    }

    // Retrieve company subdomain for QR construction
    const Company = (await import('../models/Company.js')).default;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: 'Restaurant not found' });

    const targetUrl = `${domain}/qr/${company.subdomain}/${tableNo}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(targetUrl)}&size=300x300`;

    const table = await Table.create({
      companyId,
      tableNo,
      qrCodeUrl
    });

    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tables/list?companyId=
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const tables = await Table.find({ companyId }).populate('currentOrderId');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;