import { Schema, model, Types, type Document } from 'mongoose';

export interface OrderDocument extends Document {
  _id: Types.ObjectId;
  orderId: string;
  accountId: Types.ObjectId;
  customer: string;
  mobile: string;
  area: string;
  lpgId: string;
  status: 'pending' | 'completed';
  points: number;
  ownerId: Types.ObjectId;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema({
  orderId: { type: String, required: true, trim: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'OperatorAccount', required: true, index: true },
  customer: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  area: { type: String, default: 'Unknown Area' },
  lpgId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true },
  points: { type: Number, default: 25 },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

orderSchema.index({ ownerId: 1, orderId: 1 }, { unique: true });
orderSchema.index({ accountId: 1, status: 1 });
orderSchema.index({ ownerId: 1, createdAt: -1 });

export const Order = model<OrderDocument>('Order', orderSchema);

export function toOrderDto(order: OrderDocument) {
  return {
    id: order._id.toString(),
    orderId: order.orderId,
    accountId: order.accountId.toString(),
    customer: order.customer,
    mobile: order.mobile,
    area: order.area,
    lpgId: order.lpgId,
    status: order.status,
    points: order.points,
    completedAt: order.completedAt?.toISOString() || null,
    createdAt: order.createdAt?.toISOString(),
  };
}
