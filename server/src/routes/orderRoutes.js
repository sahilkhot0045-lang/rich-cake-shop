import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createOfflineOrder,
  trackOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkoutSchema, verifyPaymentSchema } from '../validators/index.js';
import { checkoutLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Order creation supports both guest checkout and logged-in accounts
router.post('/create-razorpay-order', checkoutLimiter, optionalAuth, createRazorpayOrder);
router.post('/verify-payment', checkoutLimiter, optionalAuth, validate(verifyPaymentSchema), verifyRazorpayPayment);
router.post('/create-offline-order', checkoutLimiter, optionalAuth, createOfflineOrder);

// Tracking is public with order number
router.get('/track/:orderNumber', trackOrder);

// Customer authenticated routes
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

export default router;
