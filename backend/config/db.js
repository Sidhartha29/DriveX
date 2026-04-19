import mongoose from 'mongoose';
import logger from '../utils/logger.js';

let retryTimer = null;
let listenersRegistered = false;

const registerMongooseListeners = () => {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB runtime error', { error: error.message });
  });
};

const scheduleReconnect = (attempt) => {
  const delayMs = Math.min(30000, attempt * 5000);
  if (retryTimer) {
    clearTimeout(retryTimer);
  }

  logger.warn('Retrying MongoDB connection', {
    delaySeconds: delayMs / 1000,
    attempt
  });
  retryTimer = setTimeout(() => {
    connectDB(attempt + 1);
  }, delayMs);
};

const connectDB = async (attempt = 1) => {
  try {
    registerMongooseListeners();

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

    logger.info('MongoDB connected', { host: conn.connection.host });
    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message, attempt });
    logger.warn('Server will continue without DB. Check MongoDB Atlas IP whitelist and URI.');
    scheduleReconnect(attempt);
    return null;
  }
};

export default connectDB;
