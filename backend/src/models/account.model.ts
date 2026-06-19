import { Schema, model, Types, type Document } from 'mongoose';

export interface AccountDocument extends Document {
  _id: Types.ObjectId;
  mobile: string;
  name: string;
  deviceModel: string;
  deviceId: string;
  status: 'Active' | 'Offline' | 'Sync Required';
  ownerId: Types.ObjectId;
  whitelistCode: string;
  bgToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema({
  mobile: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  deviceModel: { type: String, required: true, trim: true },
  deviceId: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Active', 'Offline', 'Sync Required'],
    default: 'Active',
  },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  whitelistCode: { type: String, required: true, trim: true },
  bgToken: { type: String },
}, { timestamps: true });

accountSchema.index({ ownerId: 1, mobile: 1 }, { unique: true });

export const OperatorAccount = model<AccountDocument>('OperatorAccount', accountSchema);

export function toAccountDto(account: AccountDocument) {
  return {
    id: account._id.toString(),
    mobile: account.mobile,
    name: account.name,
    model: account.deviceModel,
    deviceId: account.deviceId,
    status: account.status,
    whitelistCode: account.whitelistCode,
    createdAt: account.createdAt?.toISOString(),
  };
}
