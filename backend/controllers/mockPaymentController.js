import Booking from '../models/Booking.js';
import { saveTransaction } from '../services/transactionService.js';

const PAYMENT_METHODS = ['UPI', 'Card', 'Wallet'];

// @desc    Process mock payment
// @route   POST /api/mock-payment
// @access  Private (Customer)
export const processMockPayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;

    if (!bookingId || !method || !PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookingId or payment method',
        transactionId: ''
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        transactionId: ''
      });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this booking',
        transactionId: ''
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for cancelled booking',
        transactionId: ''
      });
    }

    const isSuccess = Math.random() < 0.8;
    const payableAmount = Number.isFinite(Number(amount)) ? Number(amount) : Number(booking.totalPrice || 0);

    const transaction = await saveTransaction({
      userId: req.user.id,
      bookingId: booking._id,
      amount: payableAmount,
      method,
      status: isSuccess ? 'SUCCESS' : 'FAILED'
    });

    if (isSuccess) {
      booking.paymentStatus = 'completed';
      booking.paymentId = transaction.transactionId;
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Payment Successful',
        transactionId: transaction.transactionId
      });
    }

    if (booking.paymentStatus === 'pending') {
      booking.paymentStatus = 'failed';
      await booking.save();
    }

    return res.status(200).json({
      success: false,
      message: 'Payment Failed',
      transactionId: transaction.transactionId
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      transactionId: ''
    });
  }
};

export default {
  processMockPayment
};
