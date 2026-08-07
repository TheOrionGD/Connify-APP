import { useThemeStore } from '../src/stores/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useThemeStore.setState({ themeMode: 'dark' });
  });

  test('initial state is dark', () => {
    expect(useThemeStore.getState().themeMode).toBe('dark');
  });

  test('toggleTheme toggles themeMode', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().themeMode).toBe('light');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().themeMode).toBe('dark');
  });

  test('setThemeMode sets themeMode directly', () => {
    useThemeStore.getState().setThemeMode('light');
    expect(useThemeStore.getState().themeMode).toBe('light');

    useThemeStore.getState().setThemeMode('dark');
    expect(useThemeStore.getState().themeMode).toBe('dark');
  });
});
