import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      required: [true, 'Please provide bus name'],
      trim: true
    },
    operator: {
      type: String,
      required: [true, 'Please provide bus operator'],
      enum: [
        'APSRTC',
        'TSRTC',
        'VRL',
        'Neeta Express',
        'Paulo Travels',
        'Kallada Travels',
        'Ashok Travels',
        'Orange Tours',
        'Redbus',
        'GoIbibo'
      ]
    },
    busType: {
      type: String,
      required: [true, 'Please provide bus type'],
      enum: ['AC Seater', 'AC Semi Sleeper', 'AC Sleeper', 'Non-AC']
    },
    from: {
      type: String,
      required: [true, 'Please provide departure city'],
      trim: true
    },
    to: {
      type: String,
      required: [true, 'Please provide destination city'],
      trim: true
    },
    distance: {
      type: Number,
      required: [true, 'Please provide distance in KM']
    },
    departureTime: {
      type: String,
      required: [true, 'Please provide departure time (HH:MM)'],
      match: [/^\d{2}:\d{2}$/, 'Please provide time in HH:MM format']
    },
    arrivalTime: {
      type: String,
      required: [true, 'Please provide arrival time (HH:MM)'],
      match: [/^\d{2}:\d{2}$/, 'Please provide time in HH:MM format']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please provide total seats'],
      min: [10, 'Bus must have at least 10 seats'],
      max: [60, 'Bus cannot have more than 60 seats']
    },
    bookedSeats: {
      type: [Number],
      default: []
    },
    pricePerKm: {
      type: Number,
      required: [true, 'Please provide price per KM in ₹'],
      min: [0.5, 'Price per KM cannot be less than ₹0.5'],
      default: 2.5
    },
    amenities: {
      type: [String],
      enum: ['WiFi', 'Charging', 'Toilets', 'Blankets', 'Entertainment', 'Water', 'AC', 'USB Charging', 'Blanket', 'Pillow', 'Mineral Water', 'Reading Light', 'Power Outlet', 'Fan', 'Snacks'],
      default: ['AC', 'Toilets']
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    liveLocation: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
        default: null
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
        default: null
      },
      speedKmph: {
        type: Number,
        min: 0,
        default: 0
      },
      heading: {
        type: Number,
        min: 0,
        max: 360,
        default: 0
      },
      occupancy: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      tripStatus: {
        type: String,
        enum: ['idle', 'in_progress', 'completed'],
        default: 'idle'
      },
      updatedAt: {
        type: Date,
        default: null
      },
      updatedByRole: {
        type: String,
        enum: ['driver', 'manager', 'admin'],
        default: 'driver'
      }
    }

  },
  { timestamps: true }
);

// Index for efficient queries
busSchema.index({ from: 1, to: 1, departureTime: 1 });
busSchema.index({ managerId: 1 });
busSchema.index({ 'liveLocation.updatedAt': -1 });

// Method to get available seats
busSchema.methods.getAvailableSeats = function () {
  const allSeats = Array.from({ length: this.totalSeats }, (_, i) => i + 1);
  return allSeats.filter(seat => !this.bookedSeats.includes(seat));
};

// Method to get total price for booking
busSchema.methods.calculatePrice = function (numberOfSeats) {
  return this.distance * this.pricePerKm * numberOfSeats;
};

const Bus = mongoose.model('Bus', busSchema);

export default Bus;
