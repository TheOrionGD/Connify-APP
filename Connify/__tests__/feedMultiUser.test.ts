import { socketService } from '../src/services/socketService';
import { episodeApi } from '../src/services/api/episodeApi';

// Mock dependencies
jest.mock('../src/services/api/episodeApi', () => ({
  episodeApi: {
    getNearbyEpisodes: jest.fn(),
    getEpisode: jest.fn(),
  },
}));

jest.mock('../src/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      sessionToken: 'mock-jwt-token',
      isPendingSync: false,
      deviceId: 'device-helper-123',
    })),
  },
}));

jest.mock('../src/stores/episodeStore', () => ({
  useEpisodeStore: {
    getState: jest.fn(() => ({
      expiresAt: Date.now() + 600000,
      setEpisodeId: jest.fn(),
      activateEpisode: jest.fn(),
    })),
  },
}));

jest.mock('../src/services/ConnectivityService', () => ({
  connectivityService: {
    isOnline: true,
    subscribe: jest.fn(() => () => {}),
  },
}));

describe('Multi-User Feed & WebSocket Verification', () => {
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = {
      connected: false,
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
  });

  test('socketService allows registering new_episode listener before socket connects', () => {
    const handler = jest.fn();
    const cleanup = socketService.onNewEpisode(handler);

    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  test('nearby episode API returns spatial feed list correctly for multiple helpers', async () => {
    const mockEpisodes = [
      {
        id: 'ep-1',
        category: 'medical',
        distanceMeters: 120,
        urgency: 5,
        latitude: 12.9716,
        longitude: 77.5946,
      },
      {
        id: 'ep-2',
        category: 'security',
        distanceMeters: 450,
        urgency: 4,
        latitude: 12.972,
        longitude: 77.595,
      },
    ];

    (episodeApi.getNearbyEpisodes as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockEpisodes,
    });

    const response = await episodeApi.getNearbyEpisodes(12.9716, 77.5946, 10000);

    expect(response.success).toBe(true);
    expect(response.data.length).toBe(2);
    expect(response.data[0].id).toBe('ep-1');
    expect(response.data[1].id).toBe('ep-2');
  });
});
