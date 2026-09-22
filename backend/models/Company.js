import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    upiId: { type: String, trim: true },
    gstPercent: { type: Number, default: 5, min: 0 },
    language: { type: String, enum: ['english', 'marathi', 'hindi'], default: 'english' },
    whatsappToken: { type: String, trim: true },
    razorpayKey: { type: String, trim: true },
    printerEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);