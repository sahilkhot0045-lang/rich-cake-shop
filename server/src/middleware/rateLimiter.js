import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 40,
  message: {
    success: false,
    message: 'Too many checkout requests, please try again shortly.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
