import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);