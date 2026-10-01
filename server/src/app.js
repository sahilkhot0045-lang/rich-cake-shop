import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import deliverySlotRoutes from './routes/deliverySlotRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customCakeRoutes from './routes/customCakeRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import storeSettingsRoutes from './routes/storeSettingsRoutes.js';
import paymentWebhookRoutes from './routes/paymentWebhookRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const createApp = () => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  // CORS Configuration
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow dev tooling & Vercel previews
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'x-razorpay-signature'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Health Check Endpoints
  const healthHandler = (req, res) => {
    res.status(200).json({
      status: 'healthy',
      app: 'Rich Cake Shop API',
      timestamp: new Date().toISOString(),
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Versioned API v1 Router
  const apiV1 = express.Router();
  apiV1.get('/health', healthHandler);
  apiV1.use('/auth', authRoutes);
  apiV1.use('/addresses', addressRoutes);
  apiV1.use('/categories', categoryRoutes);
  apiV1.use('/products', productRoutes);
  apiV1.use('/cart', cartRoutes);
  apiV1.use('/delivery', deliverySlotRoutes);
  apiV1.use('/orders', orderRoutes);
  apiV1.use('/custom-cakes', customCakeRoutes);
  apiV1.use('/reviews', reviewRoutes);
  apiV1.use('/store-settings', storeSettingsRoutes);
  apiV1.use('/payments/webhook', paymentWebhookRoutes);
  apiV1.use('/admin', adminRoutes);

  app.use('/api/v1', apiV1);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
