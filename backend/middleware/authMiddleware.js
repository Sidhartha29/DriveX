import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Driver from '../models/Driver.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Token invalid or expired.'
      });
    }

    try {
      if (decoded.role === 'driver') {
        const driver = await Driver.findById(decoded.id).select('status');
        if (!driver) {
          return res.status(401).json({
            success: false,
            message: 'Driver belonging to this token no longer exists'
          });
        }

        if (driver.status !== 'active') {
          return res.status(401).json({
            success: false,
            message: 'Driver account is not active'
          });
        }

        req.user = { id: decoded.id, role: 'driver' };
        return next();
      }

      // Verify user still exists and is active
      const user = await User.findById(decoded.id).select('role isActive');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account has been deactivated'
        });
      }

      // Use the current role from DB (not from token) to prevent stale roles
      req.user = { id: decoded.id, role: user.role };
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authentication service temporarily unavailable'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

export default protect;
