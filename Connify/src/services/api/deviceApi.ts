import { apiClient } from './apiClient';

export interface DeviceRegisterResponse {
  success: boolean;
  data: {
    deviceId: string;
    token: string;
    tokenType: string;
    expiresIn: string;
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
    console.log("Calling API at Base URL:", apiClient.defaults.baseURL);
    const response = await apiClient.post<DeviceRegisterResponse>('/api/devices/register', {
      deviceFingerprintHash,
      publicKey,
      phoneHash,
    });
    return response.data;
  },

  /**
   * Challenge-response verify handshake (Stubbed for Phase 11 compatibility)
   */
  async verifyDevice(challenge: string, signature: string): Promise<DeviceVerifyResponse> {
    const response = await apiClient.post<DeviceVerifyResponse>('/api/devices/verify', {
      challenge,
      signature,
    });
    return response.data;
  },
};
