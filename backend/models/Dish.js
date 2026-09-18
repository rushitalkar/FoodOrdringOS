import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    gstPercent: { type: Number, default: 5, min: 0 },
    imageUrl: { type: String, default: '' },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    prepTime: { type: Number, default: 15, min: 1 } // in minutes
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('Dish', dishSchema);