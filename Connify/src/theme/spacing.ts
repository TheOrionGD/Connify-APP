/**
 * Spacing, Border, and Border Radius Metrics for Connify
 * Spec sourced from App UI/safety_core/DESIGN.md
 */

export const spacing = {
  // Base Spacing Metrics (8px grid)
  base: 8,
  containerPadding: 20,
  stackGap: 16,
  inlineGap: 12,
  
  // Borders
  borderWidthHeavy: 2,
  borderWidthLight: 1,
  
  // Border Radius (rounded tokens)
  // Assuming base rem = 16px
  radiusSm: 4,      // 0.25rem
  radiusDefault: 8, // 0.5rem
  radiusMd: 12,     // 0.75rem
  radiusLg: 16,     // 1rem
  radiusXl: 24,     // 1.5rem
  radiusFull: 9999,
} as const;

export type SpacingType = typeof spacing;
