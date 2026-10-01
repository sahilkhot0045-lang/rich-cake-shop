import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
} from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/index.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getCart);
router.post('/items', validate(addToCartSchema), addItemToCart);
router.put('/items/:itemId', validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.post('/apply-coupon', applyCoupon);
router.delete('/remove-coupon', removeCoupon);

export default router;
