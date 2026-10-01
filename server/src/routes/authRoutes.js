import express from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateProfile);

export default router;
