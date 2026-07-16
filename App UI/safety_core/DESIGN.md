---
name: Safety Core
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#5f3f3a'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#946e68'
  outline-variant: '#e9bcb5'
  surface-tint: '#c00000'
  primary: '#b60100'
  on-primary: '#ffffff'
  primary-container: '#e50000'
  on-primary-container: '#fff6f4'
  inverse-primary: '#ffb4a8'
  secondary: '#5e604d'
  on-secondary: '#ffffff'
  secondary-container: '#e1e1c9'
  on-secondary-container: '#636451'
  tertiary: '#0051c6'
  on-tertiary: '#ffffff'
  tertiary-container: '#0068f8'
  on-tertiary-container: '#f8f7ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930100'
  secondary-fixed: '#e4e4cc'
  secondary-fixed-dim: '#c8c8b0'
  on-secondary-fixed: '#1b1d0e'
  on-secondary-fixed-variant: '#474836'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#b1c5ff'
  on-tertiary-fixed: '#001847'
  on-tertiary-fixed-variant: '#0040a0'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 20px
  stack-gap: 16px
  inline-gap: 12px
  border-width-heavy: 2px
  border-width-light: 1px
---

## Brand & Style

This design system is engineered for **Connify**, a mobile-first safety and coordination platform. The brand personality is defined by a paradox of "Urgent Serenity"—the UI must command immediate attention during critical moments while maintaining a calming, authoritative presence through stable layout structures and warm background tones.

The visual style blends **High-Contrast Bold** elements with **Minimalist** space management. By utilizing a high-visibility red against a soft, organic beige, the system creates a "Alert-First" hierarchy where interactive elements and safety status indicators are unmistakable, yet the overall experience feels grounded and reliable rather than frantic.

## Colors

The palette is intentionally restricted to maximize psychological impact and legibility.

- **Primary (Vivid Red):** Used for all critical actions, brand accents, and active states. It signals importance and urgency.
- **Secondary (Soft Beige):** The primary canvas color. It reduces eye strain compared to pure white and provides a sophisticated, "tactical-paper" feel.
- **Deep Black:** Reserved strictly for text and structural borders to ensure maximum contrast ratios (exceeding WCAG AAA where possible).
- **Surface White:** Used sparingly for card interiors to lift content off the beige background for better information grouping.

## Typography

The typographic scale prioritizes rapid scanning. 

- **Headings:** **Plus Jakarta Sans** provides a modern, approachable geometry that remains legible even at high weights.
- **Body:** **Work Sans** is used for its professional and grounded characteristics, ensuring that coordination details and safety instructions are easy to digest.
- **Labels:** **Space Grotesk** is utilized for technical data, timers, and status labels to provide a subtle "utility/tactical" aesthetic that distinguishes data from prose.

## Layout & Spacing

This design system uses a **Fluid Grid** optimized for touch targets. On mobile, the standard margin is 20px to prevent accidental edge-taps while providing a breathable frame for the content.

- **The 8px Rule:** All spacing between elements must be a multiple of 8px (8, 16, 24, 32, 64).
- **Safe Zones:** Critical buttons (SOS, Check-in) must maintain a minimum 24px vertical clearance from other interactive elements.
- **Mobile First:** On desktop, the content container is capped at 480px for a centered "handheld" experience that maintains the urgency of the mobile layout.

## Elevation & Depth

To maintain an authoritative and reliable feel, this design system avoids soft shadows and complex gradients. Depth is achieved through **Tonal Layering** and **Bold Outlines**:

- **Level 0 (Base):** Soft Beige background.
- **Level 1 (Cards):** White surfaces with a 1px Deep Black border for standard information.
- **Level 2 (Urgent):** White surfaces with a 2px Vivid Red border. This is used for active alerts or highlighted safety status cards.
- **Interactive:** Elements do not "hover" or "float" with shadows; instead, they use high-contrast color shifts (e.g., Red to Black) to indicate state changes.

## Shapes

The shape language is **Rounded (0.5rem / 8px)**. This radius is applied to all buttons, input fields, and cards. It provides a "friendly-modern" feel that softens the intensity of the Vivid Red and Deep Black palette. 

- **Buttons:** Use a consistent 8px radius.
- **Emphasis Containers:** Use 16px (rounded-lg) to create a distinct visual envelope for grouped coordination data.
- **Icons:** Use a 2px stroke weight to match the "heavy" border tokens, ensuring icons feel integrated with the UI frame.

## Components

### Buttons
- **Primary:** Solid Vivid Red background with Pure White text. Bold weight.
- **Secondary:** Transparent background with a 2px Vivid Red border and Vivid Red text.
- **Critical (SOS):** Large circular button with a 4px Red ring offset, designed for "no-look" tapping.

### Cards
- **Safety Card:** White background, 2px Vivid Red border. Used for location sharing and active safety sessions.
- **Standard Card:** White background, 1px Deep Black border. Used for settings or history.

### Inputs & Fields
- **Text Fields:** Soft Beige background (slightly darker than page bg) with a 1px Black bottom-border only. Labels use Space Grotesk in all-caps.

### Progress & Timers
- **Countdown Timers:** Displayed in Space Grotesk. 
- **Progress Bars:** Solid Vivid Red fill on a Deep Black track. High contrast is mandatory to show remaining "Safe Time."

### Status Chips
- **Active:** Solid Red background, white text, pill-shaped.
- **Pending/Inactive:** White background, Black border, black text.