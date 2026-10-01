import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { Product } from './models/Product.js';
import { runSeed } from './seed/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty (e.g. fresh memory-server or first run)
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Rich Cake Shop Server] Database empty. Seeding initial baseline catalogue...');
      await runSeed();
    }

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`[Rich Cake Shop Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[Rich Cake Shop Server] API base: http://localhost:${PORT}/api/v1`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Rich Cake Shop Server] Error: Port ${PORT} is already in use by another running process.`);
        console.error(`Fix: Close the previous terminal or double-click 'run.bat' which automatically frees port ${PORT}.\n`);
      } else {
        console.error('[Rich Cake Shop Server Error]:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('[Rich Cake Shop Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();
