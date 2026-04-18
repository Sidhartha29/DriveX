import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ['UPI', 'Card', 'Wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      required: true
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false
    }
  }
);

transactionSchema.index({ created_at: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
