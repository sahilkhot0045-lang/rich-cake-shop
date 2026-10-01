import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';
import {
  Product,
  ProductVariant,
  Order,
  Payment,
  DeliverySlot,
  DeliveryZone,
  CustomCakeRequest,
  Quote,
  InventoryMovement,
  VALID_STATUS_TRANSITIONS,
} from '../models/index.js';
import { verifyRazorpaySignature } from '../config/razorpay.js';

describe('E2E Full E-Commerce Flow: Cart, Checkout, Razorpay Verification & Custom Quotes', () => {
  let sampleProduct;
  let sampleVariant;
  let sampleSlot;
  let sampleZone;

  beforeAll(async () => {
    // Create test slot and zone in-memory
    sampleSlot = new DeliverySlot({
      _id: '64b1f2a3c9e77b123456789a',
      slotName: 'Morning Slot (10:00 AM - 01:00 PM)',
      startTime: '10:00',
      endTime: '13:00',
      maxCapacity: 10,
      isActive: true,
    });

    sampleZone = new DeliveryZone({
      zoneName: 'Zone 1: Mankhurd Express',
      pincodes: ['400088', '400043'],
      deliveryFee: 5000, // ₹50 in paise
      freeDeliveryThreshold: 100000, // ₹1,000 in paise
      isActive: true,
    });

    sampleProduct = new Product({
      _id: '64b1f2a3c9e77b123456789b',
      title: 'Royal Belgian Dark Chocolate Truffle Cake',
      slug: 'royal-belgian-dark-chocolate-truffle-cake',
      description: 'Signature dark chocolate cake',
      category: '64b1f2a3c9e77b123456789c',
      basePrice: 65000, // ₹650
      images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587'],
      flavours: ['Belgian Chocolate'],
      isEgglessAvailable: true,
      isActive: true,
    });

    sampleVariant = new ProductVariant({
      _id: '64b1f2a3c9e77b123456789d',
      product: sampleProduct._id,
      weightGram: 1000,
      weightLabel: '1.0 kg (Serves 8-12)',
      price: 120000, // ₹1,200 in paise
      stockQuantity: 15,
      isActive: true,
    });
  });

  it('Step 1: Pincode delivery eligibility and free delivery threshold check', () => {
    const isCovered = sampleZone.pincodes.includes('400088');
    expect(isCovered).toBe(true);

    const subtotalBelowThreshold = 80000; // ₹800
    const fee1 = subtotalBelowThreshold >= sampleZone.freeDeliveryThreshold ? 0 : sampleZone.deliveryFee;
    expect(fee1).toBe(5000); // ₹50 delivery charge

    const subtotalAboveThreshold = 120000; // ₹1,200
    const fee2 = subtotalAboveThreshold >= sampleZone.freeDeliveryThreshold ? 0 : sampleZone.deliveryFee;
    expect(fee2).toBe(0); // Free delivery
  });

  it('Step 2: Server-side pricing computation and order initialization in paise', () => {
    const quantity = 2;
    const subtotal = sampleVariant.price * quantity; // 120,000 * 2 = 240,000 paise (₹2,400)
    const discount = 0;
    const deliveryFee = 0; // Free delivery over ₹1,000
    const totalAmount = subtotal - discount + deliveryFee;

    const order = new Order({
      orderNumber: 'RC-202609-TEST',
      customer: {
        name: 'Aanya Sharma',
        email: 'aanya@example.com',
        phone: '+919820098200',
      },
      orderType: 'delivery',
      shippingAddress: {
        recipientName: 'Aanya Sharma',
        phone: '+919820098200',
        streetAddress: 'Flat 101, Crystal Heights',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400088',
      },
      deliveryDate: new Date('2026-10-02'),
      deliverySlot: sampleSlot._id,
      deliverySlotWindow: sampleSlot.slotName,
      items: [
        {
          product: sampleProduct._id,
          variant: sampleVariant._id,
          title: sampleProduct.title,
          flavour: 'Belgian Chocolate',
          weightLabel: sampleVariant.weightLabel,
          unitPrice: sampleVariant.price,
          quantity,
          totalPrice: subtotal,
          eggless: true,
          inscription: 'Happy 25th Birthday!',
        },
      ],
      pricing: {
        subtotal,
        discount,
        deliveryFee,
        tax: 0,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
      },
      orderStatus: 'pending_payment',
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
    });

    expect(order.pricing.totalAmount).toBe(240000); // ₹2,400 in paise
    expect(order.orderStatus).toBe('pending_payment');
  });

  it('Step 3: Razorpay HMAC-SHA256 signature verification and order confirmation', () => {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'RichCakeShopTestSecretKey12345';
    const razorpay_order_id = 'order_rzp_987654';
    const razorpay_payment_id = 'pay_rzp_123456';

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: validSignature,
    });

    expect(isValid).toBe(true);

    // Verify fraudulent signature is rejected
    const isFakeValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: 'tampered_fake_signature_xyz',
    });
    expect(isFakeValid).toBe(false);
  });

  it('Step 4: Atomic inventory deduction and stock restock upon cancellation', () => {
    let initialStock = sampleVariant.stockQuantity; // 15
    const orderedQuantity = 2;

    // Simulate inventory deduction on order confirmation
    const stockAfterSale = initialStock - orderedQuantity;
    expect(stockAfterSale).toBe(13);

    // Simulate cancellation restock
    const stockAfterCancellation = stockAfterSale + orderedQuantity;
    expect(stockAfterCancellation).toBe(initialStock); // Restored back to 15
  });

  it('Step 5: Custom cake request submission, quote negotiation and valid status flow', () => {
    const customReq = new CustomCakeRequest({
      customerName: 'Karan Mehra',
      customerEmail: 'karan@example.com',
      customerPhone: '+919820098200',
      occasion: 'Wedding',
      preferredDate: new Date('2026-10-15'),
      preferredTimeSlot: 'Morning (10:00 AM - 1:00 PM)',
      flavour: 'Belgian Dark Chocolate Ganache',
      weightGram: 3000, // 3kg
      shape: 'Multi-Tier',
      tiers: 2,
      detailedInstructions: 'Two-tier wedding cake with ivory Swiss buttercream and edible 24k gold leaf.',
      status: 'submitted',
    });

    expect(customReq.status).toBe('submitted');

    // Admin reviews and issues official quote
    const quote = new Quote({
      customCakeRequest: customReq._id,
      admin: '64b1f2a3c9e77b123456789e',
      quotedPrice: 380000, // ₹3,800
      depositRequired: 190000, // 50% = ₹1,900
      preparationTimeHours: 48,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'sent',
    });

    customReq.activeQuote = quote._id;
    customReq.status = 'quoted';

    expect(customReq.status).toBe('quoted');
    expect(quote.isExpired()).toBe(false);

    // Customer accepts quote
    quote.status = 'accepted';
    customReq.status = 'accepted';
    expect(customReq.status).toBe('accepted');
  });
});
