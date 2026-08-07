import { apiClient } from './apiClient';

export interface IssueCapsuleInput {
  episodeId: string;
  helperDeviceId: string;
  verificationData: {
    qrToken: string;
    blindedGridCell: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface CapsuleIssueResponse {
  success: boolean;
  data: {
    capsuleId: string;
    token: string;
    expiresAt: string;
  };
}

export interface CapsuleRedeemResponse {
  success: boolean;
  data: {
    redeemed: boolean;
    episodeId: string;
    requesterDeviceId: string;
    helperDeviceId: string;
    message: string;
  };
}

export const capsuleApi = {
  /**
   * Request the server to issue a new trust capsule
   */
  async issueCapsule(input: IssueCapsuleInput): Promise<CapsuleIssueResponse> {
    const response = await apiClient.post<CapsuleIssueResponse>('/api/capsules/issue', input);
    return response.data;
  },

  /**
   * Redeem a trust capsule token (single-use enforced on server)
   */
  async redeemCapsule(capsuleToken: string): Promise<CapsuleRedeemResponse> {
    const response = await apiClient.post<CapsuleRedeemResponse>('/api/capsules/redeem', {
      capsuleToken,
    });
    return response.data;
  },

  /**
   * Revoke an active trust capsule
   */
  async revokeCapsule(capsuleId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`/api/capsules/${capsuleId}/revoke`);
    return response.data;
  },
};
