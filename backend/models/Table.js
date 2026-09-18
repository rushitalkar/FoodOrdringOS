import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    tableNo: { type: String, required: true, trim: true },
    qrCodeUrl: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['vacant', 'occupied', 'billed'], 
      default: 'vacant' 
    },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
  },
  { timestamps: true }
);

// Ensure table number is unique per company
tableSchema.index({ companyId: 1, tableNo: 1 }, { unique: true });

export default mongoose.model('Table', tableSchema);