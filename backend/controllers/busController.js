import Bus from '../models/Bus.js';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import { calculatePrice } from '../utils/priceCalculator.js';

// Escape regex special characters to prevent ReDoS
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CITY_ALIASES = {
  Bengaluru: ['Bangalore'],
  Bangalore: ['Bengaluru'],
  Mumbai: ['Bombay'],
  Bombay: ['Mumbai'],
  Kolkata: ['Calcutta'],
  Calcutta: ['Kolkata']
};

const getCitySearchPatterns = (city = '') => {
  const normalized = city.trim();
  if (!normalized) return [];

  const aliases = CITY_ALIASES[normalized] || [];
  return [normalized, ...aliases];
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatBusLiveData = (bus) => ({
  id: bus._id,
  busName: bus.busName,
  from: bus.from,
  to: bus.to,
  operator: bus.operator,
  driver: bus.driverId ? { id: bus.driverId._id, name: bus.driverId.name } : null,
  liveLocation: bus.liveLocation || null
});

const hasCoordinates = (bus) => {
  const lat = bus?.liveLocation?.latitude;
  const lng = bus?.liveLocation?.longitude;
  return Number.isFinite(lat) && Number.isFinite(lng);
};

// @desc    Get all buses with filters
// @route   GET /api/buses?from=&to=&date=&page=&limit=
// @access  Public
export const getBuses = async (req, res) => {
  try {
    const { from, to, page = 1, limit = 10 } = req.query;

    let query = { isActive: true };

    const andFilters = [];

    if (from) {
      const fromPatterns = getCitySearchPatterns(from).map((city) => ({
        from: { $regex: `^${escapeRegex(city)}$`, $options: 'i' }
      }));
      andFilters.push({ $or: fromPatterns });
    }

    if (to) {
      const toPatterns = getCitySearchPatterns(to).map((city) => ({
        to: { $regex: `^${escapeRegex(city)}$`, $options: 'i' }
      }));
      andFilters.push({ $or: toPatterns });
    }

    if (andFilters.length) {
      query.$and = andFilters;
    }

    const skip = (page - 1) * limit;

    const buses = await Bus.find(query)
      .populate('managerId', 'name email')
      .populate('driverId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ departureTime: 1 });

    const total = await Bus.countDocuments(query);

    res.status(200).json({
      success: true,
      data: buses,
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
      message: 'Failed to fetch buses',
      error: error.message
    });
  }
};

// @desc    Get single bus by ID
// @route   GET /api/buses/:id
// @access  Public
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('managerId', 'name email')
      .populate('driverId', 'name');

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus',
      error: error.message
    });
  }
};

// @desc    Create new bus
// @route   POST /api/buses
// @access  Private (Manager/Admin)
export const createBus = async (req, res) => {
  try {
    const {
      busName,
      operator,
      busType,
      from,
      to,
      distance,
      departureTime,
      arrivalTime,
      totalSeats,
      pricePerKm,
      amenities
    } = req.body;

    // Validation
    if (
      !busName ||
      !operator ||
      !busType ||
      !from ||
      !to ||
      !distance ||
      !departureTime ||
      !arrivalTime ||
      !totalSeats ||
      !pricePerKm
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const bus = await Bus.create({
      busName,
      operator,
      busType,
      from,
      to,
      distance,
      departureTime,
      arrivalTime,
      totalSeats,
      pricePerKm,
      amenities: amenities || ['AC', 'Toilets'],
      managerId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create bus',
      error: error.message
    });
  }
};

// Whitelist of fields allowed to be updated on a bus
const ALLOWED_BUS_UPDATE_FIELDS = [
  'busName', 'operator', 'busType', 'from', 'to', 'distance',
  'departureTime', 'arrivalTime', 'totalSeats', 'pricePerKm',
  'amenities', 'isActive', 'driverId', 'rating'
];

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Private (Manager/Admin)
export const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check authorization
    if (
      bus.managerId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bus'
      });
    }

    // Only allow whitelisted fields to prevent mass assignment
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => ALLOWED_BUS_UPDATE_FIELDS.includes(key))
    );

    Object.assign(bus, updates);
    await bus.save();

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update bus',
      error: error.message
    });
  }
};

// @desc    Assign a driver to a bus
// @route   PUT /api/buses/:id/assign-driver
// @access  Private (Manager/Admin)
export const assignDriverToBus = async (req, res) => {
  try {
    const { driverId } = req.body || {};
    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'driverId is required'
      });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    if (req.user.role === 'manager' && bus.managerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign driver for this bus'
      });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (req.user.role === 'manager' && driver.assignedManager.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only assign drivers managed by you'
      });
    }

    if (bus.driverId && bus.driverId.toString() !== driverId) {
      await Driver.findByIdAndUpdate(bus.driverId, { assignedBus: null });
    }

    bus.driverId = driver._id;
    await bus.save();

    driver.assignedBus = bus._id;
    driver.notifications = [
      {
        type: 'assignment',
        title: 'New Route Assignment',
        message: `You are assigned to ${bus.from} -> ${bus.to} (${bus.departureTime} to ${bus.arrivalTime}).`,
        relatedBusId: bus._id,
      },
      ...(driver.notifications || [])
    ].slice(0, 25);
    await driver.save();

    await bus.populate('driverId', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign driver',
      error: error.message
    });
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Private (Admin only)
export const deleteBus = async (req, res) => {
  try {
    // Check for active bookings before deleting
    const activeBookings = await Booking.countDocuments({
      busId: req.params.id,
      status: { $in: ['confirmed'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete bus with ${activeBookings} active booking(s). Cancel them first.`
      });
    }

    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete bus',
      error: error.message
    });
  }
};

// @desc    Get available seats for a bus
// @route   GET /api/buses/:id/available-seats
// @access  Public
export const getAvailableSeats = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const availableSeats = bus.getAvailableSeats();

    res.status(200).json({
      success: true,
      data: {
        totalSeats: bus.totalSeats,
        bookedSeats: bus.bookedSeats,
        availableSeats: availableSeats,
        availableCount: availableSeats.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available seats',
      error: error.message
    });
  }
};

// @desc    Get price for booking
// @route   GET /api/buses/:id/price?seats=5
// @access  Public
export const getBookingPrice = async (req, res) => {
  try {
    const { seats } = req.query;

    if (!seats || isNaN(seats)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid number of seats'
      });
    }

    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const totalPrice = calculatePrice(bus.distance, bus.pricePerKm, parseInt(seats));

    res.status(200).json({
      success: true,
      data: {
        distance: bus.distance,
        pricePerKm: bus.pricePerKm,
        numberOfSeats: parseInt(seats),
        totalPrice: totalPrice,
        formattedPrice: `₹${totalPrice.toLocaleString('en-IN')}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate price',
      error: error.message
    });
  }
};

// @desc    Update live location for a bus
// @route   PUT /api/buses/:id/live-location
// @access  Private (Driver/Manager/Admin)
export const updateBusLiveLocation = async (req, res) => {
  try {
    const { latitude, longitude, speedKmph = 0, heading = 0, occupancy = 0, tripStatus = 'in_progress' } = req.body || {};

    const lat = toNumber(latitude);
    const lng = toNumber(longitude);
    const speed = toNumber(speedKmph);
    const headingValue = toNumber(heading);
    const occupancyValue = toNumber(occupancy);

    if (lat === null || lng === null) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required numeric values'
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinate range'
      });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    if (req.user.role === 'driver') {
      if (!bus.driverId || bus.driverId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to update this bus location'
        });
      }
    }

    if (req.user.role === 'manager' && bus.managerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update location for this bus'
      });
    }

    bus.liveLocation = {
      latitude: lat,
      longitude: lng,
      speedKmph: speed !== null && speed >= 0 ? speed : 0,
      heading: headingValue !== null && headingValue >= 0 && headingValue <= 360 ? headingValue : 0,
      occupancy: occupancyValue !== null && occupancyValue >= 0 && occupancyValue <= 100 ? occupancyValue : 0,
      tripStatus: ['idle', 'in_progress', 'completed'].includes(tripStatus) ? tripStatus : 'in_progress',
      updatedAt: new Date(),
      updatedByRole: req.user.role
    };

    await bus.save();
    await bus.populate('driverId', 'name');

    res.status(200).json({
      success: true,
      message: 'Live location updated',
      data: formatBusLiveData(bus)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update bus live location',
      error: error.message
    });
  }
};

// @desc    Get live location for a bus
// @route   GET /api/buses/:id/live-location
// @access  Private (Customer/Manager/Admin/Driver)
export const getBusLiveLocation = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('driverId', 'name');
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    if (req.user.role === 'customer') {
      const hasBooking = await Booking.exists({
        userId: req.user.id,
        busId: bus._id,
        status: { $ne: 'cancelled' }
      });
      if (!hasBooking) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this bus location'
        });
      }
    }

    if (req.user.role === 'manager' && bus.managerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this bus location'
      });
    }

    if (req.user.role === 'driver') {
      if (!bus.driverId || bus.driverId._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this bus location'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: formatBusLiveData(bus)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus live location',
      error: error.message
    });
  }
};

// @desc    Get live buses for customer bookings
// @route   GET /api/buses/live/my
// @access  Private (Customer)
export const getMyLiveBuses = async (req, res) => {
  try {
    const bookingRows = await Booking.find({
      userId: req.user.id,
      status: { $ne: 'cancelled' }
    }).select('busId');

    const busIds = [...new Set(bookingRows.map((row) => row.busId.toString()))];
    if (busIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const buses = await Bus.find({
      _id: { $in: busIds },
      isActive: true
    })
      .populate('driverId', 'name')
      .sort({ 'liveLocation.updatedAt': -1 });

    const data = buses.filter(hasCoordinates).map(formatBusLiveData);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer live buses',
      error: error.message
    });
  }
};

// @desc    Get live buses for manager/admin
// @route   GET /api/buses/live
// @access  Private (Manager/Admin)
export const getOpsLiveBuses = async (req, res) => {
  try {
    const baseQuery = { isActive: true };
    if (req.user.role === 'manager') {
      baseQuery.managerId = req.user.id;
    }

    const buses = await Bus.find(baseQuery)
      .populate('driverId', 'name')
      .sort({ 'liveLocation.updatedAt': -1 });

    const data = buses.filter(hasCoordinates).map(formatBusLiveData);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live buses',
      error: error.message
    });
  }
};

export default {
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
};
