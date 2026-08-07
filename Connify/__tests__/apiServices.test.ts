import { deviceApi } from '../src/services/api/deviceApi';
import { episodeApi } from '../src/services/api/episodeApi';
import { capsuleApi } from '../src/services/api/capsuleApi';
import { apiClient } from '../src/services/api/apiClient';
import { locationService } from '../src/services/locationService';

jest.mock('../src/services/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    defaults: { baseURL: 'https://connify-backend.onrender.com' },
  },
}));

describe('API Services Layer Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deviceApi', () => {
    test('registerDevice calls post on apiClient with correct endpoint and body', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            deviceId: 'dev-123',
            token: 'jwt-xyz',
            tokenType: 'Bearer',
            expiresIn: '3600',
          },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deviceApi.registerDevice('fingerprint-abc', 'pubkey-123', 'phonehash-789');

      expect(apiClient.post).toHaveBeenCalledWith('/api/devices/register', {
        deviceFingerprintHash: 'fingerprint-abc',
        publicKey: 'pubkey-123',
        phoneHash: 'phonehash-789',
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('verifyDevice calls post on apiClient with challenge and signature', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            verified: true,
            message: 'Handshake completed',
          },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deviceApi.verifyDevice('challenge-str', 'signature-str');

      expect(apiClient.post).toHaveBeenCalledWith('/api/devices/verify', {
        challenge: 'challenge-str',
        signature: 'signature-str',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('episodeApi', () => {
    test('createEpisode calls post with body', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: 'ep-123', category: 'medical', urgency: 5, status: 'created', radiusMeters: 500, createdAt: '', expiresAt: '' },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const loc = await locationService.getCurrentLocation();
      const input = {
        category: 'medical' as const,
        urgency: 5,
        context: 'Need assistance',
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        blindedGridSigs: 'syndromes-abc',
        helperValidationKey: 'y-string',
        gridCellsJson: '[]',
      };
      const result = await episodeApi.createEpisode(input);

      expect(apiClient.post).toHaveBeenCalledWith('/api/episodes', input);
      expect(result).toEqual(mockResponse.data);
    });

    test('getEpisode calls get with episodeId in URL', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: 'ep-123', category: 'general', urgency: 1, status: 'cancelled', radiusMeters: 500, createdAt: '', expiresAt: '' },
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await episodeApi.getEpisode('ep-123');

      expect(apiClient.get).toHaveBeenCalledWith('/api/episodes/ep-123');
      expect(result).toEqual(mockResponse.data);
    });

    test('getNearbyEpisodes calls get with query parameters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: 'ep-abc', category: 'emergency', urgency: 4, status: 'active', distanceMeters: 120 }],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const loc = await locationService.getCurrentLocation();
      const result = await episodeApi.getNearbyEpisodes(loc.coords.latitude, loc.coords.longitude, 600);

      expect(apiClient.get).toHaveBeenCalledWith('/api/episodes/nearby', {
        params: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          radiusMeters: 600,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('cancelEpisode calls patch on endpoint', async () => {
      const mockResponse = {
        data: { success: true },
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await episodeApi.cancelEpisode('ep-123');

      expect(apiClient.patch).toHaveBeenCalledWith('/api/episodes/ep-123/cancel');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('capsuleApi', () => {
    test('issueCapsule calls post with inputs', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            capsuleId: 'cap-999',
            token: 'cap-token',
            expiresAt: '',
          },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const input = {
        episodeId: 'ep-123',
        helperDeviceId: 'helper-456',
        verificationData: {
          qrTokenHash: 'qr-hash',
          blindedGridCell: 'blinded-cell',
        },
      };
      const result = await capsuleApi.issueCapsule(input);

      expect(apiClient.post).toHaveBeenCalledWith('/api/capsules/issue', input);
      expect(result).toEqual(mockResponse.data);
    });

    test('redeemCapsule calls post with token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            redeemed: true,
            episodeId: 'ep-123',
            requesterDeviceId: 'req-abc',
            helperDeviceId: 'helper-xyz',
            message: 'Redeemed successfully',
          },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await capsuleApi.redeemCapsule('capsule-token-111');

      expect(apiClient.post).toHaveBeenCalledWith('/api/capsules/redeem', {
        capsuleToken: 'capsule-token-111',
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('revokeCapsule calls post with capsuleId in URL', async () => {
      const mockResponse = {
        data: { success: true },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await capsuleApi.revokeCapsule('cap-777');

      expect(apiClient.post).toHaveBeenCalledWith('/api/capsules/cap-777/revoke');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
