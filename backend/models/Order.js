import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    title: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', index: true, default: null },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    items: [orderItemSchema],
    total: { type: Number, required: true, min: 0 },
    gstTotal: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMode: { 
      type: String, 
      enum: ['UPI', 'Cash', 'Razorpay'], 
      default: 'Cash' 
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid'], 
      default: 'pending' 
    },
    orderType: { 
      type: String, 
      enum: ['dine-in', 'takeaway', 'delivery'], 
      default: 'dine-in' 
    },
    status: { 
      type: String, 
      enum: ['new', 'preparing', 'ready', 'delivered', 'billed'], 
      default: 'new' 
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model('Order', orderSchema);