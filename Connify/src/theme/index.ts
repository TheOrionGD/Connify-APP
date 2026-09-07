import { getThemeColors, darkColors } from './colors';
import { typography, fontFamilies } from './typography';
import { spacing } from './spacing';
import { useThemeStore } from '../stores/themeStore';

export const theme = {
  get colors() {
    try {
      const mode = useThemeStore.getState().themeMode;
      return getThemeColors(mode);
    } catch {
      return darkColors;
    }
  },
  typography,
  fontFamilies,
  spacing,
};

export type ThemeType = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './ThemeContext';

