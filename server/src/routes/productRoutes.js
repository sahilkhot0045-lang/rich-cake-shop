import express from 'express';
import { getProducts, getProductBySlug, checkPincodeEligibility } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/check-pincode', checkPincodeEligibility);
router.get('/:slug', getProductBySlug);

export default router;
