import { useCallStore } from '../src/stores/callStore';

describe('useCallStore', () => {
  beforeEach(() => {
    useCallStore.getState().resetCall();
  });

  test('1. Initial state is idle', () => {
    const state = useCallStore.getState();
    expect(state.callStatus).toBe('idle');
    expect(state.duration).toBe(0);
    expect(state.isMuted).toBe(false);
    expect(state.isSpeakerOn).toBe(true);
  });

  test('2. startOutgoingCall initializes call in outgoing state', () => {
    useCallStore.getState().startOutgoingCall('ep-101', 'Responder Dave', 'responder');
    const state = useCallStore.getState();
    expect(state.callStatus).toBe('outgoing');
    expect(state.episodeId).toBe('ep-101');
    expect(state.counterpartyName).toBe('Responder Dave');
    expect(state.counterpartyRole).toBe('responder');
    expect(state.duration).toBe(0);
  });

  test('3. receiveIncomingCall transitions to incoming state', () => {
    useCallStore.getState().receiveIncomingCall('ep-202', 'Requester Alice', 'requester');
    const state = useCallStore.getState();
    expect(state.callStatus).toBe('incoming');
    expect(state.episodeId).toBe('ep-202');
    expect(state.counterpartyName).toBe('Requester Alice');
    expect(state.counterpartyRole).toBe('requester');
  });

  test('4. setConnected and tickDuration increment call duration', () => {
    useCallStore.getState().setConnected();
    expect(useCallStore.getState().callStatus).toBe('connected');

    useCallStore.getState().tickDuration();
    useCallStore.getState().tickDuration();
    expect(useCallStore.getState().duration).toBe(2);
  });

  test('5. toggleMute and toggleSpeaker toggle boolean states', () => {
    expect(useCallStore.getState().isMuted).toBe(false);
    useCallStore.getState().toggleMute();
    expect(useCallStore.getState().isMuted).toBe(true);

    expect(useCallStore.getState().isSpeakerOn).toBe(true);
    useCallStore.getState().toggleSpeaker();
    expect(useCallStore.getState().isSpeakerOn).toBe(false);
  });

  test('6. endCall and resetCall reset the call session', () => {
    useCallStore.getState().startOutgoingCall('ep-303', 'Peer', 'responder');
    useCallStore.getState().setConnected();
    useCallStore.getState().endCall();
    expect(useCallStore.getState().callStatus).toBe('ended');

    useCallStore.getState().resetCall();
    expect(useCallStore.getState().callStatus).toBe('idle');
    expect(useCallStore.getState().episodeId).toBeNull();
  });
});
