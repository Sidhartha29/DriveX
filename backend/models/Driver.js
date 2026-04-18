import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide driver name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide driver email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      unique: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide license number'],
      unique: true
    },
    accessCode: {
      type: String,
      required: [true, 'Please provide driver access code'],
      minlength: [6, 'Access code must be at least 6 characters'],
      select: false
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'Please provide license expiry date']
    },
    assignedBus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus'
    },
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active'
    },
    totalTrips: {
      type: Number,
      default: 0
    },
    loginCount: {
      type: Number,
      default: 0
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    lastLoginIp: {
      type: String,
      default: ''
    },
    lastLoginUserAgent: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    notifications: [
      {
        type: {
          type: String,
          enum: ['assignment', 'booking', 'ops', 'alert'],
          default: 'ops'
        },
        title: {
          type: String,
          required: true,
          trim: true
        },
        message: {
          type: String,
          required: true,
          trim: true
        },
        relatedBusId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Bus',
          default: null
        },
        readAt: {
          type: Date,
          default: null
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]

  },
  { timestamps: true }
);

// Hash driver access code before saving
driverSchema.pre('save', async function (next) {
  if (!this.isModified('accessCode')) return next();

  try {
    const salt = await bcryptjs.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
    this.accessCode = await bcryptjs.hash(this.accessCode, salt);
    next();
  } catch (error) {
    next(error);
  }
});

driverSchema.methods.matchAccessCode = async function (enteredAccessCode) {
  try {
    if (!this.accessCode || !enteredAccessCode) return false;
    return await bcryptjs.compare(enteredAccessCode, this.accessCode);
  } catch {
    return false;
  }
};

// Index for efficient queries
driverSchema.index({ assignedManager: 1 });
driverSchema.index({ assignedBus: 1 });

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
