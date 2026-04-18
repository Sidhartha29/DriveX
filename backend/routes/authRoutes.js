import express from 'express';
import { register, login, driverLogin, adminPasswordLogin, firebaseAuth, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/driver-login', driverLogin);
router.post('/admin-password-login', adminPasswordLogin);
router.post('/firebase', firebaseAuth);

// Private routes
router.get('/me', protect, getCurrentUser);

export default router;
