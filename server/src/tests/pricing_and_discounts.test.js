import { describe, it, expect } from 'vitest';
import { Coupon } from '../models/Coupon.js';

describe('Pricing, Currency in Paise, and Coupon Calculations', () => {
  it('should accurately calculate percentage discount up to max discount cap', () => {
    const coupon = new Coupon({
      code: 'TESTPERCENT',
      discountType: 'percentage',
      discountValue: 10, // 10%
      minOrderValue: 50000, // ₹500 in paise
      maxDiscountAmount: 20000, // max ₹200 (20000 paise)
      validUntil: new Date(Date.now() + 100000),
      isActive: true,
    });

    // Subtotal: ₹1,000 (100000 paise) -> 10% = ₹100 (10000 paise)
    const discount1 = coupon.calculateDiscount(100000);
    expect(discount1).toBe(10000);

    // Subtotal: ₹3,000 (300000 paise) -> 10% = 30000 paise, but capped at 20000 paise
    const discount2 = coupon.calculateDiscount(300000);
    expect(discount2).toBe(20000);
  });

  it('should accurately apply fixed amount discount without exceeding order subtotal', () => {
    const coupon = new Coupon({
      code: 'TESTFIXED',
      discountType: 'fixed_amount',
      discountValue: 5000, // ₹50 in paise
      minOrderValue: 40000, // ₹400 in paise
      validUntil: new Date(Date.now() + 100000),
      isActive: true,
    });

    const discount = coupon.calculateDiscount(60000);
    expect(discount).toBe(5000);

    // If order subtotal is below minimum order value, validation fails
    const validation = coupon.isValidForOrder(30000);
    expect(validation.valid).toBe(false);
    expect(validation.message).toContain('Minimum order amount');
  });

  it('should reject expired or inactive coupons', () => {
    const expiredCoupon = new Coupon({
      code: 'EXPIRED',
      discountType: 'percentage',
      discountValue: 15,
      validUntil: new Date(Date.now() - 5000),
      isActive: true,
    });

    expect(expiredCoupon.isValidForOrder(100000).valid).toBe(false);

    const inactiveCoupon = new Coupon({
      code: 'INACTIVE',
      discountType: 'percentage',
      discountValue: 15,
      validUntil: new Date(Date.now() + 50000),
      isActive: false,
    });

    expect(inactiveCoupon.isValidForOrder(100000).valid).toBe(false);
  });
});
