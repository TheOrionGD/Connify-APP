import { create } from 'zustand';

export type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connected' | 'ended';

export interface CallState {
  callStatus: CallStatus;
  episodeId: string | null;
  counterpartyName: string;
  counterpartyRole: 'requester' | 'responder' | 'unknown';
  duration: number; // in seconds
  isMuted: boolean;
  isSpeakerOn: boolean;
  isMinimized: boolean;
  
  // Actions
  startOutgoingCall: (episodeId: string, counterpartyName: string, counterpartyRole: 'requester' | 'responder') => void;
  receiveIncomingCall: (episodeId: string, callerName: string, callerRole: string) => void;
  setConnected: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  setMinimized: (minimized: boolean) => void;
  tickDuration: () => void;
  endCall: () => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  callStatus: 'idle',
  episodeId: null,
  counterpartyName: '',
  counterpartyRole: 'unknown',
  duration: 0,
  isMuted: false,
  isSpeakerOn: true,
  isMinimized: false,

  startOutgoingCall: (episodeId, counterpartyName, counterpartyRole) =>
    set({
      callStatus: 'outgoing',
      episodeId,
      counterpartyName: counterpartyName || 'Peer Node',
      counterpartyRole: counterpartyRole || 'unknown',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      isMinimized: false,
    }),

  receiveIncomingCall: (episodeId, callerName, callerRole) =>
    set({
      callStatus: 'incoming',
      episodeId,
      counterpartyName: callerName || 'SafeNet Peer',
      counterpartyRole: (callerRole as any) || 'unknown',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      isMinimized: false,
    }),

  setConnected: () =>
    set({
      callStatus: 'connected',
    }),

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),

  toggleSpeaker: () =>
    set((state) => ({
      isSpeakerOn: !state.isSpeakerOn,
    })),

  setMinimized: (isMinimized) =>
    set({
      isMinimized,
    }),

  tickDuration: () =>
    set((state) => ({
      duration: state.duration + 1,
    })),

  endCall: () =>
    set({
      callStatus: 'ended',
    }),

  resetCall: () =>
    set({
      callStatus: 'idle',
      episodeId: null,
      counterpartyName: '',
      counterpartyRole: 'unknown',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      isMinimized: false,
    }),
}));
