import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    flavourMentioned: {
      type: String,
      default: '',
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeaturedOnHome: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model('Review', reviewSchema);
