import express from 'express';
import { getProductReviews, getHomeTestimonials, submitReview } from '../controllers/reviewController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validators/index.js';

const router = express.Router();

router.get('/testimonials/home', getHomeTestimonials);
router.get('/product/:productId', getProductReviews);
router.post('/', optionalAuth, validate(reviewSchema), submitReview);

export default router;
