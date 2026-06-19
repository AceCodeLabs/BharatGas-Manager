import { Schema, model, Types, type Document } from 'mongoose';

export interface TransactionDocument extends Document {
  _id: Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  account: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true, trim: true },
  account: { type: String, default: '' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

transactionSchema.index({ ownerId: 1, createdAt: -1 });

export const Transaction = model<TransactionDocument>('Transaction', transactionSchema);

export function toTransactionDto(transaction: TransactionDocument) {
  return {
    id: transaction._id.toString(),
    type: transaction.type,
    amount: transaction.amount,
    reason: transaction.reason,
    account: transaction.account,
    createdAt: transaction.createdAt?.toISOString(),
  };
}
