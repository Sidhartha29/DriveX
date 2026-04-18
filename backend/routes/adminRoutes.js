import express from 'express';
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAnalytics,
  getBookingAnalytics,
  updatePricing,
  getWalletTransactions,
  getTripManifest
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorizeRoles('admin'));

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/booking-analytics', getBookingAnalytics);

// Pricing configuration
router.put('/pricing', updatePricing);

// Wallet transaction monitoring
router.get('/wallet-transactions', getWalletTransactions);

// Trip operations visibility
router.get('/trip-manifest', getTripManifest);

export default router;
