import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import busRoutes from './routes/busRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import mockPaymentRoutes from './routes/mockPaymentRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const BASE_PORT = Number(process.env.PORT) || 5000;

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};

// Connect to MongoDB
connectDB();

// CORS should run before any middleware that may short-circuit (rate limit/auth/etc.)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security HTTP headers
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false,
  })
);

// Sanitize data — prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiting — general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use(generalLimiter);

// Rate limiting — auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 15 : 200,
  skip: (req) => {
    if (req.method === 'OPTIONS') return true;
    if (process.env.NODE_ENV === 'production') return false;
    const ip = String(req.ip || '');
    return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.0.0.1');
  },
  message: { success: false, message: 'Too many authentication attempts, please try again later' }
});

// ============================================
// GENERAL MIDDLEWARE
// ============================================

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ DriveX Backend is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api', mockPaymentRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate value for: ${field}`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired'
    });
  }

  // Default
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

let server;

const startServer = (port) => {
  server = app
    .listen(port, () => {
      console.log(`
╔════════════════════════════════════════════╗
║    🚌 DRIVEX BACKEND SERVER             ║
║    http://localhost:${port}                 ║
║    Environment: ${process.env.NODE_ENV || 'development'}             ║
╚════════════════════════════════════════════╝
  `);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.warn(`⚠️ Port ${port} is already in use. Retrying on ${nextPort}...`);
        startServer(nextPort);
        return;
      }

      throw err;
    });
};

startServer(BASE_PORT);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
