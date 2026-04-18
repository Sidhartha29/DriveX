import express from 'express';
import {
  getMyWallet,
  topUpWallet,
  mockTopUpWallet,
  createMockTopUpOrder,
  mockGatewayCallback,
  getMockTopUpStatus,
  getMyWalletTransactions
} from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('customer'));

router.get('/me', getMyWallet);
router.post('/topup', topUpWallet);
router.post('/mock-topup', mockTopUpWallet);
router.post('/mock-topup/order', createMockTopUpOrder);
router.post('/mock-topup/callback', mockGatewayCallback);
router.get('/mock-topup/:orderId/status', getMockTopUpStatus);
router.get('/transactions', getMyWalletTransactions);

export default router;
