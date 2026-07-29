import { apiClient } from './apiClient';

export interface ProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
  medicalNotes?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: any;
  error?: {
    code: string;
    message: string;
  };
}

export const profileApi = {
  /**
   * Save or update user profile data
   */
  async upsertProfile(data: ProfileData): Promise<ProfileResponse> {
    const response = await apiClient.post<ProfileResponse>('/api/profile', data);
    return response.data;
  },

  /**
   * Fetch stored user profile data
   */
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>('/api/profile');
    return response.data;
  },
};
