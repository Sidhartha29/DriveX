import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    photoURL: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['customer', 'manager', 'admin'],
      default: 'customer'
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    walletBalance: {
      type: Number,
      min: [0, 'Wallet balance cannot be negative'],
      default: 500
    },
    isActive: {
      type: Boolean,
      default: true
    },

  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcryptjs.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
