import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineQueueService } from '../services/OfflineQueueService';
import { connectivityService } from '../services/ConnectivityService';

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
  | 'General SOS';

interface EpisodeState {
  currentState: EpisodeStateName;
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


  startRequest: (category: CategoryType, urgency: number, description: string, latitude: number, longitude: number) => void;
  cancelRequest: () => void;
  activateEpisode: (socketChannelId: string, durationMinutes: number) => void;
  extendTime: (minutes: number) => void;
  completeEpisode: () => void;
  submitFeedback: (resolved: boolean) => void;
  tickCountdown: () => void;
  resetEpisode: () => void;
  setEpisodeId: (episodeId: string) => void;
  setSHARPParams: (blindedGridSigs: string, helperValidationKey: string, sessionKey: string) => void;
}

export const useEpisodeStore = create<EpisodeState>()(
  persist(
    (set, get) => ({
      currentState: 'idle',
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
          category,
          urgency,
          description,
          coordinates: { latitude, longitude },
          socketChannelId: null,
          timeLeft: 0,
          expiresAt: null,
        });
      },


      setEpisodeId: (episodeId) => set({ episodeId }),

      setSHARPParams: (blindedGridSigs, helperValidationKey, sessionKey) => {
        set({ blindedGridSigs, helperValidationKey, sessionKey });
      },

      cancelRequest: () => {
        set({
          currentState: 'idle',
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

      activateEpisode: (socketChannelId, durationMinutes) => {
        set({
          currentState: 'active',
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
        const currentEpisode = {
          resolved,
          category: get().category,
          urgency: get().urgency,
          episodeId: get().episodeId,
        };

        if (!connectivityService.isOnline) {
          offlineQueueService.enqueue('SUBMIT_FEEDBACK', currentEpisode);
        } else {
          // Assume API call here...
          console.log('Post-episode audit outcome submitted:', currentEpisode);
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


      resetEpisode: () => {
        set({
          currentState: 'idle',
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
    }),
    {
      name: 'connify-episode-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
