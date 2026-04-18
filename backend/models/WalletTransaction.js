import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['credit', 'debit', 'refund', 'topup'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Transaction amount must be at least 1']
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    externalReference: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    relatedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1, createdAt: -1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;
