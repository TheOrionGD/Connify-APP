import { useCallStore } from '../src/stores/callStore';

describe('useCallStore State Machine', () => {
  beforeEach(() => {
    useCallStore.getState().resetCall();
  });

  test('1. Initial state is idle', () => {
    const state = useCallStore.getState();
    expect(state.callStatus).toBe('idle');
    expect(state.callId).toBeNull();
    expect(state.duration).toBe(0);
    expect(state.isMuted).toBe(false);
    expect(state.isSpeakerOn).toBe(true);
    expect(state.error).toBeNull();
  });

  test('2. startOutgoingCall initializes call with outgoing state and callId', () => {
    useCallStore.getState().startOutgoingCall('ep-101', 'Responder Dave', 'responder', 'call-xyz-1');
    const state = useCallStore.getState();
    expect(state.callStatus).toBe('outgoing');
    expect(state.callId).toBe('call-xyz-1');
    expect(state.episodeId).toBe('ep-101');
    expect(state.counterpartyName).toBe('Responder Dave');
    expect(state.counterpartyRole).toBe('responder');
    expect(state.duration).toBe(0);
    expect(state.isCaller).toBe(true);
  });

  test('3. receiveIncomingCall transitions to incoming state with callId', () => {
    useCallStore.getState().receiveIncomingCall('ep-202', 'Requester Alice', 'requester', 'call-abc-2');
    const state = useCallStore.getState();
    expect(state.callStatus).toBe('incoming');
    expect(state.callId).toBe('call-abc-2');
    expect(state.episodeId).toBe('ep-202');
    expect(state.counterpartyName).toBe('Requester Alice');
    expect(state.counterpartyRole).toBe('requester');
    expect(state.isCaller).toBe(false);
  });

  test('4. Transitioning between connecting, connected, and duration increments', () => {
    useCallStore.getState().setConnecting();
    expect(useCallStore.getState().callStatus).toBe('connecting');

    useCallStore.getState().setConnected('call-connected-123');
    expect(useCallStore.getState().callStatus).toBe('connected');
    expect(useCallStore.getState().callId).toBe('call-connected-123');

    useCallStore.getState().tickDuration();
    useCallStore.getState().tickDuration();
    expect(useCallStore.getState().duration).toBe(2);
  });

  test('5. Handles busy, declined, and error failure states', () => {
    useCallStore.getState().setCallBusy();
    expect(useCallStore.getState().callStatus).toBe('busy');
    expect(useCallStore.getState().error).toContain('busy');

    useCallStore.getState().setCallDeclined();
    expect(useCallStore.getState().callStatus).toBe('declined');

    useCallStore.getState().setCallError('Permission denied');
    expect(useCallStore.getState().callStatus).toBe('failed');
    expect(useCallStore.getState().error).toBe('Permission denied');
  });

  test('6. toggleMute, setMuted, toggleSpeaker, and setSpeaker manage audio controls', () => {
    expect(useCallStore.getState().isMuted).toBe(false);
    useCallStore.getState().toggleMute();
    expect(useCallStore.getState().isMuted).toBe(true);
    useCallStore.getState().setMuted(false);
    expect(useCallStore.getState().isMuted).toBe(false);

    expect(useCallStore.getState().isSpeakerOn).toBe(true);
    useCallStore.getState().toggleSpeaker();
    expect(useCallStore.getState().isSpeakerOn).toBe(false);
    useCallStore.getState().setSpeaker(true);
    expect(useCallStore.getState().isSpeakerOn).toBe(true);
  });

  test('7. endCall and resetCall cleanly terminate session', () => {
    useCallStore.getState().startOutgoingCall('ep-303', 'Peer', 'responder');
    useCallStore.getState().setConnected();
    useCallStore.getState().endCall('Call completed');
    expect(useCallStore.getState().callStatus).toBe('ended');

    useCallStore.getState().resetCall();
    expect(useCallStore.getState().callStatus).toBe('idle');
    expect(useCallStore.getState().episodeId).toBeNull();
    expect(useCallStore.getState().callId).toBeNull();
  });
});
