import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema(
  {
    customCakeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomCakeRequest',
      required: true,
      index: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quotedPrice: {
      type: Number,
      required: [true, 'Quoted price in paise is required'],
      min: [0, 'Price cannot be negative'],
    },
    depositRequired: {
      type: Number,
      required: true,
      min: 0, // In paise
    },
    preparationTimeHours: {
      type: Number,
      required: true,
      default: 48,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['sent', 'accepted', 'rejected', 'expired', 'deposit_paid', 'fully_paid'],
      default: 'sent',
      index: true,
    },
    revisionNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Helper check for expiration
quoteSchema.methods.isExpired = function () {
  return new Date() > this.validUntil;
};

export const Quote = mongoose.model('Quote', quoteSchema);
