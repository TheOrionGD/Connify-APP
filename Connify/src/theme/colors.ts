/**
 * Material 3 Brand & UI Colors for Connify
 * Spec sourced from App UI/safety_core/DESIGN.md
 */

export const colors = {
  // Core Surface & Background
  background: '#f9f9f9',
  onBackground: '#1b1b1b',
  
  surface: '#f9f9f9',
  onSurface: '#1b1b1b',
  onSurfaceVariant: '#5f3f3a',
  
  surfaceDim: '#dadada',
  surfaceBright: '#f9f9f9',
  surfaceVariant: '#e2e2e2',
  surfaceTint: '#c00000',
  
  inverseSurface: '#303030',
  inverseOnSurface: '#f1f1f1',
  
  // Surface Containers (Material 3 depth hierarchy)
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f3f3',
  surfaceContainer: '#eeeeee',
  surfaceContainerHigh: '#e8e8e8',
  surfaceContainerHighest: '#e2e2e2',
  
  // Outlines & Borders
  outline: '#946e68',
  outlineVariant: '#e9bcb5',
  
  // Brand Primary (Vivid Crimson Red)
  primary: '#b60100',
  onPrimary: '#ffffff',
  primaryContainer: '#e50000',
  onPrimaryContainer: '#fff6f4',
  inversePrimary: '#ffb4a8',
  
  // Brand Secondary (Olive Accent)
  secondary: '#5e604d',
  onSecondary: '#ffffff',
  secondaryContainer: '#e1e1c9',
  onSecondaryContainer: '#636451',
  
  // Brand Tertiary (Cobalt Blue Accent)
  tertiary: '#0051c6',
  onTertiary: '#ffffff',
  tertiaryContainer: '#0068f8',
  onTertiaryContainer: '#f8f7ff',
  
  // Error States
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  
  // Fixed Tonal Colors
  primaryFixed: '#ffdad4',
  primaryFixedDim: '#ffb4a8',
  onPrimaryFixed: '#410000',
  onPrimaryFixedVariant: '#930100',
  
  secondaryFixed: '#e4e4cc',
  secondaryFixedDim: '#c8c8b0',
  onSecondaryFixed: '#1b1d0e',
  onSecondaryFixedVariant: '#474836',
  
  tertiaryFixed: '#dae2ff',
  tertiaryFixedDim: '#b1c5ff',
  onTertiaryFixed: '#001847',
  onTertiaryFixedVariant: '#0040a0',
} as const;

export type ColorsType = typeof colors;
