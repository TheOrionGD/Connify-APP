import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

/**
 * Safely retrieves the bottom tab bar height from React Navigation.
 * Returns the fallback height (default: 56px) if called outside
 * a Bottom Tab Navigator context (e.g. inside a Stack Navigator).
 */
export function useSafeBottomTabBarHeight(fallback = 56): number {
  try {
    return useBottomTabBarHeight();
  } catch {
    return fallback;
  }
}
