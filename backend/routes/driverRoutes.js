import express from 'express';
import { getMyDriverNotifications, getMyDrivers } from '../controllers/driverController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my', authorizeRoles('manager', 'admin'), getMyDrivers);
router.get('/me/notifications', authorizeRoles('driver'), getMyDriverNotifications);

export default router;
