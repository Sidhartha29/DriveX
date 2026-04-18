import express from 'express';
import { processMockPayment } from '../controllers/mockPaymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/mock-payment', protect, authorizeRoles('customer'), processMockPayment);

export default router;
