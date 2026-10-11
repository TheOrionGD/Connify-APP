import { create } from 'zustand';

export type CallStatus =
  | 'idle'
  | 'outgoing'
  | 'incoming'
  | 'connecting'
  | 'connected'
  | 'busy'
  | 'declined'
  | 'ended'
  | 'failed';

export interface CallState {
  callStatus: CallStatus;
  callId: string | null;
  episodeId: string | null;
  counterpartyName: string;
  counterpartyRole: 'requester' | 'responder' | 'unknown';
  duration: number; // in seconds
  isMuted: boolean;
  isSpeakerOn: boolean;
  isMinimized: boolean;
  isCaller: boolean;
  error: string | null;
  iceConnectionState: string;

  // Actions
  startOutgoingCall: (
    episodeId: string,
    counterpartyName: string,
    counterpartyRole: 'requester' | 'responder',
    callId?: string
  ) => void;
  receiveIncomingCall: (
    episodeId: string,
    callerName: string,
    callerRole: string,
    callId?: string
  ) => void;
  setConnecting: () => void;
  setConnected: (callId?: string) => void;
  setCallBusy: () => void;
  setCallDeclined: () => void;
  setCallError: (error: string) => void;
  setIceConnectionState: (state: string) => void;
  setCallId: (callId: string) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  toggleSpeaker: () => void;
  setSpeaker: (speakerOn: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  tickDuration: () => void;
  endCall: (reason?: string) => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  callStatus: 'idle',
  callId: null,
  episodeId: null,
  counterpartyName: '',
  counterpartyRole: 'unknown',
  duration: 0,
  isMuted: false,
  isSpeakerOn: true,
  isMinimized: false,
  isCaller: false,
  error: null,
  iceConnectionState: 'new',

  startOutgoingCall: (episodeId, counterpartyName, counterpartyRole, callId) =>
    set({
      callStatus: 'outgoing',
      callId: callId || null,
      episodeId,
      counterpartyName: counterpartyName || '',
      counterpartyRole: counterpartyRole || 'unknown',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      isMinimized: false,
      isCaller: true,
      error: null,
      iceConnectionState: 'new',
    }),

  receiveIncomingCall: (episodeId, callerName, callerRole, callId) =>
    set({
      callStatus: 'incoming',
      callId: callId || null,
      episodeId,
      counterpartyName: callerName || '',
      counterpartyRole: (callerRole as any) || 'unknown',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      isMinimized: false,
      isCaller: false,
      error: null,
      iceConnectionState: 'new',
    }),

  setConnecting: () =>
    set({
      callStatus: 'connecting',
    }),

  setConnected: (callId) =>
    set((state) => ({
      callStatus: 'connected',
      callId: callId || state.callId,
      error: null,
    })),

  setCallBusy: () =>
    set({
      callStatus: 'busy',
      error: 'Counterparty is busy on another call',
    }),

  setCallDeclined: () =>
    set({
      callStatus: 'declined',
      error: 'Call was declined by counterparty',
    }),

  setCallError: (error: string) =>
    set({
      callStatus: 'failed',
      error,
    }),

  setIceConnectionState: (iceConnectionState: string) =>
    set({
      iceConnectionState,
    }),

  setCallId: (callId: string) =>
    set({
      callId,
    }),

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),

  setMuted: (isMuted: boolean) =>
    set({
      isMuted,
    }),

  toggleSpeaker: () =>
    set((state) => ({
      isSpeakerOn: !state.isSpeakerOn,
    })),

  setSpeaker: (isSpeakerOn: boolean) =>
    set({
      isSpeakerOn,
    }),

  setMinimized: (isMinimized) =>
    set({
      isMinimized,
    }),

  tickDuration: () =>
    set((state) => ({
      duration: state.duration + 1,
    })),

  endCall: (reason?: string) =>
    set((state) => ({
      callStatus: 'ended',
      error: reason || state.error,
    })),

  resetCall: () =>
    set({
      callStatus: 'idle',
      callId: null,
      episodeId: null,
      counterpartyName: '',
      counterpartyRole: 'unknown',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      isMinimized: false,
      isCaller: false,
      error: null,
      iceConnectionState: 'new',
    }),
}));
