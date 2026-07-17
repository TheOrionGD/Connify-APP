import { useThemeStore } from '../src/stores/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useThemeStore.setState({ themeMode: 'light' });
  });

  test('initial state is light', () => {
    expect(useThemeStore.getState().themeMode).toBe('light');
  });

  test('toggleTheme toggles themeMode', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().themeMode).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().themeMode).toBe('light');
  });

  test('setThemeMode sets themeMode directly', () => {
    useThemeStore.getState().setThemeMode('dark');
    expect(useThemeStore.getState().themeMode).toBe('dark');

    useThemeStore.getState().setThemeMode('light');
    expect(useThemeStore.getState().themeMode).toBe('light');
  });
});
