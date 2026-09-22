import mongoose from 'mongoose';

const kotItemSchema = new mongoose.Schema(
  {
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    qty: { type: Number, required: true, min: 1 },
    status: { 
      type: String, 
      enum: ['pending', 'preparing', 'ready'], 
      default: 'pending' 
    }
  },
  { _id: false }
);

const kotSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null, index: true },
    items: [kotItemSchema],
    status: { 
      type: String, 
      enum: ['pending', 'preparing', 'ready'], 
      default: 'pending' 
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('KOT', kotSchema);