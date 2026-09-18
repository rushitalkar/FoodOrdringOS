import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import dishesRoutes from './routes/dishes.js';
import tablesRoutes from './routes/tables.js';
import ordersRoutes from './routes/orders.js';
import kotRoutes from './routes/kot.js';
import paymentRoutes from './routes/payment.js';
import whatsappRoutes from './routes/whatsapp.js';
import { initKotCronJob } from './cron/kotChecker.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/dishes', dishesRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/kot', kotRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Initialize Cron
initKotCronJob();

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_os')
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => console.error('DB Connection error:', err));