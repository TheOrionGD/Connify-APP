import { apiClient } from './apiClient';

export interface SendEmailOtpResponse {
  success: boolean;
  message?: string;
  devOtp?: string;
  error?: { code: string; message: string };
}

export interface VerifyEmailOtpResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  error?: { code: string; message: string };
}

export const authApi = {
  /**
   * Request a 6 or 7-digit Email OTP verification code to be sent to user's email.
   */
  async sendEmailOtp(email: string): Promise<SendEmailOtpResponse> {
    try {
      const response = await apiClient.post<SendEmailOtpResponse>('/api/auth/send-email-otp', {
        email: email.trim().toLowerCase(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'OTP_SEND_FAILED',
          message: error.response?.data?.message || error.message || 'Failed to send Email OTP.',
        },
      };
    }
  },

  /**
   * Verify the 6 or 7-digit OTP code sent to user's email.
   */
  async verifyEmailOtp(email: string, otp: string): Promise<VerifyEmailOtpResponse> {
    try {
      const response = await apiClient.post<VerifyEmailOtpResponse>('/api/auth/verify-email-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'OTP_VERIFY_FAILED',
          message: error.response?.data?.message || error.message || 'Invalid or expired OTP code.',
        },
      };
    }
  },
};
