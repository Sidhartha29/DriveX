import mongoose from 'mongoose';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import WalletTopUpOrder from '../models/WalletTopUpOrder.js';
import crypto from 'crypto';

const verifySignature = (payload, providedSignature, secret) => {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(String(providedSignature || ''), 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

const isDuplicateKeyError = (error) => Number(error?.code) === 11000;

const topupSuccessFilter = {
  $or: [
    { 'notes.status': { $exists: false } },
    { 'notes.status': { $ne: 'failed' } }
  ]
};

// @desc    Get wallet summary for logged-in customer
// @route   GET /api/wallet/me
// @access  Private (Customer)
export const getMyWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email walletBalance role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const recentTransactions = await WalletTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const lowBalanceAlert = user.walletBalance < 200
      ? `Low wallet balance: ₹${user.walletBalance.toFixed(2)}. Please add money to continue booking.`
      : null;

    res.status(200).json({
      success: true,
      data: {
        walletBalance: user.walletBalance,
        lowBalanceAlert,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet details',
      error: error.message
    });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallet/topup
// @access  Private (Customer)
export const topUpWallet = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const amount = Number(req.body?.amount);
    const paymentReference = String(req.body?.paymentReference || '').trim();
    const gatewayOrderId = String(req.body?.gatewayOrderId || '').trim();
    const gatewayPaymentId = String(req.body?.gatewayPaymentId || '').trim();
    const gatewaySignature = String(req.body?.gatewaySignature || '').trim();
    const gatewaySecret = process.env.PAYMENT_GATEWAY_SECRET;
    const allowInsecureTopup = process.env.ALLOW_INSECURE_WALLET_TOPUP === 'true' && process.env.NODE_ENV !== 'production';

    if (!gatewaySecret && !allowInsecureTopup) {
      return res.status(503).json({
        success: false,
        message: 'Wallet top-up is not configured. Missing payment gateway secret.'
      });
    }

    if (!paymentReference || paymentReference.length < 8 || paymentReference.length > 64) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment reference is required'
      });
    }

    if (!Number.isFinite(amount) || amount < 100 || amount > 20000) {
      return res.status(400).json({
        success: false,
        message: 'Top-up amount must be between ₹100 and ₹20,000'
      });
    }

    if (!allowInsecureTopup && (!gatewayOrderId || !gatewayPaymentId || !gatewaySignature)) {
      return res.status(400).json({
        success: false,
        message: 'Gateway payment details are required for verification'
      });
    }

    if (!allowInsecureTopup) {
      const signaturePayload = `${gatewayOrderId}|${gatewayPaymentId}`;
      const isSignatureValid = verifySignature(signaturePayload, gatewaySignature, gatewaySecret);
      if (!isSignatureValid) {
        return res.status(401).json({
          success: false,
          message: 'Payment verification failed. Top-up not processed.'
        });
      }
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let updatedWalletBalance = 0;

    await session.withTransaction(async () => {
      const existingReference = await WalletTransaction.findOne({ externalReference: paymentReference }).session(session);
      if (existingReference) {
        const duplicateErr = new Error('Duplicate payment reference. This top-up is already processed.');
        duplicateErr.statusCode = 409;
        throw duplicateErr;
      }

      const [todaysTopups] = await WalletTransaction.aggregate([
        {
          $match: {
            userId: userIdToObjectId(req.user.id),
            type: 'topup',
            createdAt: { $gte: startOfDay },
            ...topupSuccessFilter
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]).session(session);

      const dailyTotal = Number(todaysTopups?.total || 0);
      if (dailyTotal + amount > 50000) {
        const limitErr = new Error('Daily top-up limit exceeded (₹50,000). Please try again tomorrow.');
        limitErr.statusCode = 400;
        throw limitErr;
      }

      const user = await User.findById(req.user.id).select('walletBalance').session(session);
      if (!user) {
        const notFoundErr = new Error('User not found');
        notFoundErr.statusCode = 404;
        throw notFoundErr;
      }

      const before = Number(user.walletBalance || 0);
      const after = before + amount;
      user.walletBalance = after;
      await user.save({ session });

      await WalletTransaction.create([{
        userId: req.user.id,
        type: 'topup',
        amount,
        balanceBefore: before,
        balanceAfter: after,
        description: `Wallet top-up of ₹${amount.toFixed(2)}`,
        externalReference: paymentReference,
        notes: {
          gatewayOrderId,
          gatewayPaymentId,
          status: 'success'
        },
        performedBy: req.user.id
      }], { session });

      updatedWalletBalance = after;
    });

    res.status(200).json({
      success: true,
      message: 'Wallet top-up successful',
      data: {
        walletBalance: updatedWalletBalance
      }
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate payment reference. This top-up is already processed.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to top up wallet',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Mock add money to wallet (simulation only)
// @route   POST /api/wallet/mock-topup
// @access  Private (Customer)
export const mockTopUpWallet = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const amount = Number(req.body?.amount);
    const paymentReference = String(req.body?.paymentReference || '').trim();

    if (!paymentReference || paymentReference.length < 8 || paymentReference.length > 64) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment reference is required'
      });
    }

    if (!Number.isFinite(amount) || amount < 100 || amount > 20000) {
      return res.status(400).json({
        success: false,
        message: 'Top-up amount must be between ₹100 and ₹20,000'
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const isSuccess = Math.random() < 0.8;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let responsePayload = null;

    await session.withTransaction(async () => {
      const existingReference = await WalletTransaction.findOne({ externalReference: paymentReference }).session(session);
      if (existingReference) {
        const duplicateErr = new Error('Duplicate payment reference. This top-up is already processed.');
        duplicateErr.statusCode = 409;
        throw duplicateErr;
      }

      const user = await User.findById(req.user.id).select('walletBalance').session(session);
      if (!user) {
        const notFoundErr = new Error('User not found');
        notFoundErr.statusCode = 404;
        throw notFoundErr;
      }

      if (!isSuccess) {
        const balance = Number(user.walletBalance || 0);
        await WalletTransaction.create([{
          userId: req.user.id,
          type: 'topup',
          amount,
          balanceBefore: balance,
          balanceAfter: balance,
          description: `Mock wallet top-up failed for ₹${amount.toFixed(2)}`,
          externalReference: paymentReference,
          notes: {
            mockPayment: true,
            status: 'failed'
          },
          performedBy: req.user.id
        }], { session });

        responsePayload = {
          success: false,
          message: 'Payment Failed',
          data: {
            walletBalance: balance
          }
        };
        return;
      }

      const [todaysTopups] = await WalletTransaction.aggregate([
        {
          $match: {
            userId: userIdToObjectId(req.user.id),
            type: 'topup',
            createdAt: { $gte: startOfDay },
            ...topupSuccessFilter
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]).session(session);

      const dailyTotal = Number(todaysTopups?.total || 0);
      if (dailyTotal + amount > 50000) {
        const limitErr = new Error('Daily top-up limit exceeded (₹50,000). Please try again tomorrow.');
        limitErr.statusCode = 400;
        throw limitErr;
      }

      const before = Number(user.walletBalance || 0);
      const after = before + amount;
      user.walletBalance = after;
      await user.save({ session });

      await WalletTransaction.create([{
        userId: req.user.id,
        type: 'topup',
        amount,
        balanceBefore: before,
        balanceAfter: after,
        description: `Mock wallet top-up of ₹${amount.toFixed(2)}`,
        externalReference: paymentReference,
        notes: {
          mockPayment: true,
          status: 'success'
        },
        performedBy: req.user.id
      }], { session });

      responsePayload = {
        success: true,
        message: 'Payment Successful',
        data: {
          walletBalance: after
        }
      };
    });

    return res.status(200).json(responsePayload);
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate payment reference. This top-up is already processed.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to top up wallet',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Create mock top-up payment order
// @route   POST /api/wallet/mock-topup/order
// @access  Private (Customer)
export const createMockTopUpOrder = async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    const paymentReference = String(req.body?.paymentReference || '').trim();

    if (!paymentReference || paymentReference.length < 8 || paymentReference.length > 64) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment reference is required'
      });
    }

    if (!Number.isFinite(amount) || amount < 100 || amount > 20000) {
      return res.status(400).json({
        success: false,
        message: 'Top-up amount must be between ₹100 and ₹20,000'
      });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const order = await WalletTopUpOrder.create({
      userId: req.user.id,
      amount,
      paymentReference,
      status: 'PENDING',
      expiresAt
    });

    return res.status(201).json({
      success: true,
      message: 'Payment order created',
      data: {
        orderId: order.orderId,
        amount: order.amount,
        paymentReference: order.paymentReference,
        status: order.status,
        expiresAt: order.expiresAt,
        qrPayload: {
          type: 'wallet_topup',
          orderId: order.orderId,
          amount: order.amount,
          paymentReference: order.paymentReference
        }
      }
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate payment reference. This payment order is already created.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// @desc    Simulate mock payment gateway callback
// @route   POST /api/wallet/mock-topup/callback
// @access  Private (Customer)
export const mockGatewayCallback = async (req, res) => {
  try {
    const orderId = String(req.body?.orderId || '').trim();

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    const order = await WalletTopUpOrder.findOne({ orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    if (order.status === 'PAID') {
      const user = await User.findById(req.user.id).select('walletBalance');
      return res.status(200).json({
        success: true,
        message: 'Payment already processed',
        data: {
          orderId: order.orderId,
          status: order.status,
          walletBalance: Number(user?.walletBalance || 0)
        }
      });
    }

    if (order.status === 'FAILED' || order.status === 'EXPIRED') {
      const user = await User.findById(req.user.id).select('walletBalance');
      return res.status(200).json({
        success: false,
        message: `Payment ${order.status.toLowerCase()}`,
        data: {
          orderId: order.orderId,
          status: order.status,
          walletBalance: Number(user?.walletBalance || 0)
        }
      });
    }

    if (new Date(order.expiresAt).getTime() < Date.now()) {
      order.status = 'EXPIRED';
      await order.save();

      const user = await User.findById(req.user.id).select('walletBalance');
      return res.status(200).json({
        success: false,
        message: 'Payment order expired',
        data: {
          orderId: order.orderId,
          status: order.status,
          walletBalance: Number(user?.walletBalance || 0)
        }
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 1600));
    const isSuccess = Math.random() < 0.8;

    if (!isSuccess) {
      order.status = 'FAILED';
      order.gatewayTransactionId = `MOCKTXN-${crypto.randomUUID()}`;
      await order.save();

      const user = await User.findById(req.user.id).select('walletBalance');
      return res.status(200).json({
        success: false,
        message: 'Payment Failed',
        data: {
          orderId: order.orderId,
          status: order.status,
          walletBalance: Number(user?.walletBalance || 0)
        }
      });
    }

    const session = await mongoose.startSession();
    try {
      let walletBalanceAfter = 0;

      await session.withTransaction(async () => {
        const freshOrder = await WalletTopUpOrder.findOne({ orderId, userId: req.user.id }).session(session);
        if (!freshOrder) {
          const notFoundErr = new Error('Payment order not found');
          notFoundErr.statusCode = 404;
          throw notFoundErr;
        }

        if (freshOrder.status === 'PAID') {
          const existingTx = await WalletTransaction.findOne({ externalReference: freshOrder.paymentReference }).session(session);
          walletBalanceAfter = Number(existingTx?.balanceAfter || 0);
          return;
        }

        if (freshOrder.status !== 'PENDING') {
          const terminalErr = new Error(`Payment ${freshOrder.status.toLowerCase()}`);
          terminalErr.statusCode = 409;
          terminalErr.orderStatus = freshOrder.status;
          throw terminalErr;
        }

        const user = await User.findById(req.user.id).select('walletBalance').session(session);
        if (!user) {
          const userErr = new Error('User not found');
          userErr.statusCode = 404;
          throw userErr;
        }

        const before = Number(user.walletBalance || 0);
        const amount = Number(freshOrder.amount || 0);
        const after = before + amount;

        user.walletBalance = after;
        await user.save({ session });

        const gatewayTransactionId = freshOrder.gatewayTransactionId || `MOCKTXN-${crypto.randomUUID()}`;
        freshOrder.status = 'PAID';
        freshOrder.gatewayTransactionId = gatewayTransactionId;
        await freshOrder.save({ session });

        await WalletTransaction.create([{
          userId: req.user.id,
          type: 'topup',
          amount,
          balanceBefore: before,
          balanceAfter: after,
          description: `Mock wallet top-up of ₹${amount.toFixed(2)}`,
          externalReference: freshOrder.paymentReference,
          notes: {
            mockPayment: true,
            status: 'success',
            orderId: freshOrder.orderId,
            gatewayTransactionId
          },
          performedBy: req.user.id
        }], { session });

        walletBalanceAfter = after;
      });

      return res.status(200).json({
        success: true,
        message: 'Payment Successful',
        data: {
          orderId: order.orderId,
          status: 'PAID',
          walletBalance: walletBalanceAfter
        }
      });
    } catch (error) {
      if (error?.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error?.orderStatus) {
        const user = await User.findById(req.user.id).select('walletBalance');
        return res.status(200).json({
          success: false,
          message: error.message,
          data: {
            orderId: order.orderId,
            status: error.orderStatus,
            walletBalance: Number(user?.walletBalance || 0)
          }
        });
      }

      if (isDuplicateKeyError(error)) {
        const existingTx = await WalletTransaction.findOne({ externalReference: order.paymentReference });
        await WalletTopUpOrder.updateOne(
          { _id: order._id },
          { $set: { status: 'PAID', gatewayTransactionId: order.gatewayTransactionId || `MOCKTXN-${crypto.randomUUID()}` } }
        );

        return res.status(200).json({
          success: true,
          message: 'Payment already processed',
          data: {
            orderId: order.orderId,
            status: 'PAID',
            walletBalance: Number(existingTx?.balanceAfter || 0)
          }
        });
      }

      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment callback',
      error: error.message
    });
  }
};

// @desc    Get mock top-up order status
// @route   GET /api/wallet/mock-topup/:orderId/status
// @access  Private (Customer)
export const getMockTopUpStatus = async (req, res) => {
  try {
    const orderId = String(req.params?.orderId || '').trim();

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    const order = await WalletTopUpOrder.findOne({ orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    if (order.status === 'PENDING' && new Date(order.expiresAt).getTime() < Date.now()) {
      order.status = 'EXPIRED';
      await order.save();
    }

    const user = await User.findById(req.user.id).select('walletBalance');

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        paymentReference: order.paymentReference,
        walletBalance: Number(user?.walletBalance || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
};

const userIdToObjectId = (id) => {
  try {
    return User.db.base.Types.ObjectId(id);
  } catch {
    return null;
  }
};

// @desc    Get wallet transactions for logged-in user
// @route   GET /api/wallet/transactions
// @access  Private (Customer)
export const getMyWalletTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      WalletTransaction.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WalletTransaction.countDocuments({ userId: req.user.id })
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet transactions',
      error: error.message
    });
  }
};
