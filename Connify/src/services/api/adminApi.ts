import { apiClient } from './apiClient';

export interface DashboardResponse {
  success: boolean;
  data?: {
    totalEpisodes: number;
    userEpisodes?: number;
    statusCounts: {
      pending: number;
      matched: number;
      active: number;
      completed: number;
    };
    successRate: number;
    activeEpisodes: Array<{
      id: string;
      category: string;
      urgency: number;
      createdAt: string;
    }>;
  };
  error?: { code: string; message: string };
}

export interface AuditChainResponse {
  success: boolean;
  data?: {
    isChainValid: boolean;
    validations: Array<{
      id: string;
      eventType: string;
      episodeId: string;
      prevHash: string;
      storedHash: string;
      calculatedHash: string;
      matchesPrev: boolean;
      matchesCurrent: boolean;
      isValid: boolean;
      createdAt: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  error?: { code: string; message: string };
}

export const adminApi = {
  /**
   * Fetch real-time dashboard statistics (total episodes, user-specific episodes, status counts, success rate).
   */
  async getDashboard(deviceId?: string): Promise<DashboardResponse> {
    try {
      const url = deviceId ? `/api/admin/dashboard?deviceId=${encodeURIComponent(deviceId)}` : '/api/admin/dashboard';
      const response = await apiClient.get<DashboardResponse>(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'DASHBOARD_FETCH_FAILED',
          message: error.response?.data?.message || error.message || 'Failed to fetch admin dashboard stats.',
        },
      };
    }
  },

  /**
   * Fetch audit chain cryptographic verification status.
   */
  async getAuditChain(page: number = 1, limit: number = 50): Promise<AuditChainResponse> {
    try {
      const response = await apiClient.get<AuditChainResponse>('/api/admin/audit-chain', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'AUDIT_VERIFICATION_FAILED',
          message: error.response?.data?.message || error.message || 'Failed to verify audit chain.',
        },
      };
    }
  },

  /**
   * Fetch paginated list of guardian nodes.
   */
  async getGuardians(page: number = 1, limit: number = 50): Promise<any> {
    try {
      const response = await apiClient.get('/api/admin/guardians', { params: { page, limit } });
      return response.data;
    } catch (error: any) {
      return { success: false, error: { code: 'GUARDIANS_FETCH_FAILED', message: error.message } };
    }
  },

  /**
   * Fetch paginated SOS alerts.
   */
  async getSosAlerts(page: number = 1, limit: number = 50): Promise<any> {
    try {
      const response = await apiClient.get('/api/admin/sos-alerts', { params: { page, limit } });
      return response.data;
    } catch (error: any) {
      return { success: false, error: { code: 'SOS_ALERTS_FETCH_FAILED', message: error.message } };
    }
  },
};
