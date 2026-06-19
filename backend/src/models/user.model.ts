import { Schema, model, Types, type Document } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const User = model<UserDocument>('User', userSchema);

export function toUserDto(user: UserDocument) {
  return {
    id: user._id.toString(),
    email: user.email,
  };
}
