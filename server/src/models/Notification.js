import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order_update', 'quote_ready', 'payment_success', 'system'],
      default: 'order_update',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
