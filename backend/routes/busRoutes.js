import express from 'express';
import {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  assignDriverToBus,
  deleteBus,
  getAvailableSeats,
  getBookingPrice,
  updateBusLiveLocation,
  getBusLiveLocation,
  getMyLiveBuses,
  getOpsLiveBuses
} from '../controllers/busController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Shared live-tracking routes
router.get('/live/my', protect, authorizeRoles('customer'), getMyLiveBuses);
router.get('/live', protect, authorizeRoles('manager', 'admin'), getOpsLiveBuses);
router.get('/:id/live-location', protect, authorizeRoles('customer', 'manager', 'admin', 'driver'), getBusLiveLocation);
router.put('/:id/live-location', protect, authorizeRoles('driver', 'manager', 'admin'), updateBusLiveLocation);

// Public routes
router.get('/', getBuses);
router.get('/:id', getBusById);
router.get('/:id/available-seats', getAvailableSeats);
router.get('/:id/price', getBookingPrice);

// Private routes (Manager/Admin)
router.post('/', protect, authorizeRoles('manager', 'admin'), createBus);
router.put('/:id', protect, authorizeRoles('manager', 'admin'), updateBus);
router.put('/:id/assign-driver', protect, authorizeRoles('manager', 'admin'), assignDriverToBus);
router.delete('/:id', protect, authorizeRoles('admin'), deleteBus);

export default router;
