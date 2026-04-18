import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const walletTopUpOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: () => `WALLET-${nanoid(12).toUpperCase()}`,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 100,
      max: 20000
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },
    gatewayTransactionId: {
      type: String,
      trim: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

walletTopUpOrderSchema.index({ userId: 1, createdAt: -1 });

const WalletTopUpOrder = mongoose.model('WalletTopUpOrder', walletTopUpOrderSchema);

export default WalletTopUpOrder;
