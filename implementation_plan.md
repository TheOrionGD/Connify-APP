# Implementation Plan: UI/UX Pro Max Upgrade for Connify

This implementation plan outlines the full UI/UX overhaul of the **Connify** React Native mobile application, based on the **UI-UX Pro Max** design system guidelines (*Cinema Dark & OLED Emergency Safety Aesthetic*).

---

## User Review Required

> [!IMPORTANT]
> **Design Theme & Aesthetics**:
> The app UI will feature a dual-tone **Cinema Dark & Vivid Emergency** aesthetic:
> - **Primary Accent**: Crimson Alert Red (`#DC2626`) & Vivid Safety Red (`#EF4444`) with high-contrast `#FFFFFF` text.
> - **Surface Hierarchy**: `#050506` deep base, `#0E1320` elevated dark containers, `rgba(255, 255, 255, 0.08)` hairline borders.
> - **Card Design**: 16px radius cards, glowing status indicator dots, and micro-interactions.

---

## Proposed Changes

### 1. Design System & Theme Overhaul (`Connify/src/theme/`)

#### [MODIFY] [colors.ts](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/theme/colors.ts)
- Add dark surface tokens (`#050506`, `#0E1320`, `#161C2E`), vibrant alert status tokens, glow shadow colors, and accessibility-compliant text contrast ratios.

#### [MODIFY] [spacing.ts](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/theme/spacing.ts)
- Standardize radius tokens (`radiusSm: 8`, `radiusMd: 12`, `radiusLg: 16`, `radiusFull: 999`), card padding (`16px`), and container margins (`20px`).

#### [MODIFY] [typography.ts](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/theme/typography.ts)
- Define crisp typography hierarchy (Hero headers, technical bold labels, body text, metric badges).

---

### 2. Buttons, Cards & Component Library (`Connify/src/components/`)

#### [MODIFY] [SOSButton.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/buttons/SOSButton.tsx)
- Add concentric animated pulse rings, glowing shadow backdrop, and high-visibility SOS typography.

#### [MODIFY] [StandardCard.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/cards/StandardCard.tsx) & [SafetyCard.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/cards/SafetyCard.tsx)
- Update cards to 16px border radius with subtle hairline border (`rgba(255, 255, 255, 0.08)`), top-edge highlight, and elevated elevation.

#### [MODIFY] [ProfileSetupModal.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/common/ProfileSetupModal.tsx)
- Format medical inputs as structured **Radio Chips** (Blood Group) and **Checkbox Tiles** (Allergies & Conditions). Upgrade Phone OTP badge and Google Auth button.

#### [MODIFY] [FeedbackModal.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/common/FeedbackModal.tsx)
- Refine bottom-sheet feedback card with custom radio options and high-visibility submission action button.

---

### 3. Screen-by-Screen UI Upgrades (`Connify/src/screens/`)

#### [MODIFY] [DashboardScreen.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/screens/Requester/DashboardScreen.tsx)
- Add top header role switcher pill ("I Need Help" vs "I Can Help Nearby").
- Upgrade SOS hero trigger section with glowing pulse backdrop.
- Enhance Device ID Lock stat card with dynamic truncated device hash (`ed25519 (4a2f8b...)`).

#### [MODIFY] [SearchingScreen.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/screens/Requester/SearchingScreen.tsx)
- Upgrade central radar sweep animation with multi-ring expansion, live status text, and cancel action pill.

#### [MODIFY] [NearbyRequestsScreen.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/screens/Helper/NearbyRequestsScreen.tsx)
- Upgrade live feed cards with distance pill badges (`📍 < 50m (Immediate)`), urgency level badges (Level 1-5), and prominent `OFFER SUPPORT` action buttons.

#### [MODIFY] [EmergencyScreen.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/screens/ActiveEpisode/EmergencyScreen.tsx)
- Upgrade full-screen active broadcast alert mode with countdown timer display, +5 min extension button, and identity handshake launcher.

---

## Verification Plan

### Automated Verification
- Run `npm run build` in `backend`.
- Run `npm test` in `Connify` to verify all 55 unit tests pass.

### Manual Verification
1. **Visual Appeal**: Verify high-contrast cards, glowing SOS button, and crisp typography across light/dark screens.
2. **Interactive Flow**: Trigger SOS -> Acknowledge modal -> Searching radar -> Active emergency -> Feedback modal -> Profile setup.
