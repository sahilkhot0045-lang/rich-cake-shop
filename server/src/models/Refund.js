import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    razorpayRefundId: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number, // In paise
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
      index: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Refund = mongoose.model('Refund', refundSchema);
