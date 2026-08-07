import mongoose, { Schema, Document } from 'mongoose';

// ── Device Model ──────────────────────────────────────────────────────
export interface IDevice extends Document {
  deviceFingerprintHash: string;
  publicKey: string;
  phoneHash?: string;
  createdAt: Date;
  lastSeenAt?: Date;
}

const DeviceSchema = new Schema<IDevice>({
  deviceFingerprintHash: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true },
  phoneHash: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date },
});

// ── Episode Model ─────────────────────────────────────────────────────
export interface IEpisode extends Document {
  requesterDeviceId: mongoose.Types.ObjectId;
  category: string;
  urgency: number;
  status: string;
  latitude: number;
  longitude: number;
  location?: {
    type: string;
    coordinates: number[];
  };
  radiusMeters: number;
  blindedGridSigs?: string;
  helperValidationKey?: string;
  gridCellsJson?: string;
  usedQrNonces: string[];
  createdAt: Date;
  expiresAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>({
  requesterDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  category: { type: String, required: true },
  urgency: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false }, // [longitude, latitude]
  },
  radiusMeters: { type: Number, default: 500 },
  blindedGridSigs: { type: String },
  helperValidationKey: { type: String },
  gridCellsJson: { type: String },
  usedQrNonces: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

EpisodeSchema.index({ location: '2dsphere' });

// ── Capsule Model ─────────────────────────────────────────────────────
export interface ICapsule extends Document {
  episodeId: mongoose.Types.ObjectId;
  helperDeviceId: mongoose.Types.ObjectId;
  signedTokenHash: string;
  status: string;
  blindedGridCell?: string;
  issuedAt: Date;
  expiresAt: Date;
  redeemedAt?: Date;
}

const CapsuleSchema = new Schema<ICapsule>({
  episodeId: { type: Schema.Types.ObjectId, ref: 'Episode', required: true },
  helperDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  signedTokenHash: { type: String, required: true },
  status: { type: String, default: 'issued' },
  blindedGridCell: { type: String },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  redeemedAt: { type: Date },
});

// ── Outcome Model ─────────────────────────────────────────────────────
export interface IOutcome extends Document {
  episodeId: mongoose.Types.ObjectId;
  result: string;
  category: string;
  riskLevel?: number;
  completedInWindow: boolean;
  createdAt: Date;
}

const OutcomeSchema = new Schema<IOutcome>({
  episodeId: { type: Schema.Types.ObjectId, ref: 'Episode', required: true },
  result: { type: String, required: true },
  category: { type: String, required: true },
  riskLevel: { type: Number },
  completedInWindow: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ── AuditLog Model ────────────────────────────────────────────────────
export interface IAuditLog extends Document {
  eventType: string;
  episodeId?: mongoose.Types.ObjectId;
  prevHash: string;
  entryHash: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  eventType: { type: String, required: true },
  episodeId: { type: Schema.Types.ObjectId, ref: 'Episode' },
  prevHash: { type: String, required: true },
  entryHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ── Profile Model ─────────────────────────────────────────────────────
export interface IProfile extends Document {
  deviceId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
  medicalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  medicalNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ── DeviceChallenge Model ──────────────────────────────────────────────
export interface IDeviceChallenge extends Document {
  challenge: string;
  deviceId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DeviceChallengeSchema = new Schema<IDeviceChallenge>({
  challenge: { type: String, required: true, unique: true },
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 },
});

export const Device = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);
export const DeviceChallenge = mongoose.models.DeviceChallenge || mongoose.model<IDeviceChallenge>('DeviceChallenge', DeviceChallengeSchema);
export const Episode = mongoose.models.Episode || mongoose.model<IEpisode>('Episode', EpisodeSchema);
export const Capsule = mongoose.models.Capsule || mongoose.model<ICapsule>('Capsule', CapsuleSchema);
export const Outcome = mongoose.models.Outcome || mongoose.model<IOutcome>('Outcome', OutcomeSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

