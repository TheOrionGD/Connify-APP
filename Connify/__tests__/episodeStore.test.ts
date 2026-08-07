import { useEpisodeStore } from '../src/stores/episodeStore';
import { locationService } from '../src/services/locationService';

describe('episodeStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useEpisodeStore.getState().resetEpisode();
  });

  test('1. Initial state has default values', () => {
    const state = useEpisodeStore.getState();
    expect(state.currentState).toBe('idle');
    expect(state.episodeId).toBeNull();
    expect(state.category).toBeNull();
    expect(state.urgency).toBeNull();
    expect(state.description).toBe('');
    expect(state.coordinates).toBeNull();
    expect(state.timeLeft).toBe(0);
  });

  test('2. startRequest changes state to searching and sets location/metadata', async () => {
    const loc = await locationService.getCurrentLocation();
    const { latitude, longitude } = loc.coords;

    useEpisodeStore.getState().startRequest('Medical', 3, 'Shortness of breath', latitude, longitude);

    const state = useEpisodeStore.getState();
    expect(state.currentState).toBe('searching');
    expect(state.category).toBe('Medical');
    expect(state.urgency).toBe(3);
    expect(state.description).toBe('Shortness of breath');
    expect(state.coordinates).toEqual({ latitude, longitude });
    expect(state.socketChannelId).toBeNull();
  });

  test('3. setEpisodeId sets episode ID correctly', () => {
    useEpisodeStore.getState().setEpisodeId('ep-12345');
    expect(useEpisodeStore.getState().episodeId).toBe('ep-12345');
  });

  test('4. setSHARPParams sets cryptographic properties', () => {
    useEpisodeStore.getState().setSHARPParams('syndromes-abc', 'helper-y', 'session-key-123');
    const state = useEpisodeStore.getState();
    expect(state.blindedGridSigs).toBe('syndromes-abc');
    expect(state.helperValidationKey).toBe('helper-y');
    expect(state.sessionKey).toBe('session-key-123');
  });

  test('5. cancelRequest resets the store to idle defaults', async () => {
    const loc = await locationService.getCurrentLocation();
    const { latitude, longitude } = loc.coords;

    useEpisodeStore.getState().startRequest('Security', 5, 'Threat detected', latitude, longitude);
    useEpisodeStore.getState().setEpisodeId('ep-999');
    useEpisodeStore.getState().setSHARPParams('s-1', 'h-1', 'sk-1');

    useEpisodeStore.getState().cancelRequest();

    const state = useEpisodeStore.getState();
    expect(state.currentState).toBe('idle');
    expect(state.episodeId).toBeNull();
    expect(state.category).toBeNull();
    expect(state.blindedGridSigs).toBeNull();
  });

  test('6. activateEpisode changes state to active and sets countdown duration', () => {
    useEpisodeStore.getState().activateEpisode('channel-ch-1', 15); // 15 minutes

    const state = useEpisodeStore.getState();
    expect(state.currentState).toBe('active');
    expect(state.socketChannelId).toBe('channel-ch-1');
    expect(state.timeLeft).toBe(15 * 60); // 900 seconds
  });

  test('7. extendTime increases the remaining duration', () => {
    useEpisodeStore.getState().activateEpisode('channel-ch-1', 5); // 300 seconds
    useEpisodeStore.getState().extendTime(2); // +120 seconds

    expect(useEpisodeStore.getState().timeLeft).toBe(420);
  });

  test('8. tickCountdown decrements timeLeft by 1 second and transitions to feedback when <= 1', () => {
    useEpisodeStore.getState().activateEpisode('channel-ch-1', 1); // 60 seconds
    useEpisodeStore.setState({ expiresAt: Date.now() + 59900 });
    useEpisodeStore.getState().tickCountdown();
    expect(useEpisodeStore.getState().timeLeft).toBe(59);

    // Force expiresAt to past/zero remaining
    useEpisodeStore.setState({ expiresAt: Date.now() - 1000 });
    useEpisodeStore.getState().tickCountdown();

    const state = useEpisodeStore.getState();
    expect(state.timeLeft).toBe(0);
    expect(state.currentState).toBe('feedback');
  });

  test('9. completeEpisode transitions to feedback', () => {
    useEpisodeStore.getState().completeEpisode();
    expect(useEpisodeStore.getState().currentState).toBe('feedback');
  });

  test('10. submitFeedback resets the episode state', async () => {
    const loc = await locationService.getCurrentLocation();
    const { latitude, longitude } = loc.coords;

    useEpisodeStore.getState().startRequest('Transport', 2, 'Flat tire', latitude, longitude);
    useEpisodeStore.getState().setEpisodeId('ep-abc');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    await useEpisodeStore.getState().submitFeedback(true);

    expect(consoleSpy).toHaveBeenCalled();
    expect(useEpisodeStore.getState().currentState).toBe('idle');
    expect(useEpisodeStore.getState().episodeId).toBeNull();

    consoleSpy.mockRestore();
  });
});
