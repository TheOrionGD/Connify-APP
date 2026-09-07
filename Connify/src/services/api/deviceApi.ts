import { apiClient } from './apiClient';
import nacl from 'tweetnacl';

export interface DeviceRegisterResponse {
  success: boolean;
  data: {
    deviceId: string;
    token: string;
    tokenType: string;
    expiresIn: string;
  };
}

export interface DeviceChallengeResponse {
  success: boolean;
  data: {
    challenge: string;
    expiresInSeconds: number;
  };
}

export interface DeviceVerifyResponse {
  success: boolean;
  data: {
    verified: boolean;
    message: string;
  };
}

export const deviceApi = {
  /**
   * Registers a device with its fingerprint hash and public key
   */
  async registerDevice(
    deviceFingerprintHash: string,
    publicKey: string,
    phoneHash?: string
  ): Promise<DeviceRegisterResponse> {
    const response = await apiClient.post<DeviceRegisterResponse>('/api/devices/register', {
      deviceFingerprintHash,
      publicKey,
      phoneHash,
    });
    return response.data;
  },

  /**
   * Requests a short-lived (60s) single-use challenge nonce from the backend
   */
  async requestChallenge(): Promise<DeviceChallengeResponse> {
    const response = await apiClient.post<DeviceChallengeResponse>('/api/devices/challenge');
    return response.data;
  },

  /**
   * Performs full challenge-response verify handshake:
   * 1. Fetches challenge nonce from /api/devices/challenge
   * 2. Signs challenge buffer with secretKey (nacl.sign.detached)
   * 3. Submits challenge and signature hex to /api/devices/verify
   */
  async verifyDeviceWithKey(secretKey: Uint8Array): Promise<DeviceVerifyResponse> {
    const challengeRes = await this.requestChallenge();
    if (!challengeRes.success || !challengeRes.data?.challenge) {
      throw new Error('Failed to retrieve verification challenge from backend.');
    }

    const challengeHex = challengeRes.data.challenge;
    const challengeBuffer = Buffer.from(challengeHex);
    const signatureBytes = nacl.sign.detached(challengeBuffer, secretKey);
    const signatureHex = Buffer.from(signatureBytes).toString('hex');

    return this.verifyDevice(challengeHex, signatureHex);
  },

  /**
   * Challenge-response verify submission
   */
  async verifyDevice(challenge: string, signature: string): Promise<DeviceVerifyResponse> {
    const response = await apiClient.post<DeviceVerifyResponse>('/api/devices/verify', {
      challenge,
      signature,
    });
    return response.data;
  },
};

