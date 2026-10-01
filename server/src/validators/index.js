import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const addressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  streetAddress: z.string().min(5, 'Street address is required'),
  landmark: z.string().optional().default(''),
  city: z.string().default('Mumbai'),
  state: z.string().default('Maharashtra'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit Indian PIN code'),
  addressType: z.enum(['home', 'work', 'other']).default('home'),
  isDefault: z.boolean().optional().default(false),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().min(1).default(1),
  eggless: z.boolean().default(true),
  flavour: z.string().min(1, 'Flavour choice is required'),
  inscription: z.string().max(100).optional().default(''),
  specialInstructions: z.string().max(300).optional().default(''),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
  specialInstructions: z.string().max(300).optional(),
});

export const customCakeRequestSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone is required'),
  occasion: z.string().min(1, 'Occasion is required'),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTimeSlot: z.string().default('Morning (10:00 AM - 1:00 PM)'),
  flavour: z.string().min(1, 'Flavour is required'),
  weightGram: z.number().min(1000, 'Minimum custom cake weight is 1000g (1kg)'),
  shape: z.enum(['Round', 'Square', 'Heart', 'Multi-Tier', 'Custom Sculpted']),
  tiers: z.number().int().min(1).max(5).default(1),
  colourTheme: z.string().default('Pastel Pink & Cream with Gold'),
  eggless: z.boolean().default(true),
  inscription: z.string().max(100).optional().default(''),
  dietaryRequests: z.string().optional().default(''),
  estimatedBudget: z.number().optional().default(0),
  detailedInstructions: z.string().min(10, 'Please provide detailed design instructions'),
  referenceImages: z.array(z.string()).optional().default([]),
});

export const createQuoteSchema = z.object({
  quotedPrice: z.number().min(100, 'Price must be positive in paise'),
  depositRequired: z.number().min(0, 'Deposit cannot be negative'),
  preparationTimeHours: z.number().int().min(1).default(48),
  validUntil: z.string().min(1, 'Validity date is required'),
  adminNotes: z.string().optional().default(''),
});

export const checkoutSchema = z.object({
  orderType: z.enum(['delivery', 'pickup']),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
  }),
  shippingAddress: z
    .object({
      recipientName: z.string().optional(),
      phone: z.string().optional(),
      streetAddress: z.string().optional(),
      landmark: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliverySlotId: z.string().min(1, 'Delivery slot is required'),
  paymentMethod: z.enum(['razorpay', 'cod', 'pay_on_pickup']),
  specialInstructions: z.string().optional().default(''),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
});

export const updateOrderStatusSchema = z.object({
  nextStatus: z.enum([
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded',
  ]),
  note: z.string().optional().default(''),
});

export const reviewSchema = z.object({
  productId: z.string().optional(),
  orderId: z.string().optional(),
  customerName: z.string().min(2, 'Name is required'),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Review must be at least 5 characters').max(1000),
  flavourMentioned: z.string().optional().default(''),
});
