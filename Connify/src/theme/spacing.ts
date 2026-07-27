/**
 * Spacing, Border, and Border Radius Metrics for Connify
 */

export const spacing = {
  // Base Spacing Metrics (8px grid)
  base: 8,
  containerPadding: 20,
  stackGap: 16,
  inlineGap: 12,
  
  // Sharp Black Borders
  borderWidthHeavy: 2.5,
  borderWidthLight: 1.5,
  
  // Border Radius (Clean Crisp Tokens)
  radiusSm: 6,
  radiusDefault: 10,
  radiusMd: 14,
  radiusLg: 18,
  radiusXl: 24,
  radiusFull: 9999,
} as const;

export type SpacingType = typeof spacing;
