import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true, // If percentage: e.g. 15 for 15%. If fixed: in paise (e.g. 10000 for ₹100)
    },
    minOrderValue: {
      type: Number, // In paise
      default: 0,
    },
    maxDiscountAmount: {
      type: Number, // In paise
      default: 0, // 0 = unlimited
    },
    usageLimit: {
      type: Number,
      default: 1000,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.methods.isValidForOrder = function (orderSubtotalInPaise) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is no longer active' };
  if (now < this.validFrom) return { valid: false, message: 'Coupon is not yet active' };
  if (now > this.validUntil) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached' };
  }
  if (orderSubtotalInPaise < this.minOrderValue) {
    const minRs = (this.minOrderValue / 100).toFixed(0);
    return { valid: false, message: `Minimum order amount of ₹${minRs} is required for this coupon` };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (subtotalInPaise) {
  if (this.discountType === 'percentage') {
    let discount = Math.round((subtotalInPaise * this.discountValue) / 100);
    if (this.maxDiscountAmount > 0 && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
    return discount;
  }
  // fixed amount in paise
  return Math.min(this.discountValue, subtotalInPaise);
};

export const Coupon = mongoose.model('Coupon', couponSchema);
