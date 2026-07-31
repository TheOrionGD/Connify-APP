import { colors } from './colors';
import { typography, fontFamilies } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  fontFamilies,
  spacing,
} as const;

export type ThemeType = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './ThemeContext';

