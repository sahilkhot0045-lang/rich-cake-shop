import express from 'express';
import {
  submitCustomCakeRequest,
  getMyCustomRequests,
  getRequestById,
  addCommunicationNote,
  customerAcceptQuoteAndPay,
} from '../controllers/customCakeController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { customCakeRequestSchema } from '../validators/index.js';

const router = express.Router();

router.post('/', optionalAuth, validate(customCakeRequestSchema), submitCustomCakeRequest);
router.get('/my-requests', requireAuth, getMyCustomRequests);
router.get('/:id', optionalAuth, getRequestById);
router.post('/:id/notes', optionalAuth, addCommunicationNote);
router.post('/:id/accept-quote', optionalAuth, customerAcceptQuoteAndPay);

export default router;
