import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineQueueService } from '../services/OfflineQueueService';
import { connectivityService } from '../services/ConnectivityService';

import { outcomeApi } from '../services/api/outcomeApi';

export type EpisodeStateName = 'idle' | 'creating' | 'searching' | 'active' | 'feedback';
export type CategoryType =
  | 'Medical'
  | 'Security'
  | 'Fire & Hazard'
  | 'Transport'
  | 'Disaster'
  | 'Women Safety'
  | 'Child Care'
  | 'Accident'
  | 'Animal Rescue'
  | 'Senior Assist'
  | 'Blackout'
  | 'Medical Emergency'
  | 'Security & Assault'
  | 'Fire & Explosion'
  | 'Women Safety & Harassment'
  | 'Accident & Collision'
  | 'Transport & Evacuation'
  | 'Disaster & Flood'
  | 'Domestic Violence & Abuse'
  | 'Child Emergency & Lost'
  | 'Senior Citizen Assist'
  | 'Mental Health Crisis'
  | 'Stranded & Breakdown'
  | 'Blood & Organ Need'
  | 'Oxygen & Med Supply'
  | 'Cyber Threat & Stalking'
  | 'Animal Rescue & Hazard'
  | 'Power Grid & Blackout'
  | 'Gas & Chemical Leak'
  | 'Theft & Burglary'
  | 'Food & Water Crisis'
  | 'Shelter & Homeless Relief'
  | 'General Request';

export type UserRole = 'requester' | 'responder' | null;

interface EpisodeState {
  currentState: EpisodeStateName;
  userRole: UserRole;
  responderInfo: {
    helperDeviceId: string;
    latitude?: number;
    longitude?: number;
    distanceStr?: string;
  } | null;
  episodeId: string | null;
  category: CategoryType | null;
  urgency: number | null;
  description: string;
  coordinates: { latitude: number; longitude: number } | null;
  token: string | null;
  socketChannelId: string | null;
  timeLeft: number; // in seconds
  expiresAt: number | null; // Absolute Unix timestamp in ms
  blindedGridSigs: string | null;
  helperValidationKey: string | null;
  sessionKey: string | null;
  isDuressActive: boolean;
  isSafeEscortActive: boolean;
  escortDestination: string;
  witnessAttestations: Array<{ witnessName: string; timestamp: string; hash: string }>;
  lastResponderMovementTime: number | null;
  secondaryResponders: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distanceStr: string;
    joinedAt: string;
    roleTitle: string;
  }>;
  addSecondaryResponder: (responder: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distanceStr: string;
    roleTitle?: string;
  }) => void;
  startRequest: (category: CategoryType, urgency: number, description: string, latitude: number, longitude: number) => void;
  startRequestWithVerification: (
    category: CategoryType,
    urgency: number,
    description: string,
    latitude: number,
    longitude: number,
    secretKeyBytes: Uint8Array,
    enteredPin?: string
  ) => Promise<{ success: boolean; isDuress?: boolean }>;
  acceptEpisodeWithVerification: (
    targetEpisodeId: string,
    helperDeviceId: string,
    secretKeyBytes: Uint8Array
  ) => Promise<{ success: boolean; capsuleId?: string }>;
  setUserRole: (role: UserRole) => void;
  setResponderInfo: (info: { helperDeviceId: string; latitude?: number; longitude?: number; distanceStr?: string } | null) => void;
  cancelRequest: () => void;
  activateEpisode: (socketChannelId: string, durationMinutes: number, role?: UserRole) => void;
  extendTime: (minutes: number) => void;
  completeEpisode: () => void;
  submitFeedback: (resolved: boolean) => void;
  tickCountdown: () => void;
  resetEpisode: () => void;
  setEpisodeId: (episodeId: string) => void;
  setSHARPParams: (blindedGridSigs: string, helperValidationKey: string, sessionKey: string) => void;
  setDuressActive: (active: boolean) => void;
  setSafeEscortActive: (active: boolean, destination?: string) => void;
  addWitnessAttestation: (attestation: { witnessName: string; timestamp: string; hash: string }) => void;
}

export const useEpisodeStore = create<EpisodeState>()(
  persist(
    (set, get) => ({
      currentState: 'idle',
      userRole: null,
      responderInfo: null,
      episodeId: null,
      category: null,
      urgency: null,
      description: '',
      coordinates: null,
      token: null,
      socketChannelId: null,
      timeLeft: 0,
      expiresAt: null,
      blindedGridSigs: null,
      helperValidationKey: null,
      sessionKey: null,


      startRequest: (category, urgency, description, latitude, longitude) => {
        set({
          currentState: 'searching',
          userRole: 'requester',
          responderInfo: null,
          category,
          urgency,
          description,
          coordinates: { latitude, longitude },
          socketChannelId: null,
          timeLeft: 0,
          expiresAt: null,
        });
      },

      startRequestWithVerification: async (category, urgency, description, latitude, longitude, secretKeyBytes, enteredPin) => {
        const { UserVerificationService } = require('../services/UserVerificationService');
        const result = await UserVerificationService.verifySenderEmergencyTrigger(secretKeyBytes, enteredPin);
        
        get().startRequest(category, urgency, description, latitude, longitude);
        return { success: true, isDuress: result.isDuress };
      },

      acceptEpisodeWithVerification: async (targetEpisodeId, helperDeviceId, secretKeyBytes) => {
        const { UserVerificationService } = require('../services/UserVerificationService');
        const { capsuleApi } = require('../services/api/capsuleApi');
        
        await UserVerificationService.verifyAcceptorLiveness(secretKeyBytes);
        
        const capsuleRes = await capsuleApi.issueCapsule({
          episodeId: targetEpisodeId,
          helperDeviceId,
          verificationData: {
            qrToken: `0x_sig_${targetEpisodeId}`,
            blindedGridCell: 'grid_cell_alpha',
          },
        });

        if (capsuleRes.success && capsuleRes.data?.capsuleId) {
          set({
            episodeId: targetEpisodeId,
            userRole: 'responder',
            currentState: 'active',
          });
          return { success: true, capsuleId: capsuleRes.data.capsuleId };
        }
        throw new Error('CAPSULE_ISSUANCE_FAILED: Server failed to issue Trust Capsule.');
      },


      setUserRole: (userRole) => set({ userRole }),

      setResponderInfo: (responderInfo) => set({ responderInfo }),

      setEpisodeId: (episodeId) => set({ episodeId }),

      setSHARPParams: (blindedGridSigs, helperValidationKey, sessionKey) => {
        set({ blindedGridSigs, helperValidationKey, sessionKey });
      },

      cancelRequest: () => {
        const activeId = get().episodeId;
        if (activeId) {
          const { socketService } = require('../services/socketService');
          socketService.cancelEpisode(activeId);

          const { episodeApi } = require('../services/api/episodeApi');
          episodeApi.cancelEpisode(activeId).catch((err: any) =>
            console.warn('⚠️ Cancel episode API call failed:', err?.message || err)
          );
        }
        set({
          currentState: 'idle',
          userRole: null,
          responderInfo: null,
          episodeId: null,
          category: null,
          urgency: null,
          description: '',
          coordinates: null,
          token: null,
          socketChannelId: null,
          timeLeft: 0,
          expiresAt: null,
          blindedGridSigs: null,
          helperValidationKey: null,
          sessionKey: null,
        });
      },

      activateEpisode: (socketChannelId, durationMinutes, role) => {
        set({
          currentState: 'active',
          userRole: role || get().userRole || 'requester',
          socketChannelId,
          timeLeft: durationMinutes * 60,
          expiresAt: Date.now() + durationMinutes * 60 * 1000,
        });
      },

      extendTime: (minutes) => {
        const currentExpiresAt = get().expiresAt;
        if (!currentExpiresAt) return;
        
        const newExpiresAt = currentExpiresAt + minutes * 60 * 1000;
        set({
          expiresAt: newExpiresAt,
          timeLeft: Math.max(0, Math.floor((newExpiresAt - Date.now()) / 1000)),
        });
      },


      completeEpisode: () => {
        set({
          currentState: 'feedback',
        });
      },

      submitFeedback: async (resolved) => {
        console.log(`Submitting episode feedback. Resolved: ${resolved}`);
        const episodeId = get().episodeId;
        const category = get().category;
        const urgency = get().urgency;
        const expiresAt = get().expiresAt;
        const completedInWindow = expiresAt ? Date.now() <= expiresAt : true;

        const currentEpisode = {
          episodeId,
          resolved,
          category,
          urgency,
          completedInWindow,
        };

        if (!connectivityService.isOnline) {
          offlineQueueService.enqueue('SUBMIT_FEEDBACK', currentEpisode);
        } else if (episodeId) {
          const categoryMapping: Record<string, 'medical' | 'transport' | 'general' | 'emergency'> = {
            'Medical': 'medical',
            'Transport': 'transport',
            'Security': 'emergency',
            'Fire & Hazard': 'emergency',
            'Disaster': 'emergency',
            'Women Safety': 'emergency',
            'Accident': 'medical',
          };
          const apiCat = categoryMapping[category || ''] || 'general';

          try {
            const res = await outcomeApi.createOutcome({
              episodeId,
              result: resolved ? 'success' : 'failure',
              category: apiCat,
              riskLevel: urgency || 3,
              completedInWindow,
            });
            console.log('Post-episode audit outcome submitted:', res);
          } catch (err) {
            console.warn('Failed to submit outcome directly:', err);
          }
        }

        // Save to local history for HistoryScreen
        try {
          const historyStr = await AsyncStorage.getItem('CONNIFY_EPISODE_HISTORY');
          const history = historyStr ? JSON.parse(historyStr) : [];
          history.unshift({
            id: currentEpisode.episodeId || Math.random().toString(),
            category: currentEpisode.category || 'Emergency',
            timestamp: new Date().toLocaleString(),
            status: resolved ? 'RESOLVED' : 'CANCELLED',
            hash: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase(),
          });
          await AsyncStorage.setItem('CONNIFY_EPISODE_HISTORY', JSON.stringify(history));
        } catch (e) {
          console.warn('Failed to save history', e);
        }

        get().resetEpisode();
      },

      tickCountdown: () => {
        const { expiresAt } = get();
        if (!expiresAt) return;
        
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        if (remainingSeconds <= 0) {
          set({ timeLeft: 0, currentState: 'feedback', expiresAt: null });
        } else {
          set({ timeLeft: remainingSeconds });
        }
      },


      isDuressActive: false,
      isSafeEscortActive: false,
      escortDestination: '',
      witnessAttestations: [],
      secondaryResponders: [],
      lastResponderMovementTime: null,

      setDuressActive: (isDuressActive) => set({ isDuressActive }),

      setSafeEscortActive: (isSafeEscortActive, escortDestination) => set({
        isSafeEscortActive,
        escortDestination: escortDestination || 'Home / Safe Destination',
      }),

      addWitnessAttestation: (attestation) => set((state) => ({
        witnessAttestations: [...state.witnessAttestations, attestation],
      })),

      addSecondaryResponder: (resp) => set((state) => {
        const newSec = {
          id: resp.id,
          name: resp.name,
          latitude: resp.latitude,
          longitude: resp.longitude,
          distanceStr: resp.distanceStr,
          joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          roleTitle: resp.roleTitle || 'Backup Perimeter Guardian',
        };
        // Avoid duplicate IDs
        if (state.secondaryResponders.some(r => r.id === resp.id)) {
          return { secondaryResponders: state.secondaryResponders.map(r => r.id === resp.id ? newSec : r) };
        }
        return { secondaryResponders: [...state.secondaryResponders, newSec] };
      }),

      resetEpisode: () => {
        set({
          currentState: 'idle',
          userRole: null,
          responderInfo: null,
          episodeId: null,
          category: null,
          urgency: null,
          description: '',
          coordinates: null,
          token: null,
          socketChannelId: null,
          timeLeft: 0,
          expiresAt: null,
          blindedGridSigs: null,
          helperValidationKey: null,
          sessionKey: null,
          isDuressActive: false,
          isSafeEscortActive: false,
          escortDestination: '',
          witnessAttestations: [],
          secondaryResponders: [],
          lastResponderMovementTime: null,
        });
      },
    }),
    {
      name: 'connify-episode-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
