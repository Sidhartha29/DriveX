import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingsByBus,
  getDriverAssignedBookings,
  markPassengerBoarded,
  cancelBooking,
  updatePaymentStatus
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Private routes - All require authentication
router.use(protect);

// Customer routes
router.post('/', authorizeRoles('customer'), createBooking);
router.get('/my', authorizeRoles('customer'), getMyBookings);
router.put('/:id/cancel', authorizeRoles('customer', 'admin'), cancelBooking);
router.put('/:id/payment', authorizeRoles('admin'), updatePaymentStatus);

// Manager/Admin routes
router.get('/bus/:busId', authorizeRoles('manager', 'admin'), getBookingsByBus);

// Driver routes
router.get('/driver/assigned', authorizeRoles('driver'), getDriverAssignedBookings);
router.put('/:id/board', authorizeRoles('driver'), markPassengerBoarded);

// Get booking by ID (any authenticated user for their own booking)
router.get('/:id', getBookingById);

export default router;
