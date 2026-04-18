import { randomUUID } from 'crypto';
import Transaction from '../models/Transaction.js';

export const saveTransaction = async ({ userId, bookingId, amount, method, status }) => {
  return Transaction.create({
    userId,
    bookingId,
    amount,
    method,
    status,
    transactionId: randomUUID()
  });
};

export default {
  saveTransaction
};
