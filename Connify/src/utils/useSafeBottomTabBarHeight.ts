import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Safely retrieves the bottom tab bar height from React Navigation.
 * Returns the fallback height (default: 56px + bottom insets) if called outside
 * a Bottom Tab Navigator context (e.g. inside a Stack Navigator).
 */
export function useSafeBottomTabBarHeight(fallbackBase = 56): number {
  const insets = useSafeAreaInsets();
  try {
    return useBottomTabBarHeight();
  } catch {
    const bottomPadding = insets.bottom > 0 ? insets.bottom : 6;
    return fallbackBase + bottomPadding;
  }
}
