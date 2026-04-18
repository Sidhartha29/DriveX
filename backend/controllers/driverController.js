import Driver from '../models/Driver.js';

// @desc    Get drivers for current manager (or all drivers for admin)
// @route   GET /api/drivers/my
// @access  Private (Manager/Admin)
export const getMyDrivers = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { assignedManager: req.user.id };
    const drivers = await Driver.find(query)
      .populate('assignedBus', 'busName from to departureTime arrivalTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers',
      error: error.message
    });
  }
};

// @desc    Get notifications for logged-in driver
// @route   GET /api/drivers/me/notifications
// @access  Private (Driver)
export const getMyDriverNotifications = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id)
      .populate('notifications.relatedBusId', 'busName from to departureTime arrivalTime')
      .select('notifications');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const notifications = [...(driver.notifications || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

export default {
  getMyDrivers,
  getMyDriverNotifications
};
