import { Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
const scale = width / 375; // Baseline width

export function normalize(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Typographic system definitions for Connify
 * Spec sourced from App UI/safety_core/DESIGN.md & UI/UX Pro Max system
 */

export const fontFamilies = {
  // Plus Jakarta Sans (Headings)
  primary: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },
  // Work Sans (Body prose)
  secondary: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium',
    bold: 'WorkSans-Bold',
  },
  // Space Grotesk (Labels, technical, status metrics)
  technical: {
    regular: 'SpaceGrotesk-Regular',
    medium: 'SpaceGrotesk-Medium',
    bold: 'SpaceGrotesk-Bold',
  },
} as const;

export const typography = {
  hero: {
    fontFamily: fontFamilies.primary.bold,
    fontSize: normalize(36),
    lineHeight: normalize(44),
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: fontFamilies.primary.bold,
    fontSize: normalize(32),
    lineHeight: normalize(40),
    letterSpacing: -0.64,
  },
  headlineMd: {
    fontFamily: fontFamilies.primary.bold,
    fontSize: normalize(24),
    lineHeight: normalize(32),
  },
  headlineSm: {
    fontFamily: fontFamilies.primary.semiBold,
    fontSize: normalize(20),
    lineHeight: normalize(28),
  },
  bodyLg: {
    fontFamily: fontFamilies.secondary.regular,
    fontSize: normalize(18),
    lineHeight: normalize(28),
  },
  bodyMd: {
    fontFamily: fontFamilies.secondary.regular,
    fontSize: normalize(16),
    lineHeight: normalize(24),
  },
  bodySm: {
    fontFamily: fontFamilies.secondary.regular,
    fontSize: normalize(14),
    lineHeight: normalize(20),
  },
  labelLg: {
    fontFamily: fontFamilies.technical.bold,
    fontSize: normalize(16),
    lineHeight: normalize(22),
    letterSpacing: 0.5,
  },
  labelMd: {
    fontFamily: fontFamilies.technical.medium,
    fontSize: normalize(14),
    lineHeight: normalize(20),
    letterSpacing: 0.7,
  },
  labelSm: {
    fontFamily: fontFamilies.technical.medium,
    fontSize: normalize(12),
    lineHeight: normalize(16),
    letterSpacing: 0.8,
  },
  headlineLgMobile: {
    fontFamily: fontFamilies.primary.bold,
    fontSize: normalize(28),
    lineHeight: normalize(36),
  },
} as const;

export type TypographyType = typeof typography;
export type FontFamiliesType = typeof fontFamilies;
