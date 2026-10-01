import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  priceSnapshot: {
    type: Number, // In paise
    required: true,
  },
  eggless: {
    type: Boolean,
    default: true,
  },
  flavour: {
    type: String,
    required: true,
  },
  inscription: {
    type: String,
    maxlength: 100,
    default: '',
  },
  specialInstructions: {
    type: String,
    maxlength: 300,
    default: '',
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    items: [cartItemSchema],
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model('Cart', cartSchema);
