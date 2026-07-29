/**
 * Spacing, Border, and Border Radius Metrics for Connify
 */

export const spacing = {
  // Base Spacing Metrics (8px grid)
  base: 8,
  containerPadding: 20,
  cardPadding: 16,
  stackGap: 16,
  inlineGap: 12,
  
  // Sharp & Subdued Hairline Borders
  borderWidthHeavy: 2,
  borderWidthLight: 1,
  borderHairline: 0.5,
  
  // Border Radius (Clean Modern Tokens)
  radiusSm: 8,
  radiusDefault: 12,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
} as const;

export type SpacingType = typeof spacing;
