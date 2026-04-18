import User from '../models/User.js';
import Bus from '../models/Bus.js';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import WalletTransaction from '../models/WalletTransaction.js';

// @desc    Get all users
// @route   GET /api/admin/users?role=customer&page=1&limit=10
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cancel active bookings for deleted user
    await Booking.updateMany(
      { userId: req.params.id, status: 'confirmed' },
      { status: 'cancelled', cancellationReason: 'User account deleted by admin' }
    );

    // Also delete related data
    await Bus.deleteMany({ managerId: req.params.id });
    await Driver.deleteMany({ assignedManager: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot modify your own admin role'
      });
    }

    if (!['customer', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res) => {
  try {
    // Run all queries in parallel for better performance
    const [
      userStats,
      totalBuses,
      bookingStats,
      totalRevenue
    ] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Bus.countDocuments(),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    // Process user stats
    const userMap = {};
    userStats.forEach(({ _id, count }) => { userMap[_id] = count; });

    // Process booking stats
    const bookingMap = {};
    bookingStats.forEach(({ _id, count }) => { bookingMap[_id] = count; });

    const totalUsers = Object.values(userMap).reduce((sum, c) => sum + c, 0);
    const totalBookings = Object.values(bookingMap).reduce((sum, c) => sum + c, 0);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: userMap.customer || 0,
          managers: userMap.manager || 0,
          admins: userMap.admin || 0
        },
        buses: {
          total: totalBuses
        },
        bookings: {
          total: totalBookings,
          completed: bookingMap.completed || 0,
          cancelled: bookingMap.cancelled || 0,
          confirmed: bookingMap.confirmed || 0
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          formattedTotal: `₹${(totalRevenue[0]?.total || 0).toLocaleString('en-IN')}`
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// @desc    Get booking analytics
// @route   GET /api/admin/booking-analytics
// @access  Private (Admin)
export const getBookingAnalytics = async (req, res) => {
  try {
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const topRoutes = await Booking.aggregate([
      {
        $lookup: {
          from: 'buses',
          localField: 'busId',
          foreignField: '_id',
          as: 'bus'
        }
      },
      {
        $unwind: '$bus'
      },
      {
        $group: {
          _id: {
            from: '$bus.from',
            to: '$bus.to'
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { bookings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyBookings,
        topRoutes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking analytics',
      error: error.message
    });
  }
};

// @desc    Update pricing configuration
// @route   PUT /api/admin/pricing
// @access  Private (Admin)
export const updatePricing = async (req, res) => {
  try {
    const { pricePerKm, busType } = req.body;

    if (!pricePerKm || pricePerKm <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid price per KM'
      });
    }

    // Build query — optionally filter by bus type
    const query = {};
    if (busType) query.busType = busType;

    // Actually update the buses with new pricing
    const result = await Bus.updateMany(query, { pricePerKm });

    res.status(200).json({
      success: true,
      message: `Pricing updated for ${result.modifiedCount} bus(es)`,
      data: {
        pricePerKm,
        busesUpdated: result.modifiedCount,
        busType: busType || 'all'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update pricing',
      error: error.message
    });
  }
};

// @desc    Get all wallet transactions
// @route   GET /api/admin/wallet-transactions?page=1&limit=50
// @access  Private (Admin)
export const getWalletTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      WalletTransaction.find({})
        .populate('userId', 'name email role')
        .populate('relatedBookingId', 'bookingId totalPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WalletTransaction.countDocuments({})
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

// @desc    Get trip manifests with bookings and assignment details
// @route   GET /api/admin/trip-manifest
// @access  Private (Admin)
export const getTripManifest = async (req, res) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (from) query.from = { $regex: `^${String(from).trim()}$`, $options: 'i' };
    if (to) query.to = { $regex: `^${String(to).trim()}$`, $options: 'i' };

    const [buses, total] = await Promise.all([
      Bus.find(query)
        .populate('managerId', 'name email')
        .populate('driverId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Bus.countDocuments(query)
    ]);

    const busIds = buses.map((bus) => bus._id);
    const bookings = await Booking.find({ busId: { $in: busIds } })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    const bookingsByBus = bookings.reduce((acc, booking) => {
      const key = booking.busId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(booking);
      return acc;
    }, {});

    const data = buses.map((bus) => {
      const busBookings = bookingsByBus[bus._id.toString()] || [];
      const boardedCount = busBookings.reduce(
        (sum, booking) => sum + (booking.boardingStatus || []).filter((item) => item.boarded).length,
        0
      );
      const bookedSeats = busBookings.reduce((sum, booking) => sum + (booking.seats?.length || 0), 0);

      return {
        bus,
        bookings: busBookings,
        summary: {
          totalBookings: busBookings.length,
          totalBookedSeats: bookedSeats,
          boardedSeats: boardedCount,
          departureTime: bus.departureTime,
          arrivalTime: bus.arrivalTime
        }
      };
    });

    res.status(200).json({
      success: true,
      data,
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
      message: 'Failed to fetch trip manifest',
      error: error.message
    });
  }
};

export default {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAnalytics,
  getBookingAnalytics,
  updatePricing,
  getWalletTransactions,
  getTripManifest
};
