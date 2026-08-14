import mongoose, { Schema, Document } from 'mongoose';

export interface IGuardian extends Document {
  deviceId: mongoose.Types.ObjectId;
  userFullName: string;
  fullName: string;
  phone: string;
  relationship: string;
  createdAt: Date;
}

const GuardianSchema = new Schema<IGuardian>({
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  userFullName: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Guardian = mongoose.model<IGuardian>('Guardian', GuardianSchema);
