/**
 * Cinema Dark & OLED Emergency Safety Aesthetic Design System for Connify
 * Global palette applied across the entire app.
 */

export const colors = {
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
} as const;

export type ColorsType = typeof colors;
