import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import nacl from 'tweetnacl';
import DeviceInfo from 'react-native-device-info';
import { deviceApi } from '../services/api/deviceApi';
import { profileApi } from '../services/api/profileApi';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
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
      installUuid = 'inst_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
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
  loading: boolean;
  error: string | null;
  hasCompletedProfile: boolean;
  deviceId: string | null;
  /** Connify Ed25519 device session JWT — used by apiClient for all protected routes. */
  sessionToken: string | null;
  /** Firebase ID token — stored temporarily during device registration, then kept for refresh. */
  firebaseIdToken: string | null;

  // ── Phone OTP ─────────────────────────────────────────────────────────────
  /** Firebase phone-auth confirmation object returned after verifyPhoneNumber. */
  phoneConfirmation: any | null;
  otpSending: boolean;
  otpVerifying: boolean;
  otpError: string | null;

  /** Send real Firebase OTP SMS to the given E.164 phone number. */
  sendPhoneOtp: (phoneNumber: string) => Promise<void>;
  /** Confirm the OTP code entered by the user. */
  verifyPhoneOtp: (code: string) => Promise<boolean>;
  clearOtpError: () => void;

  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  /**
   * Standalone device re-registration (key rotation / manual call).
   * Requires sessionToken in the store to already be a valid Firebase ID token
   * before calling this.
   */
  registerDevice: (fingerprint: string, publicKey: string, phoneHash?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setProfileCompleted: () => void;
  fetchProfile: () => Promise<void>;
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
      hasCompletedProfile: false,
      loading: false,
      error: null,
      deviceId: null,
      sessionToken: null,
      firebaseIdToken: null,

      // Phone OTP initial state
      phoneConfirmation: null,
      otpSending: false,
      otpVerifying: false,
      otpError: null,

      setProfileCompleted: () => set({ hasCompletedProfile: true }),

      // ── Real Firebase Phone OTP ────────────────────────────────────────────

      sendPhoneOtp: async (phoneNumber: string) => {
        set({ otpSending: true, otpError: null, phoneConfirmation: null });
        try {
          // Firebase verifyPhoneNumber sends a real SMS on device.
          // It returns a confirmation object used to verify the code.
          const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
          set({ phoneConfirmation: confirmation, otpSending: false });
        } catch (e: any) {
          let msg = e.message || 'Failed to send OTP';
          // Give friendlier messages for common Firebase errors
          if (e.code === 'auth/invalid-phone-number') {
            msg = 'Invalid phone number. Use E.164 format: +91XXXXXXXXXX';
          } else if (e.code === 'auth/too-many-requests') {
            msg = 'Too many requests. Please wait a moment before retrying.';
          } else if (e.code === 'auth/quota-exceeded') {
            msg = 'SMS quota exceeded. Try again later.';
          }
          set({ otpError: msg, otpSending: false });
        }
      },

      verifyPhoneOtp: async (code: string): Promise<boolean> => {
        const { phoneConfirmation } = get();
        if (!phoneConfirmation) {
          set({ otpError: 'No OTP session found. Please send OTP first.' });
          return false;
        }
        set({ otpVerifying: true, otpError: null });
        try {
          await phoneConfirmation.confirm(code);
          set({ otpVerifying: false, phoneConfirmation: null });
          return true;
        } catch (e: any) {
          let msg = e.message || 'Invalid OTP code';
          if (e.code === 'auth/invalid-verification-code') {
            msg = 'Incorrect OTP. Please check the code and try again.';
          } else if (e.code === 'auth/code-expired') {
            msg = 'OTP has expired. Please request a new one.';
          }
          set({ otpError: msg, otpVerifying: false });
          return false;
        }
      },

      clearOtpError: () => set({ otpError: null }),

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

          // 5. Register / upsert device → backend returns a 30-day Ed25519 device session JWT
          const regRes = await deviceApi.registerDevice(fingerprint, publicKeyHex);
          if (!regRes.success) throw new Error('Device registration response was not successful');

          // 6. Replace the Firebase token with the long-lived device session JWT.
          //    From this point all apiClient calls will use the Ed25519 JWT ✅
          set({
            user: firebaseUser,
            sessionToken: regRes.data.token,
            deviceId: regRes.data.deviceId,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // 7. Auto-fetch profile from database if previously saved
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
          // 1. Authenticate with Firebase Anonymously
          const userCredential = await auth().signInAnonymously();
          const user = userCredential.user;
          if (!user) throw new Error('No user returned from Firebase');

          // 2. Obtain Firebase ID token
          const firebaseToken = await user.getIdToken();
          const firebaseUser: FirebaseUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
          };

          // 3. Derive deterministic device credentials from hardware device ID
          const { fingerprint, publicKeyHex } = await deriveDeviceCredentials(user.uid);

          // 4. Temporarily set sessionToken = Firebase token
          set({ firebaseIdToken: firebaseToken, sessionToken: firebaseToken });

          console.log("Firebase token:", firebaseToken.substring(0,30));
          console.log("Registering device...");

          // 5. Register / upsert device
          const regRes = await deviceApi.registerDevice(fingerprint, publicKeyHex);
          if (!regRes.success) throw new Error('Device registration response was not successful');

          // 6. Replace the Firebase token with the long-lived device session JWT.
          set({
            user: firebaseUser,
            sessionToken: regRes.data.token,
            deviceId: regRes.data.deviceId,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // 7. Auto-fetch profile from database if previously saved
          await get().fetchProfile();
        } catch (e: any) {
          console.log(e.response?.status);
          console.log(e.response?.data);
          console.log(e.message);
          set({
            error: e.message || 'Failed to sign in',
            loading: false,
            sessionToken: null,
            isAuthenticated: false,
          });
        }
      },

      signUpWithEmail: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
          // 1. Create Firebase account
          const userCredential = await auth().createUserWithEmailAndPassword(email, password);
          const user = userCredential.user;
          if (!user) throw new Error('No user returned from Firebase');

          await user.updateProfile({ displayName });

          // 2. Obtain Firebase ID token
          const firebaseToken = await user.getIdToken();
          const firebaseUser: FirebaseUser = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
          };

          // 3. Derive device credentials
          const { fingerprint, publicKeyHex } = await deriveDeviceCredentials(user.uid);

          // 4. Temporarily attach Firebase token for the registration call
          set({ firebaseIdToken: firebaseToken, sessionToken: firebaseToken });

          // 5. Register device → receive device session JWT
          const regRes = await deviceApi.registerDevice(fingerprint, publicKeyHex);
          if (!regRes.success) throw new Error('Device registration response was not successful');

          // 6. Store device JWT as the active session token
          set({
            user: firebaseUser,
            sessionToken: regRes.data.token,
            deviceId: regRes.data.deviceId,
            isAuthenticated: true,
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
          // Google Sign-In requires @react-native-google-signin/google-signin native setup.
          // Once the OAuth credentials are obtained:
          //   const googleCredential = auth.GoogleAuthProvider.credential(idToken);
          //   await auth().signInWithCredential(googleCredential);
          throw new Error('Google Sign-In requires native library configuration.');
        } catch (e: any) {
          set({ error: e.message || 'Google authentication failed.', loading: false });
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

      signOut: async () => {
        set({ loading: true });
        try {
          await auth().signOut();
          set({
            user: null,
            isAuthenticated: false,
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
