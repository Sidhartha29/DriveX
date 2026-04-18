import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      default: () => `SB-${nanoid(10).toUpperCase()}`,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID']
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Please provide bus ID']
    },
    seats: {
      type: [Number],
      required: [true, 'Please provide seat numbers'],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one seat must be booked'
      }
    },
    totalPrice: {
      type: Number,
      required: [true, 'Please provide total price']
    },
    travelDate: {
      type: Date,
      required: [true, 'Please provide travel date']
    },
    passengerDetails: [
      {
        name: {
          type: String,
          required: true
        },
        email: {
          type: String,
          required: true
        },
        phone: {
          type: String,
          required: true,
          match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
        },
        age: {
          type: Number,
          min: [5, 'Passenger age must be at least 5 years']
        },
        gender: {
          type: String,
          enum: ['Male', 'Female', 'Other']
        }
      }
    ],
    boardingStatus: [
      {
        seatNumber: {
          type: Number,
          required: true
        },
        passengerName: {
          type: String,
          required: true
        },
        boarded: {
          type: Boolean,
          default: false
        },
        boardedAt: {
          type: Date,
          default: null
        },
        markedByDriverId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Driver',
          default: null
        }
      }
    ],
    qrCode: {
      type: String
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    paymentId: {
      type: String
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed'
    },
    cancellationReason: String,
    cancelledAt: Date,
    refundAmount: Number,
    notes: String,

  },
  { timestamps: true }
);

// Index for efficient queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ busId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
