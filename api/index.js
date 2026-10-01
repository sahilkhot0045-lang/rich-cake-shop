import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { Product } from '../server/src/models/Product.js';
import { runSeed } from '../server/src/seed/seed.js';

let app = null;
let isSeeded = false;

export default async function handler(req, res) {
  try {
    // 1. Connect to MongoDB (reuses cached connection on warm lambdas)
    await connectDB();

    // 2. Auto-seed initial catalogue if cloud database is empty
    if (!isSeeded) {
      try {
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
          console.log('[Rich Cake Shop Vercel] Fresh database detected. Seeding initial catalogue...');
          await runSeed();
        }
      } catch (seedErr) {
        console.warn('[Rich Cake Shop Vercel] Auto-seed check notice:', seedErr.message);
      }
      isSeeded = true;
    }

    // 3. Lazy initialize Express application
    if (!app) {
      app = createApp();
    }

    // 4. Delegate to Express app
    return app(req, res);
  } catch (error) {
    console.error('[Rich Cake Shop Vercel API Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Serverless Execution Error',
      hint: process.env.MONGODB_URI
        ? undefined
        : 'Please set your MONGODB_URI environment variable in your Vercel Project Settings.',
    });
  }
}
