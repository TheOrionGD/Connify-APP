/**
 * Cinema Dark & OLED Emergency Safety Aesthetic Design System for Connify
 * Global palettes (Dark & Light) applied across the entire app.
 *
 * Light palette sourced from UI/UX Pro Max skill — Emergency SOS & Safety:
 *   Background: #FFF1F2 (warm beige-rose) per DESIGN.md "Soft Beige" + skill data
 *   Card:       #FFFFFF  (white surfaces)
 *   Border:     #FAE4E4  (warm rose border)
 */

// Fixed Theme-Independent Tokens
export const actionColors = {
  actionRed: '#DC2626',
  actionButtonText: '#000000',
} as const;

export const darkColors = {
  ...actionColors,

  // Core Surface & Background (Cinema Dark Aesthetic)
  background: '#050506',
  onBackground: '#FFFFFF',

  surface: '#0E1320',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#94A3B8',

  surfaceDim: '#090D16',
  surfaceBright: '#161C2E',
  surfaceVariant: '#161C2E',
  surfaceTint: '#DC2626',

  inverseSurface: '#F5F0EA',
  inverseOnSurface: '#050506',

  // Surface Containers (Dark Hierarchy)
  surfaceContainerLowest: '#050506',
  surfaceContainerLow: '#090D16',
  surfaceContainer: '#0E1320',
  surfaceContainerHigh: '#161C2E',
  surfaceContainerHighest: '#1E2638',

  // Outlines & Hairline Borders
  outline: 'rgba(255, 255, 255, 0.12)',
  outlineVariant: 'rgba(255, 255, 255, 0.08)',
  borderDark: 'rgba(255, 255, 255, 0.12)',
  borderRed: '#DC2626',

  // Brand Primary (Vivid Emergency Crimson Red)
  primary: '#DC2626',
  vividRed: '#EF4444',
  glowRed: 'rgba(220, 38, 38, 0.4)',
  onPrimary: '#FFFFFF',
  primaryContainer: 'rgba(220, 38, 38, 0.15)',
  onPrimaryContainer: '#EF4444',
  inversePrimary: '#FCA5A5',

  // Brand Secondary (Elevated Dark Container)
  secondary: '#161C2E',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#1E2638',
  onSecondaryContainer: '#F1F5F9',

  // Brand Tertiary (Deep Slate Container)
  tertiary: '#1E2638',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#0E1320',
  onTertiaryContainer: '#FFFFFF',

  // Error / Urgent Alert States
  error: '#EF4444',
  onError: '#FFFFFF',
  errorContainer: 'rgba(239, 68, 68, 0.2)',
  onErrorContainer: '#FCA5A5',

  // Status Tokens
  statusGreen: '#10B981',
  statusAmber: '#F59E0B',

  // Card & Text Shortcuts
  cardBackground: '#0E1320',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  textMuted: '#94A3B8',
  textSubtle: '#64748B',

  // Fixed Tonal Colors
  primaryFixed: 'rgba(220, 38, 38, 0.2)',
  primaryFixedDim: '#EF4444',
  onPrimaryFixed: '#FFFFFF',
  onPrimaryFixedVariant: '#FCA5A5',

  secondaryFixed: '#1E2638',
  secondaryFixedDim: '#161C2E',
  onSecondaryFixed: '#FFFFFF',
  onSecondaryFixedVariant: '#94A3B8',

  tertiaryFixed: '#161C2E',
  tertiaryFixedDim: '#0E1320',
  onTertiaryFixed: '#FFFFFF',
  onTertiaryFixedVariant: '#94A3B8',
};

export const lightColors = {
  ...actionColors,

  // Core Surface & Background (Warm Beige — Emergency SOS & Safety palette)
  // Source: UI/UX Pro Max skill colors.csv + DESIGN.md "Soft Beige" canvas
  background: '#FFF1F2',
  onBackground: '#0F172A',

  surface: '#FFFFFF',
  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',

  surfaceDim: '#FCF1F1',
  surfaceBright: '#FFFFFF',
  surfaceVariant: '#FAE4E4',
  surfaceTint: '#DC2626',

  inverseSurface: '#090D16',
  inverseOnSurface: '#FFFFFF',

  // Surface Containers (Warm Light Hierarchy)
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#FFF1F2',
  surfaceContainer: '#FCF1F1',
  surfaceContainerHigh: '#FAE4E4',
  surfaceContainerHighest: '#F4D0D0',

  // Outlines & Hairline Borders (warm rose tones)
  outline: 'rgba(15, 23, 42, 0.14)',
  outlineVariant: '#FAE4E4',
  borderDark: 'rgba(15, 23, 42, 0.12)',
  borderRed: '#DC2626',

  // Brand Primary (Vivid Emergency Crimson Red)
  primary: '#DC2626',
  vividRed: '#EF4444',
  glowRed: 'rgba(220, 38, 38, 0.3)',
  onPrimary: '#FFFFFF',
  primaryContainer: 'rgba(220, 38, 38, 0.10)',
  onPrimaryContainer: '#DC2626',
  inversePrimary: '#FCA5A5',

  // Brand Secondary
  secondary: '#FAE4E4',
  onSecondary: '#0F172A',
  secondaryContainer: '#F4D0D0',
  onSecondaryContainer: '#0F172A',

  // Brand Tertiary
  tertiary: '#F4D0D0',
  onTertiary: '#0F172A',
  tertiaryContainer: '#FCF1F1',
  onTertiaryContainer: '#0F172A',

  // Error / Urgent Alert States
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: 'rgba(220, 38, 38, 0.12)',
  onErrorContainer: '#991B1B',

  // Status Tokens
  statusGreen: '#10B981',
  statusAmber: '#F59E0B',

  // Card & Text Shortcuts
  cardBackground: '#FFFFFF',
  cardBorder: '#FAE4E4',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',

  // Fixed Tonal Colors
  primaryFixed: 'rgba(220, 38, 38, 0.10)',
  primaryFixedDim: '#EF4444',
  onPrimaryFixed: '#FFFFFF',
  onPrimaryFixedVariant: '#991B1B',

  secondaryFixed: '#FAE4E4',
  secondaryFixedDim: '#F4D0D0',
  onSecondaryFixed: '#0F172A',
  onSecondaryFixedVariant: '#475569',

  tertiaryFixed: '#F4D0D0',
  tertiaryFixedDim: '#FCF1F1',
  onTertiaryFixed: '#0F172A',
  onTertiaryFixedVariant: '#475569',
};

export const getThemeColors = (mode: 'light' | 'dark') => (mode === 'light' ? lightColors : darkColors);

export const colors = darkColors;
export type ColorsType = typeof darkColors;
