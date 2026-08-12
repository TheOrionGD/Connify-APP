import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import nacl from 'tweetnacl';
import DeviceInfo from 'react-native-device-info';
import { deviceApi } from '../services/api/deviceApi';
import { profileApi } from '../services/api/profileApi';
import { authApi } from '../services/api/authApi';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { connectivityService } from '../services/ConnectivityService';
import { offlineQueueService } from '../services/OfflineQueueService';


GoogleSignin.configure({
  webClientId: '268788625625-vh6gf0l25q396jedmmchvs699g6p09e7.apps.googleusercontent.com',
});

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  isAnonymous?: boolean;
}

// ---------------------------------------------------------------------------
// Crypto helpers (pure JS — no native modules required)
// ---------------------------------------------------------------------------

/** Convert a plain ASCII/Latin-1 string to Uint8Array */
function strToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }
  return arr;
}

/** Convert Uint8Array to lowercase hex string */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Derives a deterministic device fingerprint (64 hex chars) and Ed25519 keypair
 * using hardware ID + persistent installation UUID:
 *   bytes[0..31]  → fingerprint (64 hex chars — satisfies backend SHA-256 length)
 *   bytes[32..63] → Ed25519 keypair seed (deterministic, no storage needed)
 */
async function deriveDeviceCredentials(userUid?: string): Promise<{
  fingerprint: string;
  publicKeyHex: string;
}> {
  let deviceUniqueId = await DeviceInfo.getUniqueId();
  if (!deviceUniqueId || ['unknown', 'android_id', '1234567890'].includes(deviceUniqueId.toLowerCase())) {
    let installUuid = await AsyncStorage.getItem('@connify_install_uuid');
    if (!installUuid) {
      const randomHex = toHex(nacl.randomBytes(16));
      installUuid = `inst_${randomHex}_${Date.now().toString(36)}`;
      await AsyncStorage.setItem('@connify_install_uuid', installUuid);
    }
    deviceUniqueId = `${deviceUniqueId || 'dev'}_${installUuid}`;
  }
  if (userUid) {
    deviceUniqueId = `${deviceUniqueId}_${userUid}`;
  }
  const hashBytes = nacl.hash(strToUint8Array(deviceUniqueId)); // SHA-512 → 64 bytes
  const fingerprint = toHex(hashBytes.slice(0, 32));             // first half → 64 hex chars
  const seed = hashBytes.slice(32, 64);                          // second half → keypair seed
  const keyPair = nacl.sign.keyPair.fromSeed(seed);
  const publicKeyHex = toHex(keyPair.publicKey);
  return { fingerprint, publicKeyHex };
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface AuthState {
  user: FirebaseUser | null;
  userProfile: any | null;
  isAuthenticated: boolean;
  isPendingSync: boolean;
  loading: boolean;
  error: string | null;
  hasCompletedProfile: boolean;
  deviceId: string | null;
  /** Connify Ed25519 device session JWT — used by apiClient for all protected routes. */
  sessionToken: string | null;
  /** Firebase ID token — stored temporarily during device registration, then kept for refresh. */
  firebaseIdToken: string | null;

  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; devOtp?: string; message?: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  signInAnonymously: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  /**
   * Standalone device re-registration (key rotation / manual call).
   * Requires sessionToken in the store to already be a valid Firebase ID token
   * before calling this.
   */
  registerDevice: (fingerprint: string, publicKey: string, phoneHash?: string) => Promise<void>;
  updateDeviceSession: (deviceId: string, token: string) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
  setProfileCompleted: () => void;
  fetchProfile: () => Promise<void>;
  ensureDeviceId: () => Promise<string>;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isPendingSync: false,
      hasCompletedProfile: false,
      loading: false,
      error: null,
      deviceId: null,
      sessionToken: null,
      firebaseIdToken: null,

      ensureDeviceId: async () => {
        let currentId = get().deviceId;
        if (!currentId) {
          try {
            const { fingerprint } = await deriveDeviceCredentials(get().user?.uid);
            currentId = fingerprint;
            set({ deviceId: fingerprint });
          } catch (e) {
            currentId = '6a799040188143a6bca3e44d';
          }
        }
        return currentId;
      },

      setProfileCompleted: () => set({ hasCompletedProfile: true }),



      fetchProfile: async () => {
        try {
          const res = await profileApi.getProfile();
          if (res.success && res.data) {
            set({
              userProfile: res.data,
              hasCompletedProfile: true,
            });
          }
        } catch (e) {
          // Profile not yet created for this device
        }
      },

      signInWithEmail: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // 1. Authenticate with Firebase
          const userCredential = await auth().signInWithEmailAndPassword(email, password);
          const user = userCredential.user;
          if (!user) throw new Error('No user returned from Firebase');

          // 2. Obtain Firebase ID token (short-lived Google JWT)
          const firebaseToken = await user.getIdToken();
          const firebaseUser: FirebaseUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
          };

          // 3. Derive deterministic device credentials from hardware device ID
          const { fingerprint, publicKeyHex } = await deriveDeviceCredentials();

          // 4. Temporarily set sessionToken = Firebase token so that apiClient attaches
          //    it as the Bearer header for the /api/devices/register call.
          //    That endpoint uses `authenticateFirebase` middleware which validates Firebase tokens.
          set({ firebaseIdToken: firebaseToken, sessionToken: firebaseToken });

          let regRes;
          if (!connectivityService.isOnline) {
            offlineQueueService.enqueue('REGISTER_DEVICE', { fingerprint, publicKey: publicKeyHex });
            set({
              user: firebaseUser,
              sessionToken: null,
              deviceId: null,
              isAuthenticated: true,
              isPendingSync: true,
              loading: false,
              error: null,
            });
            return;
          }

          regRes = await deviceApi.registerDevice(fingerprint, publicKeyHex);
          if (!regRes.success) throw new Error('Device registration response was not successful');

          set({
            user: firebaseUser,
            sessionToken: regRes.data.token,
            deviceId: regRes.data.deviceId,
            isAuthenticated: true,
            isPendingSync: false,
            loading: false,
            error: null,
          });

          await get().fetchProfile();
        } catch (e: any) {
          if (process.env.NODE_ENV !== 'test') {
            console.error('Firebase Email sign-in failed:', e);
          }
          set({ error: e.message, loading: false });
        }
      },

      signInAnonymously: async () => {
        set({ loading: true, error: null });
        try {
          const userCredential = await auth().signInAnonymously();
          const user = userCredential.user;
          if (!user) throw new Error('No user returned from Firebase');

          const firebaseToken = await user.getIdToken();
          const firebaseUser: FirebaseUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            isAnonymous: user.isAnonymous,
          };

          const { fingerprint, publicKeyHex } = await deriveDeviceCredentials(user.uid);
          set({ firebaseIdToken: firebaseToken, sessionToken: firebaseToken });

          if (!connectivityService.isOnline) {
            offlineQueueService.enqueue('REGISTER_DEVICE', { fingerprint, publicKey: publicKeyHex });
            set({
              user: firebaseUser,
              sessionToken: null,
              deviceId: null,
              isAuthenticated: true,
              isPendingSync: true,
              loading: false,
              error: null,
            });
            return;
          }

          const regRes = await deviceApi.registerDevice(fingerprint, publicKeyHex);
          if (!regRes.success) throw new Error('Device registration response was not successful');

          set({
            user: firebaseUser,
            sessionToken: regRes.data.token,
            deviceId: regRes.data.deviceId,
            isAuthenticated: true,
            isPendingSync: false,
            loading: false,
            error: null,
          });

          await get().fetchProfile();
        } catch (e: any) {
          set({
            error: e.message || 'Failed to sign in',
            loading: false,
            sessionToken: null,
            isAuthenticated: false,
            isPendingSync: false,
          });
        }
      },

      signUpWithEmail: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
          const userCredential = await auth().createUserWithEmailAndPassword(email, password);
          const user = userCredential.user;
          if (!user) throw new Error('No user returned from Firebase');

          await user.updateProfile({ displayName });

          const firebaseToken = await user.getIdToken();
          const firebaseUser: FirebaseUser = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
          };

          const { fingerprint, publicKeyHex } = await deriveDeviceCredentials(user.uid);
          set({ firebaseIdToken: firebaseToken, sessionToken: firebaseToken });

          if (!connectivityService.isOnline) {
            offlineQueueService.enqueue('REGISTER_DEVICE', { fingerprint, publicKey: publicKeyHex });
            set({
              user: firebaseUser,
              sessionToken: null,
              deviceId: null,
              isAuthenticated: true,
              isPendingSync: true,
              loading: false,
              error: null,
            });
            return;
          }

          const regRes = await deviceApi.registerDevice(fingerprint, publicKeyHex);
          if (!regRes.success) throw new Error('Device registration response was not successful');

          set({
            user: firebaseUser,
            sessionToken: regRes.data.token,
            deviceId: regRes.data.deviceId,
            isAuthenticated: true,
            isPendingSync: false,
            loading: false,
            error: null,
          });

          // 7. Auto-fetch profile from database if previously saved
          await get().fetchProfile();
        } catch (e: any) {
          set({
            error: e.message || 'Failed to sign up',
            loading: false,
            sessionToken: null,
            isAuthenticated: false,
          });
        }
      },
      signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          const signInResult = await GoogleSignin.signIn();
          const idToken = signInResult.data?.idToken;

          if (!idToken) {
            throw new Error('No ID token found');
          }

          const googleCredential = auth.GoogleAuthProvider.credential(idToken);
          const userCredential = await auth().signInWithCredential(googleCredential);
          const user = userCredential.user;
          if (!user) throw new Error('No user returned from Google auth');

          const firebaseToken = await user.getIdToken();
          const firebaseUser: FirebaseUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            isAnonymous: user.isAnonymous,
          };

          const { fingerprint, publicKeyHex } = await deriveDeviceCredentials(user.uid);
          set({ firebaseIdToken: firebaseToken, sessionToken: firebaseToken });

          if (!connectivityService.isOnline) {
            offlineQueueService.enqueue('REGISTER_DEVICE', { fingerprint, publicKey: publicKeyHex });
            set({
              user: firebaseUser,
              sessionToken: null,
              deviceId: null,
              isAuthenticated: true,
              isPendingSync: true,
              loading: false,
              error: null,
            });
            return;
          }

          const regRes = await deviceApi.registerDevice(fingerprint, publicKeyHex);
          if (regRes.success) {
            set({
              user: firebaseUser,
              sessionToken: regRes.data.token,
              deviceId: regRes.data.deviceId,
              isAuthenticated: true,
              isPendingSync: false,
              loading: false,
              error: null,
            });
          } else {
            set({
              user: firebaseUser,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          }
          await get().fetchProfile();
        } catch (e: any) {
          set({ error: e.message || 'Google authentication failed.', loading: false });
        }
      },

      sendEmailOtp: async (email: string) => {
        set({ loading: true, error: null });
        try {
          const res = await authApi.sendEmailOtp(email);
          if (res.success) {
            set({ loading: false });
            return { success: true, devOtp: res.devOtp, message: res.message };
          } else {
            const err = res.error?.message || 'Failed to send Mail OTP';
            set({ error: err, loading: false });
            return { success: false, message: err };
          }
        } catch (e: any) {
          const err = e.message || 'Failed to send Mail OTP';
          set({ error: err, loading: false });
          return { success: false, message: err };
        }
      },

      verifyEmailOtp: async (email: string, otp: string) => {
        set({ loading: true, error: null });
        try {
          const res = await authApi.verifyEmailOtp(email, otp);
          if (res.success) {
            const authenticatedUser: FirebaseUser = {
              uid: res.user?.uid || `usr_${Date.now()}`,
              email: email,
              displayName: res.user?.displayName || email.split('@')[0],
              photoURL: res.user?.photoURL || null,
            };
            set({
              user: authenticatedUser,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            await get().fetchProfile();
            return { success: true, message: 'Email verified successfully!' };
          } else {
            const err = res.error?.message || 'Invalid OTP verification code';
            set({ error: err, loading: false });
            return { success: false, message: err };
          }
        } catch (e: any) {
          const err = e.message || 'OTP Verification failed';
          set({ error: err, loading: false });
          return { success: false, message: err };
        }
      },

      signInWithGithub: async () => {
        set({ loading: true, error: null });
        try {
          // GitHub Sign-In requires OAuth native setup.
          // Once the OAuth credentials are obtained:
          //   const githubCredential = auth.GithubAuthProvider.credential(token);
          //   await auth().signInWithCredential(githubCredential);
          throw new Error('GitHub Sign-In requires native library configuration.');
        } catch (e: any) {
          set({ error: e.message || 'GitHub authentication failed.', loading: false });
        }
      },

      registerDevice: async (fingerprint, publicKey, phoneHash) => {
        set({ loading: true, error: null });
        try {
          if (!connectivityService.isOnline) {
            offlineQueueService.enqueue('REGISTER_DEVICE', { fingerprint, publicKey, phoneHash });
            // Cannot retrieve a valid device token yet, wait for queue flush
            set({ loading: false });
            return;
          }

          const res = await deviceApi.registerDevice(fingerprint, publicKey, phoneHash);
          if (res.success) {
            set({
              deviceId: res.data.deviceId,
              sessionToken: res.data.token,
              loading: false,
            });
          } else {
            throw new Error('Device registration response was not successful');
          }
        } catch (e: any) {
          set({ error: e.message || 'Failed to register device', loading: false });
        }
      },

      updateDeviceSession: (deviceId: string, token: string) => {
        set({ deviceId, sessionToken: token, isPendingSync: false, isAuthenticated: true });
      },

      signOut: async () => {
        set({ loading: true });
        try {
          await auth().signOut();
          set({
            user: null,
            isAuthenticated: false,
            isPendingSync: false,
            loading: false,
            error: null,
            sessionToken: null,
            firebaseIdToken: null,
            deviceId: null,
          });
        } catch (e: any) {
          set({ error: e.message || 'Failed to sign out', loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'connify-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
