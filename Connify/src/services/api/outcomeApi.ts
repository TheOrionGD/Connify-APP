import { apiClient } from './apiClient';

export interface CreateOutcomeInput {
  episodeId: string;
  result: 'success' | 'failure';
  category: 'medical' | 'transport' | 'general' | 'emergency';
  riskLevel?: number;
  completedInWindow: boolean;
}

export interface OutcomeResponse {
  success: boolean;
  data?: {
    id: string;
    episodeId: string;
    result: string;
    category: string;
    riskLevel?: number;
    completedInWindow: boolean;
    createdAt: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const outcomeApi = {
  /**
   * Log a minimal outcome record for a completed episode.
   */
  async createOutcome(input: CreateOutcomeInput): Promise<OutcomeResponse> {
    try {
      const response = await apiClient.post<OutcomeResponse>('/api/outcomes', input);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'OUTCOME_LOG_FAILED',
          message: error.response?.data?.message || error.message || 'Failed to log episode outcome.',
        },
      };
    }
  },
};
