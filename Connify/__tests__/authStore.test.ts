import auth from '@react-native-firebase/auth';

// Mock Firebase Auth instance methods
const mockAuthInstance = {
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  currentUser: null as any,
};

// Mock @react-native-firebase/auth module factory
jest.mock('@react-native-firebase/auth', () => {
  return jest.fn(() => mockAuthInstance);
});

import { useAuthStore } from '../src/stores/authStore';
import DeviceInfo from 'react-native-device-info';
import { deviceApi } from '../src/services/api/deviceApi';

// Mock deviceApi
jest.mock('../src/services/api/deviceApi', () => ({
  deviceApi: {
    registerDevice: jest.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      deviceId: null,
      sessionToken: null,
      firebaseIdToken: null,
    });
    jest.clearAllMocks();
  });

  test('1. Initial state defaults', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('2. signInWithEmail success flow', async () => {
    // Arrange mocks
    const mockUser = {
      uid: 'user-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'http://photo.url',
      phoneNumber: '1234567890',
      getIdToken: jest.fn().mockResolvedValue('firebase-id-token-abc'),
    };
    
    // Configure auth() mock
    mockAuthInstance.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    // Mock DeviceInfo
    jest.spyOn(DeviceInfo, 'getUniqueId').mockResolvedValue('device-unique-id-xyz');

    // Mock deviceApi.registerDevice
    (deviceApi.registerDevice as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        deviceId: 'device-id-123',
        token: 'session-jwt-token-xyz',
        tokenType: 'Bearer',
        expiresIn: '3600',
      },
    });

    // Act
    await useAuthStore.getState().signInWithEmail('test@example.com', 'password123');

    // Assert
    const state = useAuthStore.getState();
    expect(state.user).toEqual({
      uid: 'user-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'http://photo.url',
      phoneNumber: '1234567890',
    });
    expect(state.isAuthenticated).toBe(true);
    expect(state.sessionToken).toBe('session-jwt-token-xyz');
    expect(state.deviceId).toBe('device-id-123');
    expect(state.firebaseIdToken).toBe('firebase-id-token-abc');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('3. signInWithEmail failure handles errors', async () => {
    mockAuthInstance.signInWithEmailAndPassword.mockRejectedValue(new Error('Firebase auth failed'));

    await useAuthStore.getState().signInWithEmail('test@example.com', 'password123');

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Firebase auth failed');
    expect(state.loading).toBe(false);
  });

  test('4. signUpWithEmail success flow', async () => {
    const mockUser = {
      uid: 'new-user-uid',
      email: 'new@example.com',
      displayName: null,
      photoURL: null,
      phoneNumber: null,
      getIdToken: jest.fn().mockResolvedValue('firebase-id-token-new'),
      updateProfile: jest.fn().mockResolvedValue(undefined),
    };

    mockAuthInstance.createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    jest.spyOn(DeviceInfo, 'getUniqueId').mockResolvedValue('device-unique-id-new');

    (deviceApi.registerDevice as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        deviceId: 'device-id-new',
        token: 'session-jwt-token-new',
        tokenType: 'Bearer',
        expiresIn: '3600',
      },
    });

    await useAuthStore.getState().signUpWithEmail('new@example.com', 'pwd123', 'New User');

    const state = useAuthStore.getState();
    expect(state.user?.displayName).toBe('New User');
    expect(state.isAuthenticated).toBe(true);
    expect(state.sessionToken).toBe('session-jwt-token-new');
    expect(mockUser.updateProfile).toHaveBeenCalledWith({ displayName: 'New User' });
  });

  test('5. signOut clears all credentials', async () => {
    mockAuthInstance.signOut.mockResolvedValue(undefined);

    // Seed state
    useAuthStore.setState({
      user: { uid: 'u1', email: 'e1', displayName: 'd1', photoURL: 'p1' },
      isAuthenticated: true,
      sessionToken: 'jwt-token',
      firebaseIdToken: 'fb-token',
      deviceId: 'd-id',
    });

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.sessionToken).toBeNull();
    expect(state.firebaseIdToken).toBeNull();
    expect(state.deviceId).toBeNull();
  });
});
