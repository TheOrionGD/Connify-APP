# Animation Effects Implementation Plan

This plan outlines the integration of the requested animation effects using `react-native-reanimated` and standard Animated across the specified screens in the Connify App to enhance user feedback and communication.

## User Review Required

- Please review the mapping of animations to the specific screens and components below to ensure it aligns with your vision.
- Some animations (like "Morphing / Convergence" and "Progressive Drawing") can be complex to implement purely with SVG paths and Reanimated without specific Lottie assets. We will use `react-native-reanimated` with `react-native-svg` to implement these programmatically. Is this acceptable, or do you have custom Lottie JSON files for these?
- The "Layered Lottie/Reanimated-style success animation" will be created as a reusable `SuccessModal` component. Should this modal automatically close after the animation, or wait for user interaction?

## Proposed Changes

We will create a centralized `src/components/animations` directory for reusable animation components and integrate them into the relevant screens.

### `src/components/animations/` (New Components)

#### [NEW] [PulseRipple.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/animations/PulseRipple.tsx)
- Reusable component for the **Pulse / Ripple** animation.
- Communicates nearby signal/activity.

#### [NEW] [SignalFlow.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/animations/SignalFlow.tsx)
- Reusable component for **Particle / Signal Flow** and **Morphing / Convergence**.
- Used for SHARP verification and handshake to communicate environmental signals.

#### [NEW] [ShieldCapsule.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/animations/ShieldCapsule.tsx)
- Reusable component for **Shield/Capsule Formation** and **Progressive Drawing**.
- Visually unfolds cryptographic process and temporary secure channels.

#### [NEW] [NodeConnection.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/animations/NodeConnection.tsx)
- Visualizes two devices becoming connected (**Node Connection**).

#### [NEW] [LayeredSuccess.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/components/animations/LayeredSuccess.tsx)
- Implements the comprehensive success animation:
  - Spring scale-in for the modal
  - Particle burst around the central object
  - Signal-wave animation
  - SVG path-drawing for the shield/capsule
  - Morph/convergence animation
  - Checkmark stroke animation
  - Text fade + slide-up
  - Button scale-in
  - Haptic feedback trigger

### Screen Integrations

#### [MODIFY] [DashboardScreen.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/screens/Requester/DashboardScreen.tsx)
- Integrate **Pulse / Ripple** to indicate proximity detection / live status.
- Integrate **Subtle Haptic + Motion** on the SOS button trigger.

#### [MODIFY] [SearchingScreen.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/screens/Requester/SearchingScreen.tsx)
- Enhance the existing radar with a more robust **Radar Sweep** animation using Reanimated.

#### [MODIFY] [HandshakeScreen.tsx](file:///o:/PROJECTS/CONNIFY-APP/Connify/src/screens/Helper/HandshakeScreen.tsx)
- Integrate **Particle / Signal Flow** and **Morphing / Convergence** during the "Verifying Signature..." phase.
- Trigger the **LayeredSuccess** modal upon successful handshake.
- Integrate **Break / Dissolve** for handshake failures.

## Verification Plan

### Automated Tests
- Type checking with `tsc`.
- Ensure there are no React Native Reanimated warnings in the console.

### Manual Verification
- Deploy to an emulator/device (Expo Go).
- Trigger the SOS flow to observe Radar Sweep and SOS Button haptics.
- Complete a Handshake flow to observe the Signal Flow, Morphing, and the Layered Success animation.
- Verify that performance is not degraded during animations (60fps).
