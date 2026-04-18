import User from '../models/User.js';
import Driver from '../models/Driver.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getFirebaseAdminAuth, getFirebaseAdminDb } from '../config/firebaseAdmin.js';

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const syncDriverLoginToFirebase = async (driver) => {
  const db = getFirebaseAdminDb();
  if (!db) {
    return;
  }

  const collectionName = process.env.FIREBASE_DRIVER_LOGINS_COLLECTION || 'driverLogins';
  await db.collection(collectionName).doc(String(driver._id)).set({
    driverId: String(driver._id),
    name: driver.name,
    email: driver.email,
    phone: driver.phone,
    status: driver.status,
    loginCount: driver.loginCount,
    lastLoginAt: driver.lastLoginAt ? new Date(driver.lastLoginAt).toISOString() : null,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  walletBalance: user.walletBalance,
  authProvider: user.authProvider,
  photoURL: user.photoURL
});

const buildDriverResponse = (driver) => ({
  id: driver._id,
  name: driver.name,
  email: driver.email,
  role: 'driver',
  phone: driver.phone,
  assignedBus: driver.assignedBus,
  assignedManager: driver.assignedManager,
  status: driver.status,
  rating: driver.rating,
  loginCount: driver.loginCount,
  lastLoginAt: driver.lastLoginAt,
});

const decodeIdTokenPayload = (idToken) => {
  if (!idToken || typeof idToken !== 'string') return null;

  const parts = idToken.split('.');
  if (parts.length < 2) return null;

  const decodePart = (value) => {
    try {
      return Buffer.from(value, 'base64url').toString('utf8');
    } catch {
      return Buffer.from(value, 'base64').toString('utf8');
    }
  };

  try {
    return JSON.parse(decodePart(parts[1]));
  } catch {
    return null;
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Validation
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user — always force 'customer' role on public registration
    // Admin/Manager roles must be assigned via admin endpoint
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'customer',
      phone,
      authProvider: 'local'
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();

    // Validation
    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and select password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support.'
      });
    }

    // Check if password matches
    const isPasswordValid = await user.matchPassword(normalizedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Driver login using email and access code
// @route   POST /api/auth/driver-login
// @access  Public
export const driverLogin = async (req, res) => {
  try {
    const { email, accessCode } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedAccessCode = String(accessCode || '').trim();

    if (!normalizedEmail || !normalizedAccessCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and access code'
      });
    }

    const driver = await Driver.findOne({ email: normalizedEmail })
      .select('+accessCode')
      .populate('assignedBus', 'busName from to');

    if (!driver) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (driver.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Driver account is not active. Contact your manager.'
      });
    }

    const isAccessCodeValid = await driver.matchAccessCode(normalizedAccessCode);
    if (!isAccessCodeValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    driver.loginCount = (driver.loginCount || 0) + 1;
    driver.lastLoginAt = new Date();
    driver.lastLoginIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
    driver.lastLoginUserAgent = req.get('user-agent') || '';
    await driver.save();

    const refreshedDriver = await Driver.findById(driver._id).populate('assignedBus', 'busName from to');

    try {
      await syncDriverLoginToFirebase(refreshedDriver || driver);
    } catch (firebaseError) {
      console.warn('Driver login synced to MongoDB, but Firestore sync failed:', firebaseError.message);
    }

    const token = generateToken(driver._id, 'driver');

    res.status(200).json({
      success: true,
      message: 'Driver login successful',
      token,
      user: buildDriverResponse(refreshedDriver || driver)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Driver login failed',
      error: error.message
    });
  }
};

// @desc    Admin login using panel password only
// @route   POST /api/auth/admin-password-login
// @access  Public
export const adminPasswordLogin = async (req, res) => {
  try {
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide admin password'
      });
    }

    const configuredPassword = process.env.ADMIN_PANEL_PASSWORD;
    if (!configuredPassword) {
      return res.status(503).json({
        success: false,
        message: 'Admin panel password is not configured on server'
      });
    }

    if (password !== configuredPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    const adminUser = await User.findOne({ role: 'admin', isActive: true });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'No active admin account found'
      });
    }

    const token = generateToken(adminUser._id, adminUser.role);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: buildUserResponse(adminUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message
    });
  }
};

// @desc    Login or register via Firebase social auth
// @route   POST /api/auth/firebase
// @access  Public
export const firebaseAuth = async (req, res) => {
  try {
    const { idToken, provider } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a Firebase ID token'
      });
    }

    const firebaseAuthClient = getFirebaseAdminAuth();
    let decodedToken = null;

    if (firebaseAuthClient) {
      decodedToken = await firebaseAuthClient.verifyIdToken(idToken);
    } else {
      const allowInsecureFirebaseAuth = process.env.NODE_ENV !== 'production'
        && process.env.ALLOW_INSECURE_FIREBASE_AUTH === 'true';

      if (!allowInsecureFirebaseAuth) {
        return res.status(503).json({
          success: false,
          message: 'Firebase authentication is not configured on the server'
        });
      }

      decodedToken = decodeIdTokenPayload(idToken);
      if (!decodedToken?.email) {
        return res.status(401).json({
          success: false,
          message: 'Unable to validate Firebase token in development fallback mode'
        });
      }
    }

    const email = decodedToken.email?.toLowerCase();
    const displayName = decodedToken.name || decodedToken.email?.split('@')[0] || 'DriveX User';
    const photoURL = decodedToken.picture || '';
    const firebaseUid = decodedToken.uid || decodedToken.user_id || decodedToken.sub;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Firebase account does not have a verified email address'
      });
    }

    let user = await User.findOne({
      $or: [
        { firebaseUid },
        { email }
      ]
    }).select('+password');

    const resolvedProvider = provider === 'facebook' ? 'facebook' : 'google';

    if (!user) {
      const fallbackPassword = `${crypto.randomBytes(24).toString('hex')}`;
      user = await User.create({
        name: displayName,
        email,
        password: fallbackPassword,
        role: 'customer',
        authProvider: resolvedProvider,
        firebaseUid,
        photoURL,
      });
    } else {
      user.authProvider = resolvedProvider;
      user.firebaseUid = firebaseUid;
      user.photoURL = photoURL || user.photoURL;
      user.name = user.name || displayName;
      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Firebase login successful',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Firebase authentication failed',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    if (req.user.role === 'driver') {
      const driver = await Driver.findById(req.user.id).populate('assignedBus', 'busName from to');

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: buildDriverResponse(driver)
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

export default { register, login, driverLogin, adminPasswordLogin, firebaseAuth, getCurrentUser };
