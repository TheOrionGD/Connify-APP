import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import nacl from 'tweetnacl';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { deviceApi } from '../services/api/deviceApi';
import { profileApi } from '../services/api/profileApi';
import { authApi } from '../services/api/authApi';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { connectivityService } from '../services/ConnectivityService';
import { offlineQueueService } from '../services/OfflineQueueService';
import * as Keychain from 'react-native-keychain';

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: '268788625625-vh6gf0l25q396jedmmchvs699g6p09e7.apps.googleusercontent.com',
  });
}

/** Helper to merge local onboarding guardian & medical data into profile medicalNotes */
async function syncLocalOnboardingDataToProfile(userProfileNotes?: string | null): Promise<string> {
  let notesObj: any = {};
  if (userProfileNotes) {
    try {
      notesObj = JSON.parse(userProfileNotes);
    } catch {
      notesObj = {};
    }
  }

  // Load local guardian data from AsyncStorage
  try {
    const guardianDataStr = await AsyncStorage.getItem('@connify_guardian_data');
    if (guardianDataStr) {
      const gPayload = JSON.parse(guardianDataStr);
      if (gPayload && (gPayload.name || gPayload.phone)) {
        notesObj.guardian = {
          name: gPayload.name || '',
          phone: gPayload.phone || '',
          relationship: gPayload.relationship || 'Guardian',
        };

        if (gPayload.phone) {
          try {
            const creds = await Keychain.getGenericPassword({ service: 'CONNIFY_EMERGENCY_CONTACTS' });
            let existingContacts: any[] = creds ? JSON.parse(creds.password) : [];
            const filtered = existingContacts.filter(c => c.phone !== gPayload.phone.trim());
            filtered.unshift({
              id: 'guardian-primary',
              name: gPayload.name?.trim() || 'Guardian',
              phone: gPayload.phone.trim(),
              relationship: gPayload.relationship?.trim() || 'Guardian',
            });
            await Keychain.setGenericPassword('contacts', JSON.stringify(filtered), {
              service: 'CONNIFY_EMERGENCY_CONTACTS',
            });
          } catch (e) {
            console.warn('Keychain sync notice:', e);
          }
        }
      }
    }
  } catch (e) {}

  // Load local medical data from AsyncStorage
  try {
    const medicalDataStr = await AsyncStorage.getItem('@connify_medical_data');
    if (medicalDataStr) {
      const mPayload = JSON.parse(medicalDataStr);
      if (mPayload.bloodType) notesObj.bloodGroup = mPayload.bloodType;
      if (mPayload.secondaryPhone) notesObj.secondaryPhone = mPayload.secondaryPhone;
      if (mPayload.medicalNotesText) notesObj.medicalNotesText = mPayload.medicalNotesText;
      if (mPayload.secondaryName) notesObj.secondaryName = mPayload.secondaryName;
    }
  } catch (e) {}

  return JSON.stringify(notesObj);
}

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
  disconnectAccount: () => Promise<void>;
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
            const fallbackPhoto = auth().currentUser?.photoURL || res.data.photo || res.data.avatar;
            if (fallbackPhoto && !get().user?.photoURL) {
              set((state) => ({
                user: state.user ? { ...state.user, photoURL: fallbackPhoto } : state.user,
              }));
            }
            if (res.data.medicalNotes) {
              try {
                const parsed = JSON.parse(res.data.medicalNotes);
                if (parsed.guardian && (parsed.guardian.name || parsed.guardian.phone)) {
                  await AsyncStorage.setItem('@connify_guardian_data', JSON.stringify(parsed.guardian));
                }
              } catch (e) {}
            }
          }
        } catch (e) {
          // Profile not yet created for this device
        }
      },

      signInWithEmail: async (email, password) => {
        set({ loading: true, error: null });
        try {
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
          const currentProfileAnon = get().userProfile;
          const mergedNotesAnon = await syncLocalOnboardingDataToProfile(currentProfileAnon?.medicalNotes);
          try {
            const upsertRes = await profileApi.upsertProfile({
              firstName: currentProfileAnon?.firstName || 'Guest',
              lastName: currentProfileAnon?.lastName || 'User',
              phone: user.phoneNumber || currentProfileAnon?.phone || undefined,
              medicalNotes: mergedNotesAnon,
              firebaseUid: user.uid,
              email: user.email || undefined,
              isAnonymous: true,
            });
            if (upsertRes.success && upsertRes.data) {
              set({ userProfile: upsertRes.data, hasCompletedProfile: true });
            }
          } catch (err) {
            console.warn('Failed to upsert guest profile data', err);
          }
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
          if (Platform.OS === 'web') {
            throw new Error('Google Sign-In is not currently supported on the web.');
          }
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          const signInResult = await GoogleSignin.signIn();
          let idToken = signInResult.data?.idToken;
          let accessToken = (signInResult.data as any)?.accessToken;

          // Fetch tokens directly if missing from signInResult response
          try {
            const tokens = await GoogleSignin.getTokens();
            if (tokens.idToken) idToken = tokens.idToken;
            if (tokens.accessToken) accessToken = tokens.accessToken;
          } catch (tokenErr) {
            console.warn('[authStore] GoogleSignin.getTokens notice:', tokenErr);
          }

          if (!idToken) {
            throw new Error('No Google ID token received. Please check Play Services and try again.');
          }

          // Build Firebase Google Credential safely ensuring non-empty accessToken
          const googleCredential = (accessToken && typeof accessToken === 'string' && accessToken.trim().length > 0)
            ? auth.GoogleAuthProvider.credential(idToken, accessToken)
            : auth.GoogleAuthProvider.credential(idToken, null as any);
          const authInstance = auth();
          let user;

          if (authInstance.currentUser && authInstance.currentUser.isAnonymous) {
            try {
              const userCredential = await authInstance.currentUser.linkWithCredential(googleCredential);
              user = userCredential.user;
            } catch (linkError: any) {
              const userCredential = await authInstance.signInWithCredential(googleCredential);
              user = userCredential.user;
            }
          } else {
            const userCredential = await authInstance.signInWithCredential(googleCredential);
            user = userCredential.user;
          }

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

          // Always sync Google profile data (displayName, email) to database.
          // The API requires both names, so single-word display names use User as a fallback.
          const nameParts = (user.displayName || 'Google User').trim().split(/\s+/);
          const firstName = nameParts[0] || 'Google';
          const lastName = nameParts.slice(1).join(' ') || 'User';
          const currentProfile = get().userProfile;
          const mergedNotesGoogle = await syncLocalOnboardingDataToProfile(currentProfile?.medicalNotes);
          try {
            const upsertRes = await profileApi.upsertProfile({
              firstName: currentProfile?.firstName || firstName,
              lastName: currentProfile?.lastName || lastName,
              phone: user.phoneNumber || currentProfile?.phone || undefined,
              medicalNotes: mergedNotesGoogle,
              firebaseUid: user.uid,
              email: user.email || undefined,
              isAnonymous: user.isAnonymous,
            });
            if (upsertRes.success) {
              if (upsertRes.data) {
                set({ userProfile: upsertRes.data, hasCompletedProfile: true });
              }
              await get().fetchProfile();
            }
          } catch (err) {
            console.warn('Failed to upsert Google profile data', err);
          }
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
            const currentUser = get().user;
            const firebaseCurrentUser = auth().currentUser;
            const existingPhoto =
              currentUser?.photoURL ||
              firebaseCurrentUser?.photoURL ||
              get().userProfile?.photo ||
              get().userProfile?.avatar ||
              null;
            const existingDisplayName =
              currentUser?.displayName ||
              firebaseCurrentUser?.displayName ||
              get().userProfile?.name ||
              null;
            const existingUid =
              currentUser?.uid ||
              firebaseCurrentUser?.uid ||
              res.user?.uid ||
              `usr_${Date.now()}`;

            const authenticatedUser: FirebaseUser = {
              uid: existingUid,
              email: email || currentUser?.email || firebaseCurrentUser?.email || null,
              displayName: existingDisplayName || res.user?.displayName || email.split('@')[0],
              photoURL: res.user?.photoURL || existingPhoto,
              phoneNumber: currentUser?.phoneNumber || firebaseCurrentUser?.phoneNumber || null,
              isAnonymous: currentUser?.isAnonymous ?? false,
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
          if (Platform.OS !== 'web') {
            try {
              await GoogleSignin.signOut();
            } catch (e) {}
          }
          try {
            await auth().signOut();
          } catch (e) {}

          try {
            const { socketService } = require('../services/socketService');
            socketService.disconnect();
          } catch (e) {}

          try {
            const { useEpisodeStore } = require('./episodeStore');
            useEpisodeStore.getState().resetEpisode();
          } catch (e) {}

          set({
            user: null,
            userProfile: null,
            isAuthenticated: false,
            isPendingSync: false,
            hasCompletedProfile: false,
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

      disconnectAccount: async () => {
        set({ loading: true });
        try {
          if (Platform.OS !== 'web') {
            try {
              await GoogleSignin.revokeAccess();
              await GoogleSignin.signOut();
            } catch (e) {}
          }
          try {
            await auth().signOut();
          } catch (e) {}

          try {
            const { socketService } = require('../services/socketService');
            socketService.disconnect();
          } catch (e) {}

          try {
            const { useEpisodeStore } = require('./episodeStore');
            useEpisodeStore.getState().resetEpisode();
          } catch (e) {}

          try {
            await Keychain.resetGenericPassword({ service: 'CONNIFY_EMERGENCY_CONTACTS' });
          } catch (e) {}

          const keysToClear = [
            '@connify_guardian_data',
            '@connify_medical_data',
            '@connify_install_uuid',
            'CACHED_NEARBY_FEED',
            'CONNIFY_EPISODE_HISTORY',
          ];
          for (const key of keysToClear) {
            try {
              await AsyncStorage.removeItem(key);
            } catch (e) {}
          }

          set({
            user: null,
            userProfile: null,
            isAuthenticated: false,
            isPendingSync: false,
            hasCompletedProfile: false,
            loading: false,
            error: null,
            sessionToken: null,
            firebaseIdToken: null,
            deviceId: null,
          });
        } catch (e: any) {
          set({ error: e.message || 'Failed to disconnect account', loading: false });
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
