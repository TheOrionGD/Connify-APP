// Import react-native-gesture-handler mock if needed
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-safe-area-context using its built-in Jest mock
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// Mock react-native-device-info using its built-in Jest mock
jest.mock('react-native-device-info', () => require('react-native-device-info/jest/react-native-device-info-mock'));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      call: () => {},
      createAnimatedComponent: (c) => c,
    },
    createAnimatedComponent: (c) => c,
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (fn) => fn(),
    useAnimatedProps: (fn) => fn(),
    withTiming: (val) => val,
    withSpring: (val) => val,
    withDelay: (delay, val) => val,
    Easing: {
      inOut: () => {},
      ease: () => {},
    },
    View: View,
  };
});

// Mock @react-native-async-storage/async-storage using its built-in mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-permissions
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));

// Mock Firebase Auth and App
jest.mock('@react-native-firebase/app', () => ({
  initializeApp: jest.fn(),
  apps: [],
}), { virtual: true });

jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    currentUser: null,
  });
});

// Mock react-native-bootsplash
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(true),
  isVisible: jest.fn().mockResolvedValue(false),
  useHideAnimation: jest.fn(),
}));

// Mock react-native-geolocation-service
jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn((success) =>
    success({
      coords: {
        latitude: 12.9716,
        longitude: 77.5946,
        altitude: 920,
        accuracy: 5,
        altitudeAccuracy: 1,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    })
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  requestAuthorization: jest.fn().mockResolvedValue('granted'),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock')
);

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  },
}));

// Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ idToken: 'test-google-id-token' }),
    signOut: jest.fn().mockResolvedValue(null),
    isSignedIn: jest.fn().mockResolvedValue(false),
  },
}));

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: jest.fn().mockReturnValue({}),
  useCameraPermission: jest.fn().mockReturnValue({ hasPermission: true, requestPermission: jest.fn() }),
  useObjectOutput: jest.fn(),
}));

// Mock react-native-localize
jest.mock('react-native-localize', () => ({
  getCountry: jest.fn().mockReturnValue('US'),
  getLocales: jest.fn().mockReturnValue([{ countryCode: 'US', languageTag: 'en-US', languageCode: 'en', isRTL: false }]),
  findBestAvailableLanguage: jest.fn().mockReturnValue({ languageTag: 'en', isRTL: false }),
}));




