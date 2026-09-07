/**
 * Shared domain types for the Connify episode/capsule state machine.
 */

export type EpisodeStatus =
  | 'pending'
  | 'matched'
  | 'active'
  | 'completed'
  | 'expired'
  | 'cancelled';

export type EpisodeCategory = 'medical' | 'transport' | 'general' | 'emergency';

export type CapsuleStatus = 'issued' | 'redeemed' | 'expired' | 'revoked';

/**
 * JWT payload structure for device session tokens.
 * Signed by the server's Ed25519 private key.
 */
export interface DeviceJWTPayload {
  /** Device UUID (primary key in devices table) */
  sub: string;
  /** SHA-256 of the device-bound fingerprint */
  fingerprint: string;
  /** Token type discriminator */
  type: 'device_session';
  iat: number;
  exp: number;
}

/**
 * JWT payload structure for Trust Capsule tokens.
 * Short-lived, single-use, bound to one episode + one helper.
 */
export interface CapsuleJWTPayload {
  type: 'trust_capsule';
  episodeId: string;
  helperDeviceId: string;
  requesterId: string;
  iat: number;
  exp: number;
}

/**
 * JWT payload for time-bound QR tokens generated per episode.
 */
export interface QRTokenPayload {
  type: 'qr_token';
  episodeId: string;
  requesterId: string;
  iat: number;
  exp: number;
}
