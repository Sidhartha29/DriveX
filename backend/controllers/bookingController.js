import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Bus from '../models/Bus.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { calculatePrice, calculateRefund } from '../utils/priceCalculator.js';
import { generateQRCode } from '../utils/generateQR.js';

// @desc    Create new booking (atomic — prevents double-booking)
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { busId, seats, travelDate, passengerDetails } = req.body;

    // Validation
    if (!busId || !seats || !travelDate || !passengerDetails) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (busId, seats, travelDate, passengerDetails)'
      });
    }

    // Check if seats is array and has valid length
    if (!Array.isArray(seats) || seats.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat'
      });
    }

    // Check for duplicate seat numbers
    if (new Set(seats).size !== seats.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Duplicate seat numbers are not allowed'
      });
    }

    // Validate travel date
    const travel = new Date(travelDate);
    if (isNaN(travel.getTime())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid travel date format'
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (travel < now) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Travel date cannot be in the past'
      });
    }

    // Fetch bus to validate seat numbers
    const busCheck = await Bus.findById(busId).session(session);
    if (!busCheck) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Validate seat numbers are within range
    const invalidSeats = seats.filter(s => !Number.isInteger(s) || s < 1 || s > busCheck.totalSeats);
    if (invalidSeats.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Invalid seat numbers: ${invalidSeats.join(', ')}. Must be between 1 and ${busCheck.totalSeats}`
      });
    }

    // Calculate price server-side (never trust client price)
    const totalPrice = calculatePrice(busCheck.distance, busCheck.pricePerKm, seats.length);

    // Wallet check before booking
    const user = await User.findById(req.user.id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (Number(user.walletBalance || 0) < totalPrice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Required ₹${totalPrice.toFixed(2)}, available ₹${Number(user.walletBalance || 0).toFixed(2)}`
      });
    }

    // Atomically check and reserve seats — prevents double-booking
    const bus = await Bus.findOneAndUpdate(
      {
        _id: busId,
        bookedSeats: { $not: { $elemMatch: { $in: seats } } }
      },
      {
        $push: { bookedSeats: { $each: seats } }
      },
      {
        new: true,
        session
      }
    );

    if (!bus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'One or more selected seats are already booked. Please choose different seats.'
      });
    }

    // Create booking
    const boardingStatus = seats.map((seatNumber, index) => ({
      seatNumber,
      passengerName: passengerDetails[index]?.name || `Passenger ${index + 1}`,
      boarded: false
    }));

    const [booking] = await Booking.create([{
      userId: req.user.id,
      busId,
      seats,
      totalPrice,
      travelDate: travel,
      passengerDetails,
      boardingStatus,
      paymentStatus: 'completed'
    }], { session });

    const balanceBefore = Number(user.walletBalance || 0);
    const balanceAfter = balanceBefore - totalPrice;

    user.walletBalance = balanceAfter;
    await user.save({ session });

    await WalletTransaction.create([{
      userId: user._id,
      type: 'debit',
      amount: totalPrice,
      balanceBefore,
      balanceAfter,
      description: `Ticket booking payment for ${bus.from} to ${bus.to}`,
      relatedBookingId: booking._id,
      performedBy: user._id
    }], { session });

    // Generate QR code
    const qrCode = await generateQRCode(booking);
    booking.qrCode = qrCode;
    await booking.save({ session });

    await session.commitTransaction();

    // Populate references for response
    await booking.populate('userId', 'name email phone');
    await booking.populate({
      path: 'busId',
      select: 'busName from to departureTime arrivalTime driverId',
      populate: { path: 'driverId', select: 'name phone' }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
      walletBalance: balanceAfter,
      lowBalanceAlert:
        balanceAfter < 200
          ? `Low wallet balance: ₹${balanceAfter.toFixed(2)}. Please add money to continue booking.`
          : null
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my?page=1&limit=10
// @access  Private (Customer)
export const getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'busId',
        select: 'busName from to departureTime arrivalTime pricePerKm driverId',
        populate: { path: 'driverId', select: 'name phone' }
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Helper to safely extract userId from populated or unpopulated booking
const getBookingUserId = (booking) => {
  if (booking.userId && booking.userId._id) {
    return booking.userId._id.toString();
  }
  return booking.userId?.toString();
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate({
        path: 'busId',
        select: 'busName from to departureTime arrivalTime pricePerKm driverId',
        populate: { path: 'driverId', select: 'name phone' }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization — use helper for populated comparison
    const bookingUserId = getBookingUserId(booking);
    if (bookingUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// @desc    Get bookings for a bus (Manager)
// @route   GET /api/bookings/bus/:busId
// @access  Private (Manager)
export const getBookingsByBus = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bus = await Bus.findById(req.params.busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check authorization
    if (bus.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookings for this bus'
      });
    }

    const bookings = await Booking.find({ busId: req.params.busId })
      .populate('userId', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments({ busId: req.params.busId });

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// @desc    Get bookings for driver's assigned bus
// @route   GET /api/bookings/driver/assigned
// @access  Private (Driver)
export const getDriverAssignedBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const driver = await Driver.findById(req.user.id).populate('assignedBus', 'busName from to departureTime arrivalTime totalSeats');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (!driver.assignedBus) {
      return res.status(200).json({
        success: true,
        data: {
          bus: null,
          bookings: []
        },
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          pages: 0
        }
      });
    }

    const busId = driver.assignedBus._id;
    const bookings = await Booking.find({
      busId,
      status: { $ne: 'cancelled' }
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments({
      busId,
      status: { $ne: 'cancelled' }
    });

    res.status(200).json({
      success: true,
      data: {
        bus: driver.assignedBus,
        bookings
      },
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
      message: 'Failed to fetch driver bookings',
      error: error.message
    });
  }
};

// @desc    Mark passenger as boarded
// @route   PUT /api/bookings/:id/board
// @access  Private (Driver)
export const markPassengerBoarded = async (req, res) => {
  try {
    const { seatNumber, boarded = true } = req.body || {};
    if (!Number.isInteger(seatNumber) || seatNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid seatNumber is required'
      });
    }

    const driver = await Driver.findById(req.user.id).select('assignedBus');
    if (!driver || !driver.assignedBus) {
      return res.status(403).json({
        success: false,
        message: 'No bus assigned to this driver'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('busId', 'busName from to departureTime arrivalTime');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.busId._id.toString() !== driver.assignedBus.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This booking does not belong to your assigned bus'
      });
    }

    if (!Array.isArray(booking.boardingStatus) || booking.boardingStatus.length === 0) {
      booking.boardingStatus = (booking.seats || []).map((seat, index) => ({
        seatNumber: seat,
        passengerName: booking.passengerDetails?.[index]?.name || `Passenger ${index + 1}`,
        boarded: false
      }));
    }

    const seatEntry = booking.boardingStatus.find((item) => item.seatNumber === seatNumber);
    if (!seatEntry) {
      return res.status(404).json({
        success: false,
        message: 'Seat not found for this booking'
      });
    }

    seatEntry.boarded = Boolean(boarded);
    seatEntry.boardedAt = boarded ? new Date() : null;
    seatEntry.markedByDriverId = boarded ? req.user.id : null;

    await booking.save();

    res.status(200).json({
      success: true,
      message: boarded ? 'Passenger marked as boarded' : 'Passenger boarding reverted',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update boarding status',
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reason = req.body?.reason || req.body?.cancellationReason;

    const booking = await Booking.findById(req.params.id).session(session);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization — handle both populated and unpopulated userId
    const bookingUserId = booking.userId._id ? booking.userId._id.toString() : booking.userId.toString();
    if (bookingUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Calculate refund (90% refund)
    const refundAmount = calculateRefund(booking.totalPrice, 90);

    // Update booking
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    await booking.save({ session });

    // Remove seats from bus atomically
    await Bus.findByIdAndUpdate(booking.busId, {
      $pull: { bookedSeats: { $in: booking.seats } }
    }, { session });

    const user = await User.findById(bookingUserId).session(session);
    let updatedWalletBalance = null;

    if (user) {
      const before = Number(user.walletBalance || 0);
      const after = before + refundAmount;
      user.walletBalance = after;
      await user.save({ session });

      await WalletTransaction.create([{
        userId: user._id,
        type: 'refund',
        amount: refundAmount,
        balanceBefore: before,
        balanceAfter: after,
        description: `Refund for cancelled booking ${booking.bookingId}`,
        relatedBookingId: booking._id,
        performedBy: req.user.id
      }], { session });

      updatedWalletBalance = after;
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        ...booking.toObject(),
        refundAmount,
        walletBalance: updatedWalletBalance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    // Validate payment status
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Only admins can mark as completed
    if (paymentStatus === 'completed' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can mark payment as completed'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const bookingUserId = booking.userId._id ? booking.userId._id.toString() : booking.userId.toString();
    if (bookingUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentId) booking.paymentId = paymentId;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

export default {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingsByBus,
  getDriverAssignedBookings,
  markPassengerBoarded,
  cancelBooking,
  updatePaymentStatus
};
