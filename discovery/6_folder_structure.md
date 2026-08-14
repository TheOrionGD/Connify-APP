# 6. Folder Structure

This document outlines the current workspace organization and the planned folder structure for the frontend client app, backend gateway, and documentation files.

## 6.1 Current Workspace Organization

```
CONNIFY-APP/
├── App UI/               # Visual design mockups & tailwind specification sheets
│   ├── accept_verify/
│   ├── dashboard/
│   ├── new_help_request/
│   └── ... (27 screen spec folders)
├── Connify/              # React Native Mobile Application (CLI)
│   ├── android/          # Native Android studio project files
│   ├── ios/              # Native iOS Xcode project files
│   ├── src/              # Application source (screens, components, services, stores)
│   ├── App.tsx           # Entry application component
│   ├── index.js          # Entry application bundle index
│   └── package.json      # React Native dependencies
├── backend/              # Fastify API Service (MongoDB Atlas + Mongoose)
│   ├── src/              # Backend TypeScript source (see §6.3)
│   ├── tests/            # Integration test suites (27/27 passing)
│   └── package.json      # Fastify dependencies
├── Instantsite/          # Vite + React web landing page
│   ├── src/
│   │   ├── components/   # SafetyProtocolFeatures, HowItWorks, etc.
│   │   └── App.tsx       # Landing page root
│   └── package.json
├── discovery/            # Phase 1–18 discovery & documentation deliverables
│   ├── 1_project_analysis_report.md
│   ├── 2_asset_inventory.md
│   ├── 3_screen_inventory.md
│   ├── 4_navigation_map.md
│   ├── 5_user_flow.md
│   ├── 6_folder_structure.md
│   ├── 7_phases_and_completion.md
│   └── Connify_System_Architecture.md
├── LICENSE               # MIT License
└── README.md             # Systems overview & specifications
```

---

## 6.2 Mobile Client Internal Structure (`Connify/src/`)

```
Connify/src/
├── assets/                 # Static asset directories
│   ├── images/             # PNG / JPEG layout components
│   ├── icons/              # Scalable Vector Graphics (SVG)
│   ├── fonts/              # Custom typeface families (Plus Jakarta Sans, Space Grotesk)
│   └── animations/         # Lottie JSON files for loader/spinner animations
├── components/             # Reusable UI component modules
│   ├── common/             # Modals, loading indicators, dividers
│   ├── buttons/            # Standard, outline, SOS buttons
│   ├── cards/              # Episode status cards, nearby request cards
│   ├── inputs/             # Urgency sliders, category selectors, form fields
│   ├── modals/             # EmergencyCountdownModal, AcceptorVerificationModal [v2.0]
│   └── layout/             # Safe area wrappers, keyboard scroll views
├── navigation/             # Routing stack, tab bar configurations
│   ├── AppNavigator.ts     # Root switcher (Onboarding vs Main Application)
│   ├── TabNavigator.ts     # Bottom tab bar setup (Dashboard, History, Settings)
│   └── StackNavigators.ts  # Requester, Helper, and Profile migration sub-stacks
├── screens/                # State-aware screen components
│   ├── Onboarding/         # Welcome, Permissions, Setup
│   ├── Profile/            # ProfileUpgradeScreen, GuardianRegistrationScreen [v2.0]
│   ├── Requester/          # CreateRequest, RequestVerification, Searching
│   ├── Helper/             # NearbyRequests, AcceptVerify, ProximityVerification
│   ├── ActiveEpisode/      # RequesterActive, HelperActive
│   ├── Feedback/           # FeedbackScreen (SAFE_RESOLVED / SUSPICIOUS_BEHAVIOR / ACTIVE_THREAT)
│   ├── Settings/           # SettingsScreen, HistoryScreen
│   └── Governance/         # GovernanceScreen [v2.0]
├── services/               # API clients and background tasks
│   ├── api/                # Axios configuration, interceptors, auth relays
│   │   ├── locationApi.ts  # POST /api/locations/ping (5s GPS watchdog) [v2.0]
│   │   ├── profileApi.ts   # POST /api/profile/upgrade [v2.0]
│   │   └── episodeApi.ts   # Episode CRUD + threat-abort [v2.0]
│   └── UserVerificationService.ts  # Ed25519 signing, challenge nonce verification [v2.0]
├── stores/                 # Zustand state stores
│   ├── episodeStore.ts     # Episode lifecycle state machine
│   ├── locationStore.ts    # GPS watchdog ping state [v2.0]
│   └── authStore.ts        # Firebase Auth state & anonymous→registered transition [v2.0]
├── hooks/                  # Custom React Hooks (e.g. useLocation, useSocket, useGPSWatchdog)
├── utils/                  # Cryptographic math functions, date formats
│   ├── sharp.ts            # BCH syndrome calculations and grid index blinding
│   └── helpers.ts          # Validation & text operations
├── constants/              # Key names, limits, configuration definitions
├── contexts/               # Custom React contexts (Theme, Socket connections)
├── theme/                  # Design Tokens & variables
│   ├── colors.ts           # Material 3 hex specifications
│   ├── typography.ts       # Size, family, weight config
│   └── spacing.ts          # Padding & borders layout constants
└── storage/                # Storage interfaces (AsyncStorage, SecureStore)
```

---

## 6.3 Backend Structure (`backend/src/`)

```
backend/src/
├── config/                 # Environment validation & DB credentials
├── controllers/            # Request handlers
│   ├── EpisodeController.ts     # Episode creation, threat-abort, lifecycle
│   ├── OutcomeController.ts     # Outcome logging: SAFE_RESOLVED / SUSPICIOUS_BEHAVIOR / ACTIVE_THREAT
│   ├── LocationController.ts    # GPS ping, guardian registration, watchdog scan [v2.0]
│   └── ProfileController.ts     # Anonymous → Registered profile upgrade [v2.0]
├── middleware/             # Rate limit rules, JWT validations
│   └── authenticate.ts          # Ed25519 JWT verification
├── models/                 # Mongoose schemas & TypeScript interfaces
│   ├── index.ts                  # Device, Episode, Profile, Outcome, AuditLog
│   ├── Guardian.ts               # Guardian model: userFullName, fullName, phone, relationship [v2.0]
│   └── DeviceLocation.ts         # 5s atomic GPS record: latitude, longitude, lastPingAt, signalLostAlertSent [v2.0]
├── routes/                 # Fastify route endpoint registrations
│   ├── episodes.ts               # POST /api/episodes, POST /api/episodes/:id/threat-abort
│   ├── outcomes.ts               # POST /api/outcomes
│   ├── locations.ts              # POST /api/locations/ping|guardians|watchdog/scan [v2.0]
│   └── profileRoutes.ts          # POST /api/profile, POST /api/profile/upgrade [v2.0]
├── services/               # Core business logic & safety engines
│   ├── BehavioralRiskEngine.ts   # 5-Pillar harmlessness scoring, velocity detection, quarantine [v2.0]
│   ├── LocationWatchdogService.ts # 5s atomic GPS, 15s signal loss, Guardian SMS, recovery [v2.0]
│   └── KeyService.ts             # Ed25519 key management, JWT signing
├── types/                  # TypeScript interface definitions
├── utils/                  # Logging & audit functions
│   └── audit.ts                  # writeAuditLog — cryptographic audit trail
└── app.ts                  # Fastify application builder & route registration
```

---

## 6.4 Test Suite Structure (`backend/tests/`)

```
backend/tests/
├── symmetricVerificationPipeline.test.ts  # 10 tests — Ed25519 challenge, nonce, replay defense, Trust Capsule
├── harmlessnessSystem.test.ts             # 6 tests  — 5-Pillar harmlessness, velocity trap, threat abort, quarantine
├── locationWatchdog.test.ts               # 6 tests  — 5s GPS ping, 15s loss, Guardian SMS, unbounded recovery
└── profileMigration.test.ts              # 5 tests  — Anonymous baseline, profile upgrade, DB state, episode creation, SMS personalization
```

**Total: 27 / 27 tests passing (100%)**
