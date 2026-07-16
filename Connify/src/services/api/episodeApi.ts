import { apiClient } from './apiClient';

export interface CreateEpisodeInput {
  category: 'medical' | 'transport' | 'general' | 'emergency';
  urgency: number;
  context?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  bchSyndromes: string;
  helperStringY: string;
  gridCellsJson: string;
}

export interface EpisodeResponse {
  success: boolean;
  data: {
    id: string;
    requesterDeviceId: string;
    category: string;
    urgency: number;
    status: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    createdAt: string;
    expiresAt: string;
  };
}

export interface NearbyEpisodesResponse {
  success: boolean;
  data: Array<{
    id: string;
    category: string;
    urgency: number;
    status: string;
    distanceMeters: number;
  }>;
}

export const episodeApi = {
  /**
   * Creates a new help request episode
   */
  async createEpisode(input: CreateEpisodeInput): Promise<EpisodeResponse> {
    const response = await apiClient.post<EpisodeResponse>('/api/episodes', input);
    return response.data;
  },

  /**
   * Retrieves specific episode details
   */
  async getEpisode(episodeId: string): Promise<EpisodeResponse> {
    const response = await apiClient.get<EpisodeResponse>(`/api/episodes/${episodeId}`);
    return response.data;
  },

  /**
   * Retrieves a list of nearby episodes based on location
   */
  async getNearbyEpisodes(
    latitude: number,
    longitude: number,
    radiusMeters: number = 500
  ): Promise<NearbyEpisodesResponse> {
    const response = await apiClient.get<NearbyEpisodesResponse>('/api/episodes/nearby', {
      params: {
        latitude,
        longitude,
        radiusMeters,
      },
    });
    return response.data;
  },

  /**
   * Cancels an active help request episode
   */
  async cancelEpisode(episodeId: string): Promise<{ success: boolean }> {
    const response = await apiClient.patch<{ success: boolean }>(`/api/episodes/${episodeId}/cancel`);
    return response.data;
  },
};
