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
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: fontFamilies.primary.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  headlineMd: {
    fontFamily: fontFamilies.primary.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  headlineSm: {
    fontFamily: fontFamilies.primary.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: fontFamilies.secondary.regular,
    fontSize: 18,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: fontFamilies.secondary.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  labelLg: {
    fontFamily: fontFamilies.technical.bold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  labelMd: {
    fontFamily: fontFamilies.technical.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
  },
  labelSm: {
    fontFamily: fontFamilies.technical.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  headlineLgMobile: {
    fontFamily: fontFamilies.primary.bold,
    fontSize: 28,
    lineHeight: 36,
  },
} as const;

export type TypographyType = typeof typography;
export type FontFamiliesType = typeof fontFamilies;
