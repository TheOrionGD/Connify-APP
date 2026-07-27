/**
 * Warm Beige, Crisp Black & Vivid Crimson Red Design System for Connify
 * Global palette applied across the entire app.
 */

export const colors = {
  // Core Surface & Background (Warm Beige Aesthetic)
  background: '#F5F0EA',
  onBackground: '#121212',
  
  surface: '#F5F0EA',
  onSurface: '#121212',
  onSurfaceVariant: '#4A4A4A',
  
  surfaceDim: '#E8E3DB',
  surfaceBright: '#FAF8F5',
  surfaceVariant: '#EFEBE4',
  surfaceTint: '#DC2626',
  
  inverseSurface: '#121212',
  inverseOnSurface: '#F5F0EA',
  
  // Surface Containers (Beige & White Depth Hierarchy)
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#FAF8F5',
  surfaceContainer: '#F5F0EA',
  surfaceContainerHigh: '#EFEBE4',
  surfaceContainerHighest: '#E5E0D8',
  
  // Outlines & Borders (Crisp Black & Red Accent Borders)
  outline: '#121212',
  outlineVariant: '#333333',
  borderDark: '#121212',
  borderRed: '#DC2626',
  
  // Brand Primary (Vivid Crimson Red)
  primary: '#DC2626',
  onPrimary: '#FFFFFF',
  primaryContainer: '#FEF2F2',
  onPrimaryContainer: '#991B1B',
  inversePrimary: '#FCA5A5',
  
  // Brand Secondary (Crisp Black)
  secondary: '#121212',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E5E0D8',
  onSecondaryContainer: '#121212',
  
  // Brand Tertiary (Dark Charcoal Accent)
  tertiary: '#1E1E1E',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#F5F0EA',
  onTertiaryContainer: '#121212',
  
  // Error / Urgent Alert States
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#7F1D1D',
  
  // Fixed Tonal Colors
  primaryFixed: '#FEE2E2',
  primaryFixedDim: '#FCA5A5',
  onPrimaryFixed: '#7F1D1D',
  onPrimaryFixedVariant: '#991B1B',
  
  secondaryFixed: '#E5E0D8',
  secondaryFixedDim: '#D5CF00',
  onSecondaryFixed: '#121212',
  onSecondaryFixedVariant: '#333333',
  
  tertiaryFixed: '#E8E3DB',
  tertiaryFixedDim: '#D8D3CB',
  onTertiaryFixed: '#121212',
  onTertiaryFixedVariant: '#1E1E1E',
} as const;

export type ColorsType = typeof colors;
