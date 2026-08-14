import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceLocation extends Document {
  deviceId: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy?: number;
  batteryLevel?: number;
  isActiveSession: boolean;
  signalLostAlertSent: boolean;
  retryCount: number;
  lastPingAt: Date;
}

const DeviceLocationSchema = new Schema<IDeviceLocation>({
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true, unique: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number },
  batteryLevel: { type: Number },
  isActiveSession: { type: Boolean, default: true },
  signalLostAlertSent: { type: Boolean, default: false },
  retryCount: { type: Number, default: 0 },
  lastPingAt: { type: Date, default: Date.now },
});

export const DeviceLocation = mongoose.model<IDeviceLocation>('DeviceLocation', DeviceLocationSchema);
