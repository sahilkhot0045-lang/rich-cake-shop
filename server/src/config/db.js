import mongoose from 'mongoose';

let mongoMemoryServer = null;

// Cache connection across serverless invocations (global singleton in Node.js)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const isVercel = Boolean(process.env.VERCEL);
  const isProd = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI;

  // In Vercel or Production, require a live cloud MongoDB (like MongoDB Atlas)
  if (isVercel || (isProd && uri && !uri.includes('127.0.0.1') && !uri.includes('localhost'))) {
    if (!uri) {
      throw new Error(
        'Missing MONGODB_URI environment variable! In production/Vercel, a MongoDB Atlas connection string is required. ' +
        'Please add MONGODB_URI in your Vercel Project Settings > Environment Variables.'
      );
    }

    if (!cached.promise) {
      cached.promise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      }).then((m) => m);
    }

    try {
      cached.conn = await cached.promise;
      console.log(`[Database] Connected to MongoDB Atlas (${cached.conn.connection.host})`);
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      console.error(`[Database] MongoDB Atlas connection error: ${err.message}`);
      throw err;
    }
  }

  // Local development fallback
  const localUri = uri || 'mongodb://127.0.0.1:27017/rich_cake_shop';
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected to local MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (directErr) {
    console.warn(`[Database] Local MongoDB at ${localUri} unavailable (${directErr.message}). Launching in-memory MongoDB...`);
    try {
      // Dynamic import ensures mongodb-memory-server is never required in production builds
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to MongoMemoryServer at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] In-memory MongoDB error: ${memErr.message}`);
      throw memErr;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    cached.conn = null;
    cached.promise = null;
    console.log('[Database] Disconnected successfully');
  } catch (error) {
    console.error(`[Database] Disconnect Error: ${error.message}`);
  }
};
