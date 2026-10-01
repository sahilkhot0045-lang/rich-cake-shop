import express from 'express';
import {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  exportOrdersCSV,
  getAdminCustomQuotes,
  issueCustomQuote,
  getAdminReviews,
  moderateReview,
  updateStoreSettings,
  manageDeliveryZones,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAdminAuditLogs,
  getInventoryMovements,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateOrderStatusSchema, createQuoteSchema } from '../validators/index.js';

const router = express.Router();

// Enforce admin authorization on all routes
router.use(requireAuth, requireAdmin);

// Analytics
router.get('/dashboard', getDashboardStats);

// Products
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAdminOrders);
router.get('/orders/export/csv', exportOrdersCSV);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

// Custom Cake Quotes
router.get('/custom-quotes', getAdminCustomQuotes);
router.post('/custom-quotes/:id/quote', validate(createQuoteSchema), issueCustomQuote);

// Reviews Moderation
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/moderate', moderateReview);

// Store Configuration
router.put('/store-settings', updateStoreSettings);
router.put('/delivery-zones', manageDeliveryZones);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Audit & Inventory
router.get('/audit-logs', getAdminAuditLogs);
router.get('/inventory-logs', getInventoryMovements);

export default router;
