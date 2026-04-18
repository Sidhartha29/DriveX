import mongoose from 'mongoose';

let retryTimer = null;

const scheduleReconnect = (attempt) => {
  const delayMs = Math.min(30000, attempt * 5000);
  if (retryTimer) {
    clearTimeout(retryTimer);
  }

  console.log(`🔄 Retrying MongoDB connection in ${delayMs / 1000}s (attempt ${attempt})...`);
  retryTimer = setTimeout(() => {
    connectDB(attempt + 1);
  }, delayMs);
};

const connectDB = async (attempt = 1) => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI is not set');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });

    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('⚠️ Server will continue without DB. Check MongoDB Atlas IP whitelist and URI.');
    scheduleReconnect(attempt);
    return null;
  }
};

export default connectDB;
