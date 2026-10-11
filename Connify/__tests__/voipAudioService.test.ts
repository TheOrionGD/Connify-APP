import { voipAudioService } from '../src/services/voipAudioService';
import { socketService } from '../src/services/socketService';

describe('voipAudioService', () => {
  beforeEach(() => {
    voipAudioService.endAudioCall();
    jest.clearAllMocks();
  });

  afterEach(() => {
    voipAudioService.endAudioCall();
  });

  test('1. starts audio call as caller and sends initial offer', async () => {
    const sendSignalSpy = jest.spyOn(socketService, 'sendCallSignal').mockImplementation();
    jest.spyOn(socketService, 'onCallSignal').mockReturnValue(() => {});
    jest.spyOn(socketService, 'getIceServers').mockResolvedValue([
      { urls: 'stun:stun.l.google.com:19302' },
    ]);

    await voipAudioService.startAudioCall('test-ep-01', true, 'call-1');

    expect(sendSignalSpy).toHaveBeenCalledWith(
      'test-ep-01',
      expect.objectContaining({
        type: 'offer',
      }),
      'call-1'
    );
  });

  test('2. starts audio call as receiver without emitting initial offer', async () => {
    const sendSignalSpy = jest.spyOn(socketService, 'sendCallSignal').mockImplementation();
    jest.spyOn(socketService, 'onCallSignal').mockReturnValue(() => {});
    jest.spyOn(socketService, 'getIceServers').mockResolvedValue([
      { urls: 'stun:stun.l.google.com:19302' },
    ]);

    await voipAudioService.startAudioCall('test-ep-02', false, 'call-2');

    expect(sendSignalSpy).not.toHaveBeenCalledWith(
      'test-ep-02',
      expect.objectContaining({
        type: 'offer',
      }),
      'call-2'
    );
  });

  test('3. handles incoming SDP offer by generating and emitting SDP answer', async () => {
    const sendSignalSpy = jest.spyOn(socketService, 'sendCallSignal').mockImplementation();
    jest.spyOn(socketService, 'onCallSignal').mockReturnValue(() => {});

    await voipAudioService.startAudioCall('test-ep-03', false, 'call-3');

    await voipAudioService.handleIncomingSignal({
      type: 'offer',
      sdp: { type: 'offer', sdp: 'remote-offer-sdp' },
    });

    expect(sendSignalSpy).toHaveBeenCalledWith(
      'test-ep-03',
      expect.objectContaining({
        type: 'answer',
      }),
      'call-3'
    );
  });

  test('4. setMute toggles mute state without crashing', async () => {
    await voipAudioService.startAudioCall('test-ep-04', true);
    expect(() => voipAudioService.setMute(true)).not.toThrow();
    expect(() => voipAudioService.setMute(false)).not.toThrow();
  });

  test('5. setSpeaker toggles audio output routing without crashing', async () => {
    await voipAudioService.startAudioCall('test-ep-05', true);
    expect(() => voipAudioService.setSpeaker(false)).not.toThrow();
    expect(() => voipAudioService.setSpeaker(true)).not.toThrow();
  });

  test('6. endAudioCall cleanly tears down call session idempotently', async () => {
    await voipAudioService.startAudioCall('test-ep-06', true);
    expect(voipAudioService.isCallActive()).toBe(true);

    expect(() => voipAudioService.endAudioCall()).not.toThrow();
    expect(voipAudioService.isCallActive()).toBe(false);

    // Idempotent secondary call
    expect(() => voipAudioService.endAudioCall()).not.toThrow();
  });
});
