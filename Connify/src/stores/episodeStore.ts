import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EpisodeStateName = 'idle' | 'creating' | 'searching' | 'active' | 'feedback';
export type CategoryType = 'Medical' | 'Security' | 'Transport' | 'Other';

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
  bchSyndromes: string | null;
  helperStringY: string | null;
  sessionKey: string | null;

  startRequest: (category: CategoryType, urgency: number, description: string) => void;
  cancelRequest: () => void;
  activateEpisode: (socketChannelId: string, durationMinutes: number) => void;
  extendTime: (minutes: number) => void;
  completeEpisode: () => void;
  submitFeedback: (resolved: boolean) => void;
  tickCountdown: () => void;
  resetEpisode: () => void;
  setEpisodeId: (episodeId: string) => void;
  setSHARPParams: (bchSyndromes: string, helperStringY: string, sessionKey: string) => void;
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
      bchSyndromes: null,
      helperStringY: null,
      sessionKey: null,

      startRequest: (category, urgency, description) => {
        // Blinded KRCT coordinates (Tiruchirappalli)
        const mockLat = 10.7905;
        const mockLng = 78.7047;

        set({
          currentState: 'searching',
          category,
          urgency,
          description,
          coordinates: { latitude: mockLat, longitude: mockLng },
          socketChannelId: null,
          timeLeft: 0,
        });
      },

      setEpisodeId: (episodeId) => set({ episodeId }),

      setSHARPParams: (bchSyndromes, helperStringY, sessionKey) => {
        set({ bchSyndromes, helperStringY, sessionKey });
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
          bchSyndromes: null,
          helperStringY: null,
          sessionKey: null,
        });
      },

      activateEpisode: (socketChannelId, durationMinutes) => {
        set({
          currentState: 'active',
          socketChannelId,
          timeLeft: durationMinutes * 60,
        });
      },

      extendTime: (minutes) => {
        set((state) => ({
          timeLeft: state.timeLeft + minutes * 60,
        }));
      },

      completeEpisode: () => {
        set({
          currentState: 'feedback',
        });
      },

      submitFeedback: (resolved) => {
        console.log('Post-episode audit outcome submitted:', {
          resolved,
          category: get().category,
          urgency: get().urgency,
          episodeId: get().episodeId,
        });
        get().resetEpisode();
      },

      tickCountdown: () => {
        const current = get().timeLeft;
        if (current <= 1) {
          set({ timeLeft: 0, currentState: 'feedback' });
        } else {
          set({ timeLeft: current - 1 });
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
          bchSyndromes: null,
          helperStringY: null,
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
