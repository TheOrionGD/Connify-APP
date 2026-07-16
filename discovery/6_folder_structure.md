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
│   ├── App.tsx           # Entry application component
│   ├── index.js          # Entry application bundle index
│   └── package.json      # React Native dependencies
├── backend/              # Fastify & Prisma API Service
│   ├── src/              # Backend TypeScript source
│   ├── prisma/           # Schema configurations & migrations
│   └── package.json      # Fastify dependencies
├── discovery/            # Phase 1-3 discovery deliverables
│   ├── 1_project_analysis_report.md
│   ├── 2_asset_inventory.md
│   ├── 3_screen_inventory.md
│   ├── 4_navigation_map.md
│   ├── 5_user_flow.md
│   └── 6_folder_structure.md
├── LICENSE               # MIT License
├── README.md             # Systems overview & specifications
└── Connify_System_Architecture.md # Complete architectural requirements
```

---

## 6.2 Planned Mobile Client Internal Structure (`Connify/src/`)

To support scalability, reusable UI elements, and a clean separation of concerns, we will structure the React Native codebase under a `src` directory as follows:

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
│   └── layout/             # Safe area wrappers, keyboard scroll views
├── navigation/             # Routing stack, tab bar configurations
│   ├── AppNavigator.js     # Root switcher (Auth vs Main Application)
│   ├── TabNavigator.js     # Bottom tab bar setup (Dashboard, History, Settings)
│   └── StackNavigators.js  # Requester and Helper sub-stacks
├── screens/                # State-aware screen components
│   ├── Onboarding/         # Welcome, Permissions, Setup
│   ├── Requester/          # CreateRequest, RequestVerification, Searching
│   ├── Helper/             # NearbyRequests, AcceptVerify, ProximityVerification
│   ├── ActiveEpisode/      # RequesterActive, HelperActive
│   ├── Feedback/           # FeedbackScreen
│   └── Settings/           # SettingsScreen, HistoryScreen
├── services/               # API clients, local DB connectors
│   └── api/                # Axios configuration, interceptors, authentication relays
├── hooks/                  # Custom React Hooks (e.g. useLocation, useSocket)
├── utils/                  # Cryptographic math functions, date formats
│   ├── sharp.js            # BCH syndrome calculations and grid index blinding
│   └── helpers.js          # Validation & text operations
├── constants/              # Key names, limits, configuration definitions
├── contexts/               # Custom React contexts (Theme, Socket connections)
├── theme/                  # Design Tokens & variables
│   ├── colors.js           # Material 3 hex specifications
│   ├── typography.js       # Size, family, weight config
│   └── spacing.js          # Padding & borders layout constants
└── storage/                # Storage interfaces (AsyncStorage, SecureStore)
```

---

## 6.3 Planned Backend Structure (`backend/src/`)

We will utilize Fastify's plugin-based ecosystem to build the API layer:

```
backend/src/
├── config/                 # Environment validation & DB credentials
├── controllers/            # Request handlers (episodes, capsules, feedback)
├── middleware/             # Rate limit rules, JWT validations
├── routes/                 # Fastify route endpoints
├── services/               # Cryptographic validation & matching algorithms
│   ├── sharpService.ts     # Bloom filter checks, BCH syndrome verifications
│   └── matchingService.ts  # PostGIS location calculations
├── sockets/                # Socket.IO handlers for active chat & calling
├── types/                  # TypeScript interface definitions
├── utils/                  # Logging & string functions
└── workers/                # BullMQ background tasks (expiry and retention)
```
