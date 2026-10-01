import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpaySignature: String,
    amount: {
      type: Number, // In paise
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    method: {
      type: String,
      default: 'upi',
    },
    idempotentKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    webhookEventId: {
      type: String,
      unique: true,
      sparse: true,
    },
    errorDescription: String,
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
