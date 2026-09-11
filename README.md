# CONNIFY: Decentralized Zero-Knowledge Connection Protocol Between Strangers & Peer-to-Peer Community Mesh

> **Production System, Cryptographic Protocol & Full-Stack Monorepo Architectural Specification**  
> **Repository Target**: `TheOrionGD/Connify-APP`  
> **Core Mission**: *Connify is not just an emergency app—at its foundation, Connify is a decentralized protocol for connecting strangers in physical proximity.*  
> **Monorepo Workspaces**:
> - `backend`: Fastify 5 + TypeScript + MongoDB (Prisma & Mongoose) + Socket.IO + Ed25519 / TweetNaCl
> - `Connify`: React Native 0.86.0 + React 19 + TypeScript + Expo Metro (Android / iOS / Web) + Zustand 5 + Notifee + VisionCamera + Hardware Keypair Keystore
> - `patent`: SHARP Protocol (Galois Field $\text{GF}(2^4)$ $\text{BCH}(15,7)$ Spatial Matching Engine & Patent Specifications)

---

## Table of Contents
1. [Core Philosophy & System Overview](#1-core-philosophy--system-overview)
   - [1.1 The Core Thesis: Safe Connection Between Strangers](#11-the-core-thesis-safe-connection-between-strangers)
   - [1.2 The Stranger Trust & Privacy-Accuracy Paradox](#12-the-stranger-trust--privacy-accuracy-paradox)
   - [1.3 The Connify Architecture for Peer-to-Peer Connection](#13-the-connify-architecture-for-peer-to-peer-connection)
2. [Monorepo Architectural Blueprint](#2-monorepo-architectural-blueprint)
3. [Cryptographic Foundation: The SHARP Protocol](#3-cryptographic-foundation-the-sharp-protocol)
   - [3.1 Mathematical Mechanics of Zero-Knowledge Proximity](#31-mathematical-mechanics-of-zero-knowledge-proximity)
4. [Backend Service Architecture (`backend`)](#4-backend-service-architecture-backend)
   - [4.1 Lifecycle & Startup Sequence](#41-lifecycle--startup-sequence)
   - [4.2 Data Models & Persistence Invariants](#42-data-models--persistence-invariants)
   - [4.3 Comprehensive REST API Endpoints](#43-comprehensive-rest-api-endpoints)
   - [4.4 Global Error Codes & Handling](#44-global-error-codes--handling)
5. [Background Engines & Autonomous Security Daemons](#5-background-engines--autonomous-security-daemons)
   - [5.1 Location Watchdog Daemon & Signal-Loss Protocol](#51-location-watchdog-daemon--signal-loss-protocol)
   - [5.2 Behavioral Risk & Anti-Luring Engine](#52-behavioral-risk--anti-luring-engine)
   - [5.3 Socket.IO Ephemeral Real-Time Mesh Architecture](#53-socketio-ephemeral-real-time-mesh-architecture)
   - [5.4 Hash-Chained Tamper-Evident Audit Ledger](#54-hash-chained-tamper-evident-audit-ledger)
6. [Mobile & Multi-Platform Client Architecture (`Connify`)](#6-mobile--multi-platform-client-architecture-connify)
   - [6.1 Native Hardware Modules & Keypair Derivation](#61-native-hardware-modules--keypair-derivation)
   - [6.2 State Management (Zustand Stores)](#62-state-management-zustand-stores)
   - [6.3 The 25 Operational Application Screens](#63-the-25-operational-application-screens)
   - [6.4 The 22 Peer Request & Assistance Categories](#64-the-22-peer-request--assistance-categories)
   - [6.5 Offline Resilience & Transaction Queue](#65-offline-resilience--transaction-queue)
   - [6.6 Covert Duress, Stalled Responders & Safety Checks](#66-covert-duress-stalled-responders--safety-checks)
   - [6.7 Android Home & Lock Screen Widget Integration](#67-android-home--lock-screen-widget-integration)
7. [Auxiliary Utilities & Engine Systems](#7-auxiliary-utilities--engine-systems)
   - [7.1 AI Hazard Cross-Verification Service](#71-ai-hazard-cross-verification-service)
   - [7.2 Standardized Emergency SMS Formatter](#72-standardized-emergency-sms-formatter)
   - [7.3 Cryptographic Incident Audit Report Generator](#73-cryptographic-incident-audit-report-generator)
8. [Development Workflow & Environment Configuration](#8-development-workflow--environment-configuration)
   - [8.1 Prerequisites & Tooling](#81-prerequisites--tooling)
   - [8.2 Environment Variables Configuration](#82-environment-variables-configuration)
   - [8.3 Installation & Startup Commands](#83-installation--startup-commands)
9. [Automated Testing Frameworks](#9-automated-testing-frameworks)
   - [9.1 Backend Test Suites](#91-backend-test-suites)
   - [9.2 Mobile & Client Test Suites](#92-mobile--client-test-suites)
10. [Release Engineering & Version Synchronization](#10-release-engineering--version-synchronization)
11. [Security, Privacy & Regulatory Compliance](#11-security-privacy--regulatory-compliance)
12. [Monorepo Dependency Matrix](#12-monorepo-dependency-matrix)
13. [License](#13-license)

---

## 1. Core Philosophy & System Overview

### 1.1 The Core Thesis: Safe Connection Between Strangers

At its core, **Connify is a decentralized protocol for connecting strangers in physical proximity**. 

In modern urban environments, thousands of human beings walk past each other every day, isolated by digital silos. When someone is stranded with a flat tire, searching for a lost child, navigating an unfamiliar neighborhood at night, seeking transport in an emergency, or facing an acute crisis, the fastest and most capable source of support is almost always a **nearby stranger**.

However, reaching out to strangers in the real world is fraught with friction, distrust, and danger. Connify eliminates this barrier by building an **ad-hoc, zero-knowledge human mesh network**:

```
                       ┌─────────────────────────────────────────┐
                       │           THE CONNIFY MESH              │
                       │     (Connection Between Strangers)      │
                       └────────────────────┬────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│   EVERYDAY MUTUAL     │       │   SITUATIONAL TRUST   │       │   HIGH-URGENCY        │
│   COMMUNITY AID       │       │   & SAFE ESCORTS      │       │   PEER ASSISTANCE     │
├───────────────────────┤       ├───────────────────────┤       ├───────────────────────┤
│ • Stranded & breakdown│       │ • Safe companion walk │       │ • Medical emergencies │
│ • Transport & rides   │       │ • Danger spot alerts  │       │ • Panic & harassment  │
│ • Lost child / senior │       │ • Timed journey guard │       │ • Fire / disaster     │
│ • Blood & med supply  │       │ • Witness attestation │       │ • Offline SMS mesh    │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

Connify enables two nearby strangers to:
1. **Discover Each Other Without Disclosing Location**: Match within a local geographic radius without broadcasting raw coordinates to a central database or to potential stalkers.
2. **Authenticate the Rendezvous Instantly**: Perform a zero-trust cryptographic QR handshake using hardware-bound Ed25519 keypairs.
3. **Mint Just-In-Time (JIT) Trust Capsules**: Create short-lived, verifiable peer connections that grant temporary communication and coordination privileges without sharing phone numbers, real names, or permanent identities.
4. **Build Decentralized Trust Scores**: Reward positive interactions with XP, Trust Badges, and reputation tokens while autonomously quarantining malicious actors.

---

### 1.2 The Stranger Trust & Privacy-Accuracy Paradox

Connecting strangers in physical space presents two fundamental paradoxes:

#### Paradox 1: The Stranger Trust Paradox (Anti-Luring & Safety)
Without verifiable identity and behavioral evaluation, bad actors can exploit peer-to-peer networks to manufacture fake requests, luring well-meaning strangers into secluded or dangerous physical traps. Connify solves this through:
- **Hardware-Derived Ed25519 Node Identity**: Cryptographically locks identity to the device hardware keystore.
- **Dynamic Behavioral Risk Engine**: Enforces velocity caps ($>2$ broadcasts in 10 minutes), requires mandatory emergency guardians on file, tracks resolution ratios, and applies reputation penalties.
- **Bystander Witness Attestations**: Allows third-party bystanders to co-sign the physical encounter.

#### Paradox 2: The Coordinate Jitter & Privacy Paradox
Traditional matching algorithms require transmitting plaintext GPS coordinates $(lat, lng)$ to a central cloud server, exposing users to continuous physical tracking and mass surveillance.
Attempting to hide coordinates using standard cryptographic hashes ($\text{SHA-256}(lat \parallel lng)$) fails due to natural mobile sensor drift ($5\text{ m}$ drift breaks exact hash matching):
$$\text{SHA-256}(12.97159, 77.59456) \ne \text{SHA-256}(12.97163, 77.59460)$$

---

### 1.3 The Connify Architecture for Peer-to-Peer Connection

Connify solves the privacy-accuracy paradox through an integrated mathematical and cryptographic pipeline:
- **Zero-Knowledge Proximity Discovery (The SHARP Protocol)**: Converts coordinates into a 9-cell spatial neighborhood, encodes them into a 1024-bit Bloom filter, and applies $\text{BCH}(15,7)$ error-correcting codes over Galois Field $\text{GF}(2^4)$ arithmetic. Clients transmit only parity syndromes and blinded hashes. Approaching responders use the parity bytes to mathematically correct sensor drift and reconstruct the spatial vector on their own device.
- **Hardware-Derived Identity**: Mobile clients deterministically derive an Ed25519 public/private keypair and a 64-character SHA-256 device fingerprint using `DeviceInfo.getUniqueId()` and a persistent installation UUID. Keys are locked within Android Keystore / iOS Keychain.
- **Just-In-Time (JIT) Trust Capsules**: Emergency and mutual aid access grants are minted as short-lived (2-hour TTL) Ed25519-signed JSON Web Signatures (JWS) via `jose`. The central server stores only the SHA-256 digest of the token; the bearer token never resides in the database.
- **Watchdog Signal-Loss Daemon**: An autonomous background daemon scans active sessions every 10 seconds. If a device stops transmitting telemetry for $\ge 15$ seconds, the server automatically triggers push alerts via Firebase Cloud Messaging (FCM) and transactional emails via Brevo to all registered emergency guardians, complete with last-known Google Maps coordinates.
- **Append-Only Hash-Chained Audit Ledger**: All lifecycle transitions are chained cryptographically using $H_n = \text{SHA-256}(H_{n-1} \parallel \text{EventType} \parallel \text{EpisodeID})$.
- **Behavioral Harmlessness Risk Engine**: Prevents predatory luring by dynamically capping accounts that broadcast $>2$ episodes within 10 minutes, penalizing uncompleted episodes, and strictly enforcing mandatory guardian registration prior to broadcast.
- **Dual-Mode Offline Synchronization & Widget Bridges**: If offline, emergency transactions are queued locally with expiry timestamps. When network returns, the queue flushes chronologically. Users can also fall back to 1-tap cellular SMS alerts containing offline satellite GPS coordinates or trigger emergency modes from Android native widgets.

---

## 2. Monorepo Architectural Blueprint

The codebase is organized as a high-performance monorepo:

```
o:\PROJECTS\CONNIFY-APP\
├── backend/                       # Fastify 5 Zero-Trust Node.js Service
│   ├── prisma/
│   │   ├── migrations/            # Migration schema history
│   │   └── schema.prisma          # MongoDB Atlas data models & indexes
│   ├── src/
│   │   ├── config/                # Environment schema (Zod) & Firebase Admin SDK
│   │   ├── controllers/           # HTTP controllers (Device, Episode, Capsule, Outcome, Location, Profile)
│   │   ├── middleware/            # JWT & Firebase bearer authentication, error handlers
│   │   ├── models/                # Mongoose Document models & schema definitions
│   │   ├── routes/                # REST endpoint declarations (/api/*)
│   │   ├── services/              # Risk engine, Key management, Watchdog scanner
│   │   ├── sockets/               # Ephemeral Socket.IO real-time channel coordinator
│   │   ├── types/                 # Shared TypeScript interfaces
│   │   ├── utils/                 # BCH(15,7) SHARP math, hash chaining, DB connections
│   │   ├── app.ts                 # Fastify application builder & plugin registration
│   │   └── server.ts              # Entrypoint: keys, DB, HTTP, Socket.IO, watchdog loop
│   ├── tests/                     # Node.js native test runner suite (10 test suites)
│   ├── package.json               # Backend dependencies (v3.7.5)
│   └── tsconfig.json              # TypeScript compiler configuration
│
├── Connify/                       # React Native Multi-Platform Client (Android / iOS / Web)
│   ├── android/                   # Native Android project, Gradle build system, ProGuard
│   ├── ios/                       # Native iOS Xcode project & Podfile
│   ├── assets/                    # Typography, imagery, Lottie, and sound assets
│   ├── patches/                   # Hotfixes applied via patch-package
│   ├── src/
│   │   ├── components/            # UI atoms, animations, buttons, cards, chat, inputs, modals, map
│   │   ├── data/                  # Static emergency data & local registries
│   │   ├── navigation/            # Bottom tab bar & native stack screen navigators
│   │   ├── screens/               # 25 operational screens across requester, helper & safety flows
│   │   │   ├── ActiveEpisode/     # EmergencyScreen (live incident, countdown, chat, escort)
│   │   │   ├── Feedback/          # FeedbackScreen (incident outcome, photo verification, audit)
│   │   │   ├── Governance/        # GovernanceScreen, ProtocolExplainerScreen, WitnessContactsScreen
│   │   │   ├── Hazard/            # HazardMapScreen (community risk map, AI verification)
│   │   │   ├── Helper/            # NearbyRequestsScreen, HandshakeScreen (QR scan & JIT capsule)
│   │   │   ├── Onboarding/        # SplashScreen, WelcomeScreen, GoogleAuthSuccessScreen, OnboardingScreen
│   │   │   ├── Requester/         # DashboardScreen, CreateRequestScreen, SearchingScreen
│   │   │   ├── SafetyGuard/       # TimedSafetyGuardScreen (quiet journey countdown)
│   │   │   ├── Settings/          # SettingsScreen, HistoryScreen, FrequentLocationsScreen
│   │   │   ├── EmergencyContactsScreen.tsx
│   │   │   ├── FakeCallScreen.tsx
│   │   │   ├── GovernmentEmergencyNumbersScreen.tsx
│   │   │   ├── OfflineEmergencyScreen.tsx
│   │   │   ├── UnifiedSafetyHubScreen.tsx
│   │   │   └── WomenSafetyScreen.tsx
│   │   ├── services/              # Biometrics, Keychain, Socket.IO, Geolocation, Queue, Widget Sync
│   │   │   └── api/               # Axios API wrappers with interceptors
│   │   ├── stores/                # Zustand state stores (Auth, Episode, Hazard, Location, Reward, Theme, Frequent)
│   │   ├── theme/                 # Design tokens, color palettes, typography scale
│   │   ├── types/                 # Shared frontend TypeScript interfaces
│   │   ├── utils/                 # Pure JS SHARP protocol, phone normalizer, report generator, SMS
│   │   └── widgets/               # Android Widget Bridge & Synchronization Service
│   ├── __tests__/                 # Jest component & unit test suites (11 test suites)
│   ├── bump_version.js            # Monorepo version synchronizer across all packages
│   ├── package.json               # Mobile dependencies (v3.7.5, React Native 0.86.0)
│   └── react-native.config.js     # Native asset and vector icon linkage
│
├── patent/                        # Patent Specification & Mathematical Foundations
│   ├── sharp_protocol_patent.md   # Legal & technical patent specification
│   ├── patent_analysis.md         # Deep claim breakdown & sequence charts
│   ├── patent_specification.txt   # Formal patent text document
│   ├── custom_invented_algorithm_code.txt # Standalone reference implementation of SHARP
│   ├── existing_algorithm_code.txt # Prior-art baseline comparison
│   ├── cpm_algorithm_analysis.xlsx # Critical Path Method benchmark data
│   └── cpm_real_gantt_chart.xlsx  # Mathematical convergence & latency validation
│
├── run_emulator.bat               # Android emulator launch helper
├── run_emulator.ps1               # PowerShell emulator runner script
├── start_dev.bat                  # Concurrent backend & web bundler runner
├── ACCOUNT_DELETION_GOOGLE_FORM_SETUP.md # Compliance guide for Play Store / App Store
├── PRIVACY_POLICY.md              # Zero-trace privacy and data retention policy
└── LICENSE                        # MIT License
```

---

## 3. Cryptographic Foundation: The SHARP Protocol

The **Syndrome-Based Error-Correction Spatial Matching (SHARP)** engine operates over Galois Field arithmetic to solve the GPS noise problem in zero-knowledge location matching between strangers.

```mermaid
sequenceDiagram
    autonumber
    participant A as Requester (Stranger A)
    participant S as Fastify Central Node
    participant B as Volunteer Peer (Stranger B)

    Note over A: 1. Sample GPS (lat, lng)<br/>2. Round coordinates to 3 decimal places<br/>3. Compute 9-cell spatial neighborhood
    Note over A: 4. Vectorize cells into 1024-bit Bloom filter (4x FNV-1a)<br/>5. Slice into 146x 7-bit blocks (m7)<br/>6. BCH(15,7) over GF(2^4) -> Extract 8-bit Parity Syndromes<br/>7. Blind cells: SHA-256(SessionKey : CellID : Role)
    A->>S: POST /api/episodes (Syndromes Hex + Blinded Hashes)<br/>[Raw coordinates are never sent]
    S->>B: Socket.IO /feed -> Broadcast New Request (Syndromes + Blinded Hashes)
    Note over B: 8. Sample local GPS<br/>9. Generate local 1024-bit Bloom filter<br/>10. Combine local 7-bit blocks with received 8-bit syndromes<br/>11. BCH Decode over GF(2^4) -> Fix bit flips caused by GPS noise<br/>12. Reconstruct Requester Bloom filter & match blinded hashes
    B->>S: POST /api/capsules/issue (Scanned Requester QR Token + Proof)
    S-->>B: Return JIT Trust Capsule Token (2h TTL)
```

### 3.1 Mathematical Mechanics of Zero-Knowledge Proximity

#### 1. Galois Field $\text{GF}(2^4)$ Definition
The field contains 16 elements generated by the primitive polynomial:
$$p(x) = x^4 + x + 1 \quad (\text{Hex Representation: } \mathtt{0x13})$$
Multiplication and division are computed using exponential (`GF_EXP`) and logarithmic (`GF_LOG`) lookup tables initialized at startup:
```typescript
// backend/src/utils/sharp.ts (Lines 116-129)
let val = 1;
for (let i = 0; i < 15; i++) {
  GF_EXP[i] = val;
  GF_EXP[i + 15] = val;
  GF_LOG[val] = i;
  val <<= 1;
  if (val & 0x10) val ^= 0x13;
}
```

#### 2. $\text{BCH}(15,7)$ Code Construction
A systematic generator polynomial $G(x) = \mathtt{0x1D1}$ ($x^8 + x^7 + x^6 + x^4 + 1$) maps 7-bit spatial message blocks ($m_7$) to 15-bit codewords ($c_{15}$):
$$c_{15} = (m_7 \ll 8) \oplus \text{rem}(m_7 \ll 8, G(x))$$
The lower 8 bits represent the **Parity Syndrome**. The 7-bit data block is discarded, and only the 8-bit parity syndrome is transmitted across the wire.

#### 3. Decoding & Error Correction
Upon receiving the 8-bit syndrome, Device B combines it with its own locally generated 7-bit message block $m'_7$ to construct a candidate codeword $r_{15} = (m'_7 \ll 8) \mid \text{Syndrome}_8$.
The Peterson-Gorenstein-Zierler decoder evaluates power-sum syndromes $S_1, S_2, S_3, S_4$:
$$S_j = \sum_{i=0}^{14} r_i \cdot \alpha^{i \cdot j} \pmod{p(x)}$$
The error-locator polynomial determinant is:
$$\Delta = (S_1 \cdot S_3) \oplus (S_2 \cdot S_2)$$
- If $\Delta \ne 0$: Two bit-errors are localized and flipped:
  $$\Lambda_1 = \frac{S_2 S_3 \oplus S_1 S_4}{\Delta}, \quad \Lambda_2 = \frac{S_3^2 \oplus S_2 S_4}{\Delta}$$
- If $\Delta = 0$ and $S_1 \ne 0$: A single bit-error is resolved: $\Lambda_1 = S_1$.
- Chien search identifies the root locations $x \in \text{GF}(2^4)$ where $1 \oplus \Lambda_1 x \oplus \Lambda_2 x^2 = 0$, and flips the corrupted bits in $r_{15}$.

#### 4. Spatial Discretization & Vectorization
- Continuous coordinates $(lat, lng)$ are truncated to 3 decimal places ($\approx 111\text{ m}$ precision at equator).
- A 9-grid neighborhood is synthesized:
  $$\mathcal{N} = \{ (lat_0 + dx \cdot 0.001, lng_0 + dy \cdot 0.001) \mid dx, dy \in \{-1, 0, 1\} \}$$
- Each cell is hashed 4 times via 32-bit FNV-1a:
  $$\text{Index}_k = \text{fnv1a32}(\text{CellID} \parallel k) \pmod{1024}, \quad k \in \{0, 1, 2, 3\}$$
- Bits at these indices are asserted to `1` in a 1024-bit vector.
- The 1024-bit vector is partitioned into $146$ message blocks of 7 bits each ($146 \times 7 = 1022$ bits).
- Parity syndromes produce exactly 146 bytes ($292$ hexadecimal characters), achieving complete spatial compression without coordinate disclosure.

---

## 4. Backend Service Architecture (`backend`)

The backend service is powered by Fastify 5 and TypeScript, structured with separation of concerns between controllers, data models, routes, services, and middleware.

```mermaid
graph TD
    subgraph Client Requests
        M[Connify React Native App]
        W[Connify Expo Web App]
    end

    subgraph Fastify Gateway
        R[Rate Limiter: 100 req/min]
        C[CORS: Strict Origin Handling]
        A[Auth Middleware: Ed25519 Session / Firebase Bearer]
    end

    subgraph Core Controllers
        DC[DeviceController: /api/devices]
        EC[EpisodeController: /api/episodes]
        CC[CapsuleController: /api/capsules]
        OC[OutcomeController: /api/outcomes]
        LC[LocationController: /api/locations]
        PC[ProfileController: /api/profile]
        AC[AdminController: /api/admin]
    end

    subgraph Background Services
        WD[LocationWatchdogService: 10s Interval]
        BRE[BehavioralRiskEngine]
        KS[KeyService: Ed25519 PKCS8/SPKI]
        SIO[Socket.IO Real-Time Engine]
    end

    subgraph External Infrastructure
        DB[(MongoDB Atlas)]
        FCM[Firebase Cloud Messaging]
        BRV[Brevo SMTP / Transactional API]
    end

    M & W --> R --> C --> A
    A --> DC & EC & CC & OC & LC & PC & AC
    EC --> BRE
    CC --> KS
    LC --> WD
    WD --> FCM & BRV
    DC & EC & CC & OC & LC & PC & AC --> DB
    EC & CC --> SIO
```

### 4.1 Lifecycle & Startup Sequence
In `backend/src/server.ts`, the initialization sequence executes six distinct phases:
1. **Database Connection (`connectDB`)**: Connects to MongoDB Atlas using Mongoose connection pooling.
2. **Cryptographic Key Management (`initKeys`)**: Validates the presence of `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`. In `development` mode, if absent, it autonomously generates an Ed25519 keypair, outputs PKCS8/SPKI PEM formats with escaped newlines, and cleanly terminates with instructions for `.env`.
3. **Firebase Admin SDK Setup (`initFirebase`)**: Parses the `FIREBASE_SERVICE_ACCOUNT_KEY` environment JSON and registers push notification dispatch capabilities.
4. **Fastify Application Assembly (`buildApp`)**:
   - Registers `@fastify/cors` permitting pre-flight verification across methods `['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']`.
   - Registers `@fastify/rate-limit` with a global policy of 100 requests per 1-minute sliding window.
   - Attaches `errorHandler` to normalize exceptions into standard JSON payloads.
   - Mounts health checks, device routes, episode routes, capsule routes, outcome routes, profile routes, auth routes, and administrative endpoints.
5. **Real-Time WebSocket Server (`initSockets`)**: Binds a Socket.IO server to Fastify's native Node.js HTTP server. Configures socket authentication middleware to verify device session tokens during handshake.
6. **Watchdog Daemon Background Task**: Starts an unblocked background scanner (`LocationWatchdogService.checkSignalLossAndNotifyGuardians`) running on a 10,000 ms (10-second) interval.

### 4.2 Data Models & Persistence Invariants
Defined in `backend/prisma/schema.prisma` and mirrored in Mongoose schemas (`backend/src/models/index.ts`):

#### 1. Device (`devices`)
- `_id`: MongoDB ObjectId.
- `deviceFingerprintHash`: String (Unique). 64-character SHA-256 hash of device hardware identifiers.
- `publicKey`: String. Ed25519 public key in hexadecimal format.
- `phoneHash`: Optional String. SHA-256 hash of user phone number.
- `isQuarantined`: Boolean (default: `false`). Set to `true` if suspicious flags accumulate.
- `suspiciousCount`: Number (default: `0`). Incremented on threat aborts.
- `harmlessnessScore`: Number (default: `100`). Dynamic trust score (0–100).
- `createdAt`: DateTime (default: `now()`).
- `lastSeenAt`: Optional DateTime. Updated on each registration or handshake.

#### 2. Episode (`episodes`)
- `_id`: MongoDB ObjectId.
- `requesterDeviceId`: ObjectId (References `Device._id`).
- `category`: String (`medical`, `transport`, `general`, `emergency`).
- `urgency`: Number (1–5 scale).
- `status`: String (`pending`, `matched`, `active`, `completed`, `expired`, `cancelled`, `THREAT_ABORTED`).
- `latitude`, `longitude`: Floats.
- `location`: GeoJSON Point `[longitude, latitude]` indexed with a `2dsphere` spatial index.
- `radiusMeters`: Number (default: 500).
- `blindedGridSigs`: String. 146 parity syndromes in hex.
- `helperValidationKey`: String. Random session key string.
- `gridCellsJson`: Stringified array of blinded cell strings.
- `usedQrNonces`: Array of Strings (default: `[]`). Stores single-use UUIDv4 nonces from scanned QR tokens.
- `isDuress`: Boolean (default: `false`). Set if triggered under duress.
- `createdAt`: DateTime (default: `now()`).
- `expiresAt`: DateTime (default: `now() + 30 minutes`).

#### 3. Capsule (`capsules`)
- `_id`: MongoDB ObjectId.
- `episodeId`: ObjectId (References `Episode._id`).
- `helperDeviceId`: ObjectId (References `Device._id`).
- `signedTokenHash`: String. SHA-256 digest of the minted JWS Trust Capsule token. The raw bearer token is never written to disk.
- `status`: String (`issued`, `redeemed`, `expired`, `revoked`).
- `blindedGridCell`: String. Proximity cell identifier.
- `issuedAt`: DateTime (default: `now()`).
- `expiresAt`: DateTime (default: `now() + 2 hours`).
- `redeemedAt`: Optional DateTime. Populated when helper checks in.

#### 4. Outcome (`outcomes`)
- `_id`: MongoDB ObjectId.
- `episodeId`: ObjectId (References `Episode._id`).
- `result`: String (`success`, `failure`, `SAFE_RESOLVED`, `SUSPICIOUS_BEHAVIOR`, `ACTIVE_THREAT`).
- `category`: String.
- `riskLevel`: Optional Number (1–5 rating).
- `completedInWindow`: Boolean. Indicates whether resolution occurred before capsule expiration.
- `createdAt`: DateTime (default: `now()`).

#### 5. AuditLog (`audit_log`)
- `_id`: MongoDB ObjectId.
- `eventType`: String (e.g., `EPISODE_CREATED`, `CAPSULE_ISSUED`, `CAPSULE_REDEEMED`, `EPISODE_CANCELLED`, `THREAT_ABORTED`).
- `episodeId`: Optional ObjectId.
- `prevHash`: String. SHA-256 hash of the immediate predecessor record (Genesis: `'0'`).
- `entryHash`: String. $\text{SHA-256}(\text{prevHash} \parallel \text{eventType} \parallel \text{episodeId})$.
- `createdAt`: DateTime (default: `now()`).

#### 6. Profile (`profiles`)
- `_id`: MongoDB ObjectId.
- `deviceId`: ObjectId (Unique, References `Device._id`).
- `firebaseUid`: Optional String. Linked Firebase Auth User UID.
- `firstName`, `lastName`: Strings.
- `email`: Optional String.
- `phone`: Optional String.
- `isAnonymous`: Boolean (default: `true`).
- `medicalNotes`: Optional String. JSON-encoded medical records (blood group, conditions, emergency guardian info).
- `createdAt`, `updatedAt`: DateTimes.

#### 7. Guardian (`guardians`)
- `_id`: MongoDB ObjectId.
- `deviceId`: ObjectId (References `Device._id`).
- `userFullName`: String.
- `fullName`: String. Emergency contact name.
- `phone`: String.
- `email`: Optional String.
- `fcmToken`: Optional String. Guardian device push notification token.
- `relationship`: String (e.g., 'Parent', 'Spouse', 'Friend').
- `createdAt`: DateTime (default: `now()`).

#### 8. DeviceLocation (`device_locations`)
- `_id`: MongoDB ObjectId.
- `deviceId`: ObjectId (Unique, References `Device._id`).
- `latitude`, `longitude`: Floats.
- `accuracy`, `batteryLevel`: Optional Floats.
- `isActiveSession`: Boolean (default: `true`).
- `signalLostAlertSent`: Boolean (default: `false`).
- `retryCount`: Number (default: `0`).
- `lastPingAt`: DateTime (default: `now()`).

#### 9. DeviceChallenge (`device_challenges`)
- `_id`: MongoDB ObjectId.
- `challenge`: String (Unique). 32-byte hex nonce.
- `deviceId`: ObjectId (References `Device._id`).
- `createdAt`: DateTime (default: `now()`, indexed with MongoDB TTL expiration: 60 seconds).

---

### 4.3 Comprehensive REST API Endpoints

#### Devices (`/api/devices`)
| Method | Endpoint | Auth | Description & Request Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/devices/register` | Firebase Bearer | Upserts hardware node registration. Body: `{ deviceFingerprintHash: string(64), publicKey: string, phoneHash?: string }`. Returns `{ deviceId, token, tokenType: 'Bearer', expiresIn: '30d' }`. |
| `POST` | `/api/devices/challenge` | Device Session | Requests a 60-second single-use challenge. Rate limit: 5 req/min. Returns `{ challenge, expiresInSeconds: 60 }`. |
| `POST` | `/api/devices/verify` | Device Session | Verifies detached Ed25519 signature of challenge nonce using registered public key. Body: `{ challenge, signature }`. Consumes nonce atomically. |

#### Episodes (`/api/episodes`)
| Method | Endpoint | Auth | Description & Request Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/episodes` | Device Session | Creates an assistance or emergency broadcast. Checks `BehavioralRiskEngine.assertEligibilityForEpisodeTrigger`. Body: `{ category, urgency (1-5), latitude, longitude, radiusMeters, blindedGridSigs, helperValidationKey, gridCellsJson, isDuress? }`. |
| `GET` | `/api/episodes/nearby` | Device Session | Finds active episodes via `$geoWithin` spherical geometry. Query: `latitude`, `longitude`, `radiusMeters`. Returns filtered metadata with relative distances in meters. |
| `GET` | `/api/episodes/:id` | Device Session | Retrieves single episode status, TTL expiry, and blinded SHARP parameters. |
| `PATCH` | `/api/episodes/:id/cancel` | Device Session | Cancels episode. Enforces owner authorization (`requesterDeviceId === sub`). Broadcasts `episode_cancelled` to room and feed. |
| `POST` | `/api/episodes/:id/threat-abort` | Device Session | Responder threat abort. Marks episode `THREAT_ABORTED`. Increments requester device `suspiciousCount`; quarantines if count $\ge 2$. |

#### Capsules (`/api/capsules`)
| Method | Endpoint | Auth | Description & Request Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/capsules/issue` | Device Session | Issues a 2-hour JIT Trust Capsule between two strangers. Cryptographically verifies requester QR token signature and checks for nonce reuse. Body: `{ episodeId, helperDeviceId, verificationData: { qrToken, blindedGridCell } }`. Persists SHA-256 hash of token. |
| `POST` | `/api/capsules/redeem` | Device Session | Verifies capsule token JWS signature via `KeyService`. Atomically transitions capsule from `issued` to `redeemed` and episode to `active`. |
| `POST` | `/api/capsules/:id/revoke` | Device Session | Revokes an issued capsule. Updates state to `revoked`. Writes `CAPSULE_REVOKED` to audit ledger. |
| `POST` | `/api/capsules/verify-qr` | Device Session | Standalone verification endpoint checking Ed25519 signature and validity of a QR token without consuming the nonce. |

#### Locations & Emergency Guardians (`/api/locations`)
| Method | Endpoint | Auth | Description & Request Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/locations/ping` | Device Session | Updates device location (1-point sliding window). Body: `{ latitude, longitude, accuracy?, batteryLevel? }`. Triggers automated recovery notifications if signal was previously lost. |
| `POST` | `/api/locations/guardians` | Device Session | Registers emergency guardian. Body: `{ userFullName, fullName, phone, relationship, email?, fcmToken? }`. |
| `POST` | `/api/locations/watchdog/scan` | Device Session | Manually triggers the watchdog scanner loop. |

#### Outcomes (`/api/outcomes`)
| Method | Endpoint | Auth | Description & Request Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/outcomes` | Device Session | Records anonymous resolution record. Body: `{ episodeId, result: 'success'\|'failure'\|'SAFE_RESOLVED'\|'SUSPICIOUS_BEHAVIOR'\|'ACTIVE_THREAT', category, riskLevel? (1-5), completedInWindow: boolean }`. |

#### Authentication & Profiles (`/api/auth`, `/api/profile`)
| Method | Endpoint | Auth | Description & Request Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/send-email-otp` | Public | Generates 7-digit OTP (10-minute expiry). Dispatches HTML email via Brevo SMTP API. |
| `POST` | `/api/auth/verify-email-otp` | Public | Verifies email OTP. Consumes token upon success. |
| `POST` | `/api/profile` | Device Session | Upserts user profile. Extracts embedded guardian details from `medicalNotes` JSON and syncs them to the `Guardian` collection. |
| `POST` | `/api/profile/upgrade` | Device Session | Upgrades anonymous guest profile to permanent profile with required guardian information. |
| `GET` | `/api/profile` | Device Session | Fetches profile record associated with the authenticated device. |

#### Administrative API (`/api/admin`)
| Method | Endpoint | Auth | Description & Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Device Session | Aggregated metrics: total episodes, user episodes, counts by status, success rate, and active episodes list. |
| `GET` | `/api/admin/guardians` | Device Session | Paginated guardian nodes with trust scores and connection methods. |
| `GET` | `/api/admin/sos-alerts` | Device Session | Paginated emergency episodes with hazard levels and coordinates. |
| `GET` | `/api/admin/jit-credentials` | Device Session | Paginated list of issued JIT Trust Capsules. |
| `GET` | `/api/admin/audit-ledgers` | Device Session | Verifies cryptographic integrity of the entire audit chain from block 0. Returns validation states per block. |
| `POST` | `/api/admin/simulate/episode` | Device Session | Simulates emergency broadcast creation for testing. |
| `POST` | `/api/admin/simulate/checkin` | Device Session | Simulates incident resolution and check-in. |
| `POST` | `/api/admin/simulate/corrupt` | Device Session | Tamper testing endpoint; deliberately corrupts the hash of the latest audit log entry to verify chain validation failures. |
| `POST` | `/api/admin/simulate/reset` | Device Session | Self-healing endpoint; recalculates and repairs the audit ledger hash chain. |
| `POST` | `/api/admin/wipe-database` | Device Session | Purges all MongoDB collections (Devices, Profiles, Episodes, Capsules, Outcomes, Logs). |

---

### 4.4 Global Error Codes & Handling
Every error thrown by the Fastify service is formatted through `backend/src/middleware/errorHandler.ts` into a consistent structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of error condition",
    "details": {}
  }
}
```

#### Standard Error Codes Dictionary:
- `VALIDATION_ERROR` (HTTP 400): Request body failed Zod schema or JSON validation.
- `UNAUTHORIZED` (HTTP 401): Missing, malformed, or expired Ed25519 session or Firebase bearer token.
- `FORBIDDEN` (HTTP 403): Requesting device does not own the target resource.
- `NOT_FOUND` (HTTP 404): Specified episode, device, capsule, or profile ID does not exist.
- `INVALID_OR_EXPIRED_CHALLENGE` (HTTP 400): Hardware challenge nonce is invalid, already consumed, or exceeded 60-second TTL.
- `SIGNATURE_VERIFICATION_FAILED` (HTTP 400): Detached Ed25519 signature does not match challenge and registered public key.
- `PROXIMITY_VERIFICATION_FAILED` (HTTP 403): Handshake QR token failed Ed25519 signature verification or timestamp expiration.
- `GUARDIAN_REQUIRED` (HTTP 500): Device has no emergency guardians registered. Broadcast blocked.
- `PREDATORY_LURING_DETECTED` (HTTP 500): Velocity cap triggered ($>2$ broadcasts within 10 minutes).
- `HARMLESSNESS_SCORE_TOO_LOW` (HTTP 500): Account trust score is below 40.
- `QUARANTINED_DEVICE` (HTTP 500): Account is quarantined due to safety flags.
- `INVALID_EPISODE_STATE` (HTTP 409): Target episode is not in a valid state for the requested transition.
- `INTERNAL_SERVER_ERROR` (HTTP 500): Unhandled exception caught by global boundary.

---

## 5. Background Engines & Autonomous Security Daemons

### 5.1 Location Watchdog Daemon & Signal-Loss Protocol
Located in `backend/src/services/LocationWatchdogService.ts`, this service operates as a continuous safety monitor:
- **Scan Interval**: Executes every 10 seconds via `setInterval` in `server.ts`.
- **Signal-Loss Criteria**: Triggers when a device in an active emergency session (`isActiveSession: true`, `signalLostAlertSent: false`) has not emitted a ping for $\ge 15,000\text{ ms}$ (15 seconds).
- **Notification Dispatch**:
  - Sets `signalLostAlertSent = true` and increments `retryCount`.
  - Dispatches an FCM Push Notification to all guardians with a registered `fcmToken`.
  - Sends a transactional email through Brevo SMTP API using a high-visibility security template containing the exact last-known GPS coordinates and a formatted Google Maps link (`https://maps.google.com/?q=lat,lng`).
  - Writes a `GUARDIAN_SIGNAL_LOSS_ALERTS_DISPATCHED` entry to the audit log.
- **Recovery Notification**:
  - When the client regains connectivity and submits a ping, `updateLocationPing` identifies `wasSignalLost === true`.
  - Automatically transmits a **"Signal Recovered"** notification via FCM and Brevo email to all guardians confirming live tracking has been re-established.
  - Resets `signalLostAlertSent = false`.

### 5.2 Behavioral Risk & Anti-Luring Engine
Located in `backend/src/services/BehavioralRiskEngine.ts`, this engine evaluates device behavior before permitting a broadcast to strangers:
1. **Mandatory Guardian Check (`assertMandatoryGuardian`)**:
   - Queries `Guardian.countDocuments({ deviceId })`. If 0, searches profile `medicalNotes` for auto-heal data. If still 0, rejects request with `GUARDIAN_REQUIRED`.
2. **Velocity & Luring Detection**:
   - Queries episodes created by the device in the preceding 10 minutes:
     $$\text{recentCount} = \text{count}(\text{requesterDeviceId} = \text{deviceId}, \text{createdAt} \ge \text{now} - 10\text{ min})$$
   - If $\text{recentCount} \ge 2$: Flags `isVelocityCapped = true` and deducts $(\text{recentCount} - 1) \times 40$ points. Rejects broadcast with `PREDATORY_LURING_DETECTED`.
3. **Resolution Ratio Penalty**:
   - Calculates the ratio of completed/resolved episodes to total episodes:
     $$\text{Ratio} = \frac{\text{Successful Outcomes}}{\text{Total Episodes}}$$
   - If $\text{Ratio} < 0.5$ across $\ge 3$ incidents, deducts $\text{round}((1 - \text{Ratio}) \times 30)$ points.
4. **Suspicious Behavioral Deductions**:
   - Deducts $\text{suspiciousCount} \times 35$ points for each threat abort recorded against the device.
5. **Eligibility Enforcement**:
   - Computes $\text{Score} = \max(0, 100 - \sum \text{Penalties})$.
   - Persists updated `harmlessnessScore` to `Device` record.
   - Rejects broadcast if `isQuarantined === true`, `isVelocityCapped === true`, or `Score < 40`.

### 5.3 Socket.IO Ephemeral Real-Time Mesh Architecture
Located in `backend/src/sockets/index.ts`, Socket.IO coordinates ephemeral in-memory communication channels:

```mermaid
graph TD
    Client[Client Device] -->|1. Connect with JWT| Sock[Socket.IO Server]
    Sock -->|2. Verify Token via KeyService| Auth{Authenticated?}
    Auth -- No --> Drop[Disconnect Socket]
    Auth -- Yes --> Reg[Attach deviceId & fingerprint to socket.data]

    Reg -->|join_episode| Room[Room: episode:ID]
    Reg -->|join_feed| Feed[Global Feed Room]

    Room -->|send_message| Chat[Ephemeral In-Flight Message Broadcast]
    Room -->|update_responder_location| Pos[Live Volunteer Coordinates Broadcast]
    Room -->|offer_support| Accept[Helper Accepted Broadcast]
    Room -->|location_ping| Watchdog[Update Sliding Location in DB]
    
    Room -->|episode_expired / cancelled| Teardown[Disconnect All Sockets & Purge Room]
```

#### Socket.IO Event Definitions:
| Event Name | Direction | Payload Structure | Functional Purpose |
| :--- | :--- | :--- | :--- |
| `join_episode` | Client $\to$ Server | `{ episodeId: string }` | Enforces membership authorization (requester or matched helper). Joins socket to `episode:{id}`. |
| `offer_support` | Helper $\to$ Server | `{ episodeId, latitude, longitude }` | Marks episode as `matched`. Broadcasts `helper_accepted` with volunteer coordinates to the requester. |
| `update_responder_location` | Helper $\to$ Server | `{ episodeId, latitude, longitude }` | Broadcasts `responder_location_updated` to requester during transit. |
| `send_message` | Client $\to$ Server | `{ episodeId, message }` | Emits `new_message` to room participants. In-flight messages exist only in memory and are never persisted. |
| `leave_episode` | Client $\to$ Server | `{ episodeId }` | Removes client socket from room; broadcasts `user_left`. |
| `location_ping` | Client $\to$ Server | `{ latitude, longitude, accuracy }` | Calls `LocationWatchdogService.updateLocationPing` directly over WebSocket. |
| `join_feed` / `leave_feed` | Client $\to$ Server | None | Subscribes idle volunteer devices to the global distress feed. |
| `new_episode` | Server $\to$ Feed | Episode metadata | Broadcasts new emergency requests to nearby volunteer nodes. |
| `capsule_issued` | Server $\to$ Room | `{ episodeId, status, capsuleId }` | Notifies participants that handshake verification succeeded. |
| `episode_expired` | Server $\to$ Room | `{ episodeId, message }` | Signals TTL expiration and forces all room sockets to disconnect. |
| `episode_cancelled` | Server $\to$ Room | `{ episodeId, message }` | Signals cancellation and closes the channel. |

### 5.4 Hash-Chained Tamper-Evident Audit Ledger
Located in `backend/src/utils/audit.ts` and `backend/src/routes/admin.ts`:
- **Serialized Write Queue**:
  Writes are serialized via an internal promise queue:
  ```typescript
  auditQueue = auditQueue.then(task).catch(task);
  ```
  This guarantees that concurrent operations never produce race conditions or fork the hash chain.
- **Hash Linkage**:
  Each entry computes:
  $$\text{EntryHash}_n = \text{SHA-256}(\text{PrevHash}_{n-1} \parallel \text{EventType} \parallel \text{EpisodeID})$$
- **Verification Engine (`verifyAuditChain`)**:
  Fetches all records sorted by ascending insertion order. Starting with initial seed `'0'`, it recalculates hashes sequentially. If any record's stored `entryHash` or `prevHash` diverges from computed values, the chain is flagged as broken (`isChainValid: false`), pinpointing the exact modified block.

---

## 6. Mobile & Multi-Platform Client Architecture (`Connify`)

The client application is built on React Native 0.86.0 and React 19 with full cross-platform capabilities (Android, iOS, and Expo Web), utilizing Zustand for state management, React Navigation 7 for routing, and native hardware integrations.

### 6.1 Native Hardware Modules & Keypair Derivation
- **Hardware Keystore Binding (`react-native-keychain`)**: Securely stores the derived Ed25519 keypair within Android Keystore or iOS Keychain under service name `'connify.ed25519.keypair'`, protected by `Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY`.
- **Biometric Sensors (`react-native-biometrics`)**: Prompts Touch ID, Face ID, or Android BiometricPrompt prior to high-stakes actions like broadcasting distress signals or accepting rescue tasks.
- **Vision Camera (`react-native-vision-camera`)**: Drives the viewfinder in `HandshakeScreen.tsx` for real-time QR code scanning with ML Kit barcode recognition fallback.
- **Geolocation Provider (`react-native-geolocation-service`)**: Interfaces with native Android LocationServices and iOS CoreLocation providers for high-accuracy positioning.
- **Background Notifications (`@notifee/react-native`)**: Creates high-importance Android notification channels (`AndroidImportance.HIGH`) with custom sound and vibration profiles.
- **Embedded Web View (`react-native-webview`)**: Renders embedded interactive Leaflet maps with zero external Google Maps API key requirements.

### 6.2 State Management (Zustand Stores)

#### 1. `authStore.ts`
- **Hardware Credential Derivation**:
  ```typescript
  // Combines DeviceInfo unique ID and persistent UUID
  const hashBytes = nacl.hash(strToUint8Array(deviceUniqueId)); // SHA-512 -> 64 bytes
  const fingerprint = toHex(hashBytes.slice(0, 32));             // 64-char hex fingerprint
  const seed = hashBytes.slice(32, 64);                          // Ed25519 seed
  const keyPair = nacl.sign.keyPair.fromSeed(seed);
  ```
- Handles sign-in via Google OAuth, email/password, email OTP, and anonymous authentication.
- Maintains session tokens, Firebase ID tokens, and user profiles.

#### 2. `episodeStore.ts`
- Manages the emergency episode lifecycle: `idle` $\to$ `creating` $\to$ `searching` $\to$ `active` $\to$ `feedback`.
- Tracks remaining safe time (`timeLeft`), session expiry, socket channels, duress state, and witness attestations.
- Tracks secondary responder swarms (backup volunteer nodes within the perimeter).

#### 3. `locationStore.ts`
- Tracks user coordinates (`latitude`, `longitude`, `accuracy`, `altitude`, `speed`).
- Manages continuous background location watchers and permission requests.

#### 4. `hazardStore.ts`
- Manages local safety danger spots and user reports.
- Integrates with `aiHazardService` to cross-reference reported hazards against online municipal databases and lighting grids.

#### 5. `rewardStore.ts`
- Tracks gamification state: XP points, Trust Score (0.0–5.0), Trust Tokens, and unlocked badges.

#### 6. `frequentLocationsStore.ts`
- Manages user-configured safe locations ('Home Sanctuary', 'Tech Campus', 'Fitness Hub') with geofenced coordinates.

#### 7. `themeStore.ts`
- Manages dynamic light, dark, and high-contrast OLED black themes.

---

### 6.3 The 25 Operational Application Screens

```
Navigation Architecture
├── Onboarding & Authentication
│   ├── SplashScreen (Bootstrap & Keypair Check)
│   ├── WelcomeScreen (OAuth / OTP / Guest Hub)
│   ├── GoogleAuthSuccessScreen (OAuth Sync Verification)
│   └── OnboardingScreen (Interactive Safety Guide)
│
├── Main Tab Navigation
│   ├── DashboardScreen (Circular Radar Visualizer & Connect with Strangers)
│   ├── UnifiedSafetyHubScreen (Master Safety Console & Siren)
│   ├── NearbyRequestsScreen (Volunteer Incident Discovery Feed)
│   ├── HistoryScreen (Cryptographic Audit Trail)
│   └── SettingsScreen (Profile, Guardians, Themes, Account Deletion)
│
├── Requester & Peer Connection Workflow
│   ├── CreateRequestScreen (22-Category Assistance & Biometric Gate)
│   ├── SearchingScreen (Active Radar Polling & Swarm Listeners)
│   ├── HandshakeScreen (QR Scanners & JIT Capsule Issuance)
│   ├── EmergencyScreen (Active Incident, Countdown & P2P Chat)
│   └── FeedbackScreen (Post-Incident Audit & Photo Verification)
│
├── Safety Hub & Rapid Interventions
│   ├── WomenSafetyScreen (1-Tap Sirens & SOS SMS)
│   ├── OfflineEmergencyScreen (Cellular SMS Distress Dispatch)
│   ├── FakeCallScreen (Configurable Incoming Exit Call Engine)
│   ├── EmergencyContactsScreen (Guardian Management & Keychain Sync)
│   ├── GovernmentEmergencyNumbersScreen (National Hotlines 112/100/1091)
│   └── TimedSafetyGuardScreen (Quiet Journey Countdown Watcher)
│
├── Hazard Intelligence & Community Safety
│   └── HazardMapScreen (Community Danger Spots & AI Cross-Verification)
│
└── Governance, Audits & Decentralized Protocols
    ├── GovernanceScreen (Decentralized Parameters & Trust Engine)
    ├── ProtocolExplainerScreen (Galois Field BCH Math Explainer)
    └── WitnessContactsScreen (Bystander Witness Attestations)
```

1. **`SplashScreen.tsx`**: Bootstraps device credentials, checks connectivity, initializes notification channels, and routes to `Welcome` or `Main`.
2. **`WelcomeScreen.tsx`**: Multi-mode authentication hub supporting Google OAuth, email/password, 7-digit email OTP, or guest mode.
3. **`GoogleAuthSuccessScreen.tsx`**: Onboarding screen confirming profile data sync from Google accounts.
4. **`OnboardingScreen.tsx`**: Interactive multi-step explainer illustrating zero-knowledge location privacy and responder rendezvous.
5. **`DashboardScreen.tsx`**: Primary user dashboard featuring a dynamic circular radar visualizer, 1-tap quick SOS trigger, "Connect with a Nearby Helper" launcher, system status telemetry, and active safety timer counters.
6. **`UnifiedSafetyHubScreen.tsx`**: Unified protection console with a high-decibel audible panic alarm, 1-tap offline GPS emergency SMS dispatching, primary guardian call/SMS/WhatsApp triggers, national hotlines, and instant exit call scheduling.
7. **`CreateRequestScreen.tsx`**: Broadcast configuration supporting 22 peer request categories across mutual aid, medical, transport, and safety with urgency ratings (1–5) and SHARP Bloom filter generation.
8. **`SearchingScreen.tsx`**: Radar screen displaying live status while polling for nearby volunteer peers and listening for socket acceptance.
9. **`NearbyRequestsScreen.tsx`**: Proximity discovery feed for volunteer responders, displaying nearby distress episodes with distance in meters and urgency ratings.
10. **`HandshakeScreen.tsx`**: Rendezvous verification screen between two strangers. Requesters display an Ed25519-signed QR code with a 90-second nonce; helpers scan the code using the camera to issue the JIT Trust Capsule. Supports Covert Duress PIN input and Bystander Witness Attestation signing.
11. **`EmergencyScreen.tsx`**: Active incident screen featuring a 15-minute countdown clock, encrypted P2P chat, stalled responder detection, and safe escort tracking mode.
12. **`FeedbackScreen.tsx`**: Post-incident screen recording resolution status, risk levels (1–5), photographic verification, and audit report generation.
13. **`HistoryScreen.tsx`**: Local audit trail showing past emergency broadcasts and cryptographic proofs.
14. **`SettingsScreen.tsx`**: Configuration center for editing profiles, linking Google accounts, managing guardians, switching themes, and submitting account deletion requests.
15. **`EmergencyContactsScreen.tsx`**: Interface for adding and removing emergency contacts, stored securely in `react-native-keychain`.
16. **`GovernmentEmergencyNumbersScreen.tsx`**: Direct dial directory for emergency services (112, 100, 102, 108, 1091, 181, 1930).
17. **`WomenSafetyScreen.tsx`**: Quick-access safety screen with audible sirens and 1-tap emergency SMS broadcasting.
18. **`OfflineEmergencyScreen.tsx`**: Fallback screen for cellular SMS-based distress broadcasts when mobile data is unavailable.
19. **`FakeCallScreen.tsx`**: Simulates realistic incoming calls from configurable contacts ('Mom', 'Dad', 'Safety Dispatch', 'Office Guard') with customizable delays (instant, 5s, 15s, 30s) to assist users in discreetly exiting hazardous situations.
20. **`TimedSafetyGuardScreen.tsx`**: Quiet journey countdown timer. Users specify destination and duration. If the user fails to check in before the timer reaches zero, automatic SMS and push notifications are dispatched to emergency contacts.
21. **`HazardMapScreen.tsx`**: Community risk map. Users report danger spots, which are evaluated by the AI Hazard Verification Engine (`aiHazardService`) against municipal logs and lighting grid feeds.
22. **`FrequentLocationsScreen.tsx`**: Manages user-configured safe geofences (e.g., Home, University, Office).
23. **`GovernanceScreen.tsx`**: Interactive governance overview detailing protocol trust scores, community validators, and decentralized parameters.
24. **`ProtocolExplainerScreen.tsx`**: In-app educational module breaking down Bloom filter spatial indexing and Peterson-Gorenstein-Zierler decoding.
25. **`WitnessContactsScreen.tsx`**: Direct management screen for designated bystander witnesses providing secondary rendezvous attestations.

---

### 6.4 The 22 Peer Request & Assistance Categories
Defined in `Connify/src/screens/Requester/CreateRequestScreen.tsx`:

| Category Name | Icon Name | Description | Backend Mapped Category |
| :--- | :--- | :--- | :--- |
| **Medical Emergency** | `medical-services` | Urgent medical aid, trauma, or cardiac emergency | `medical` |
| **Security & Assault** | `security` | Physical threat, active assault, or immediate danger | `emergency` |
| **Fire & Explosion** | `local-fire-department` | Active fire outbreak, smoke, or explosion hazard | `emergency` |
| **Women Safety & Harassment** | `health-and-safety` | SOS panic, stalking, or female safety intervention | `emergency` |
| **Accident & Collision** | `car-crash` | Road crash, vehicular accident, or injury on transit | `medical` |
| **Transport & Evacuation** | `local-taxi` | Emergency transport, ride share, or safe evacuation | `transport` |
| **Disaster & Flood** | `thunderstorm` | Flash flood, storm, earthquake, or severe hazard | `emergency` |
| **Domestic Violence & Abuse** | `gavel` | Domestic abuse, violent dispute, or protective distress | `emergency` |
| **Child Emergency & Lost** | `child-care` | Missing child, infant distress, or pediatric emergency | `general` |
| **Senior Citizen Assist** | `elderly` | Elderly fall, confusion, or senior assistance | `general` |
| **Mental Health Crisis** | `psychology` | Severe distress, panic attack, or psychological aid | `medical` |
| **Stranded & Breakdown** | `build` | Vehicle breakdown, flat tire, or isolated location | `general` |
| **Blood & Organ Need** | `bloodtype` | Urgent blood donor requirement or rare group need | `medical` |
| **Oxygen & Med Supply** | `vaccines` | Critical oxygen cylinder or lifesaving medication | `medical` |
| **Cyber Threat & Stalking** | `phishing` | Digital harassment, blackmail, or cyber stalking | `general` |
| **Animal Rescue & Hazard** | `pets` | Injured animal, rabid hazard, or wildlife rescue | `general` |
| **Power Grid & Blackout** | `power-off` | Complete power failure, grid blackout, or electrical hazard | `general` |
| **Gas & Chemical Leak** | `warning-amber` | Toxic gas leak, chemical spill, or gas cylinder hazard | `emergency` |
| **Theft & Burglary** | `lock` | Active break-in, theft, robbery, or property intrusion | `emergency` |
| **Food & Water Crisis** | `set-meal` | Emergency food, clean water shortage, or relief | `general` |
| **Shelter & Homeless Relief** | `night-shelter` | Extreme weather shelter, displacement, or emergency bed | `general` |
| **General Request** | `report-problem` | General community assistance or unlisted distress | `general` |

---

### 6.5 Offline Resilience & Transaction Queue
Implemented in `Connify/src/services/OfflineQueueService.ts` and `QueueHandlers.ts`:
- **Storage Location**: Serialized to `AsyncStorage` under key `CONNIFY_OFFLINE_QUEUE`.
- **Item Lifecycle**: Items include `id`, `type`, `payload`, `createdAt`, and optional `maxAge` (e.g., 120,000 ms for episode creation drafts).
- **Execution Strategy**:
  - Subscribes to `connectivityService`.
  - When connection transitions to `online`, triggers `flushQueue()`.
  - Sorts items chronologically (oldest first).
  - Evaluates `maxAge`: if $\text{now} - \text{createdAt} > \text{maxAge}$, the task is dropped to prevent executing stale requests.
  - Passes valid items to registered handlers (`CREATE_EPISODE`, `SUBMIT_FEEDBACK`, `SEND_CHAT_MESSAGE`, `REGISTER_DEVICE`).

### 6.6 Covert Duress, Stalled Responders & Safety Checks
- **Covert Duress PIN (Feature 10)**:
  During the QR handshake in `HandshakeScreen.tsx`, entering PIN `9999` marks the episode with `isDuress: true` and triggers a high-priority notification via `NotificationService.notifyDuressAlertTriggered()`. To any observer, the application displays a normal successful handshake screen, protecting the user while silently flagging the incident.
- **Stalled Responder Progress Detection (Feature 9)**:
  In `EmergencyScreen.tsx`, the client tracks the timestamp of the responder's last position update (`lastResponderMovementTime`). If the responder's position does not change for $> 2$ minutes during an active episode, `NotificationService.notifyStalledResponder()` alerts the requester.
- **Automated Safety Wellness Check (Feature 17)**:
  Five minutes after an emergency episode is marked resolved, the system triggers `NotificationService.notifyWellnessCheckPrompt()` prompting the user to confirm they remain safe.

### 6.7 Android Home & Lock Screen Widget Integration
Implemented in `Connify/src/widgets/widgetBridge.ts` and `widgetSyncService.ts`:
- **Native Data Bridge**: Transmits atomic state snapshots (`isActiveEpisode`, `status`, `timeLeft`, `trustScore`, `unreadMessages`) to native Android AppWidget providers.
- **1-Tap Widget SOS Action**: Allows users to trigger immediate distress broadcasts directly from their Android home screen without unlocking and navigating the UI.

---

## 7. Auxiliary Utilities & Engine Systems

### 7.1 AI Hazard Cross-Verification Service
Located in `Connify/src/services/aiHazardService.ts`, this service evaluates user-reported safety hazards:
- Calculates Haversine distances between current user coordinates and known danger spots:
  $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- Evaluates category strings and descriptions:
  - Lighting and road hazards match municipal infrastructure logs, producing an `AI_VERIFIED_ONLINE` status with confidence scores between 88 and 98.
  - Security and harassment reports match police control registry feeds.
  - Other reports receive a `USER_REPORTED_ONLY` status until confirmed by 5 or more community witnesses, which elevates them to `COMMUNITY_ATTESTED`.

### 7.2 Standardized Emergency SMS Formatter
Located in `Connify/src/utils/smsFormatter.ts`, this utility compiles offline cellular SMS messages with 5 standardized components:
```
[EMERGENCY SAFETY ALERT]
User: Elena Vance
Relationship: Primary Guardian
Reason: Emergency distress signal triggered from Connify Safety app
Last Location: Lat 12.97159, Lng 77.59456
Map Link: https://maps.google.com/?q=12.97159,77.59456
```

### 7.3 Cryptographic Incident Audit Report Generator
Located in `Connify/src/utils/reportGenerator.ts`, this generator produces a formatted audit record upon incident completion:
```
====================================================
         CONNIFY EMERGENCY INCIDENT AUDIT REPORT          
====================================================
Generated On      : 2026-09-07, 14:15:00
Incident ID       : ep-67c8a1b2c3d4e5f60718293a
Verification Hash : 0X_AUDIT_9F8E7D6C

----------------------------------------------------
1. INCIDENT DETAILS
----------------------------------------------------
Category          : MEDICAL EMERGENCY
Urgency Level     : LEVEL 4
User Identity     : Safety User
Start Time        : 14:00:15
Resolution Time   : 14:14:45
Handshake Time    : 14:05:22

----------------------------------------------------
2. LOCATION & TELEMETRY LOGS
----------------------------------------------------
GPS Coordinates   : 12.97160, 77.59457
Responder Device  : 67c8a1f0e4...
Responder Credentials: Verified Volunteer Responder

----------------------------------------------------
3. SECURITY & VERIFICATION AUDIT
----------------------------------------------------
Zero-Trust Handshake : PASSED (Cryptographic Key Exchange Verified)
Duress Safety Pin   : NONE (Clean Authentication)
Witness Attestations: 1 Bystander Witness Signature(s) Recorded
Safe Escort Mode    : COMPLETED (Safe Arrival Confirmed)

----------------------------------------------------
4. COMPLIANCE & PRIVACY NOTICE
----------------------------------------------------
Privacy Protocol  : Zero-Trace Ephemeral Session
Data Retention    : This local audit record is encrypted on-device. All server-side telemetry has been permanently discarded.
====================================================
```

---

## 8. Development Workflow & Environment Configuration

### 8.1 Prerequisites & Tooling
- **Node.js**: $\ge 22.11.0$ (Required by `Connify/package.json` engines).
- **Package Managers**: `npm` (v10+).
- **Database**: MongoDB instance (local or MongoDB Atlas connection string).
- **Android Development**: Android Studio (SDK Platform 35, Build-Tools 35.0.0, NDK), JDK 17.
- **iOS Development**: macOS with Xcode 15+ and CocoaPods (for iOS targets).

### 8.2 Environment Variables Configuration

#### Backend (`backend/.env`)
```env
# MongoDB Connection String
DATABASE_URL="mongodb://localhost:27017/Connify"

# Server Port and Environment
PORT=5000
NODE_ENV=development

# Ed25519 JWT Cryptographic Keys (PEM with escaped newlines)
# Generated automatically by KeyService in development if left blank
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Firebase Admin SDK Service Account (Single-line JSON string)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"connify-app",...}'

# Brevo API Key for Email OTP and Watchdog Guardian Alerts
BREVO_API_KEY="xkeysib-..."
SMTP_USER="alerts@connify.app"
```

#### Mobile Client (`Connify/.env`)
```env
# URL pointing to the running backend service
API_BASE_URL=http://10.0.2.2:5000   # Android Emulator host loopback
# API_BASE_URL=http://localhost:5000 # iOS Simulator or Web development
```

---

### 8.3 Installation & Startup Commands

#### 1. Repository Setup
```bash
git clone https://github.com/TheOrionGD/Connify-APP.git
cd Connify-APP
```

#### 2. Backend Initialization
```bash
cd backend
npm install
npm run prisma:generate
```

#### 3. Mobile & Multi-Platform Client Initialization
```bash
cd ../Connify
npm install
# Postinstall automatically applies patches via patch-package
```

---

#### Running Development Servers

**Using Concurrent Helper Script (Windows)**:
```cmd
start_dev.bat
```

**Starting Services Individually**:

*Start Backend (Port 5000 with Hot Reload)*:
```bash
cd backend
npm run dev
```

*Start React Native Metro Bundler*:
```bash
cd Connify
npm start
```

*Launch Android Application*:
```bash
cd Connify
npm run android
```

*Launch Web Version (Expo Web)*:
```bash
cd Connify
npm run web
```

---

## 9. Automated Testing Frameworks

### 9.1 Backend Test Suites
Executed using the native Node.js test runner and `tsx`:
```bash
cd backend
npm run test:all
```

#### Test Suite Breakdown:
1. `tests/allEndpoints.test.ts`: End-to-end REST API integration tests across device, episode, capsule, and outcome endpoints.
2. `tests/CapsuleController.test.ts`: Tests capsule minting, QR code signature verification, single-use token redemption, and revocation.
3. `tests/deviceRegistration.test.ts`: Tests device registration and key rotation flows.
4. `tests/deviceChallenge.test.ts`: Validates 60-second challenge nonce generation and consumption.
5. `tests/harmlessnessSystem.test.ts`: Tests Harmlessness Score calculations and velocity cap enforcement.
6. `tests/locationWatchdog.test.ts`: Simulates signal loss timeouts and guardian notification dispatch.
7. `tests/profileMigration.test.ts`: Tests profile updates and guardian synchronization.
8. `tests/symmetricVerificationPipeline.test.ts`: Tests end-to-end SHARP protocol Galois Field arithmetic and BCH decoding.
9. `tests/adminAuth.test.ts`: Verifies authentication on administrative routes.
10. `tests/e2eJourney.test.ts`: Simulates a complete multi-device emergency lifecycle from broadcast to resolution.

### 9.2 Mobile & Client Test Suites
Executed using Jest:
```bash
cd Connify
npm test
```

#### Test Suite Breakdown:
1. `__tests__/sharp.test.ts`: Tests client-side BCH(15,7) encoding, syndrome extraction, and error correction.
2. `__tests__/secureKeyService.test.ts`: Tests Ed25519 key generation and detached signature generation.
3. `__tests__/authStore.test.ts`: Validates Zustand authentication state transitions and credential derivations.
4. `__tests__/episodeStore.test.ts`: Tests episode state transitions, timer countdowns, and secondary responder registration.
5. `__tests__/apiClient.test.ts`: Verifies Axios request/response interceptors and bearer token injection.
6. `__tests__/apiServices.test.ts`: Tests API communication modules across devices, episodes, and capsules.
7. `__tests__/handshakeQr.test.ts`: Tests QR token generation, base64url encoding, and payload parsing.
8. `__tests__/feedMultiUser.test.ts`: Tests multi-user Socket.IO event handling on the feed channel.
9. `__tests__/components.test.tsx`: Tests rendering and styling of core UI components.
10. `__tests__/themeStore.test.ts`: Validates dark and light theme switching.
11. `__tests__/App.test.tsx`: Verifies root application mounting.

---

## 10. Release Engineering & Version Synchronization

Monorepo versioning is managed through `Connify/bump_version.js`.

### 10.1 Version Synchronization Script
```bash
cd Connify
npm run bump:patch   # e.g., 3.7.5 -> 3.7.6
npm run bump:minor   # e.g., 3.7.5 -> 3.8.0
npm run bump:major   # e.g., 3.7.5 -> 4.0.0
```
This script updates four configuration files simultaneously:
1. `Connify/package.json` (`version`)
2. `Connify/app.json` (`expo.version`, `version`)
3. `backend/package.json` (`version`)
4. `Connify/android/app/build.gradle` (increments `versionCode`, updates `versionName`)

### 10.2 Compiling Android Production Releases

**Build Release APK**:
```bash
cd Connify
npm run build:android-apk
# Outputs: Connify/android/app/build/outputs/apk/release/app-release.apk
```

**Build Android App Bundle (AAB for Google Play)**:
```bash
cd Connify
npm run build:android-bundle
# Outputs: Connify/android/app/build/outputs/bundle/release/app-release.aab
```

---

## 11. Security, Privacy & Regulatory Compliance

### 11.1 Zero-Trace Geolocation Invariants
- **No Coordinate History**: The central backend never stores location trails or historic routes.
- **1-Point Sliding Window**: The `DeviceLocation` table maintains only a single, most recent location record per device solely for watchdog timeout detection during active emergencies.
- **Immediate Post-Incident Deletion**: Once an emergency episode concludes, the active session terminates, socket channels disconnect, and live location streaming halts immediately.
- **Outcome Anonymity**: The `Outcome` database collection records only the resolution status, category, and completion timeliness. No user identifiers, device hashes, or coordinates are retained.

### 11.2 Replay Attack Prevention
Every QR token issued during the physical handshake includes a unique UUIDv4 nonce:
- During `/api/capsules/issue`, the backend checks if the nonce exists in `Episode.usedQrNonces`.
- If already present, the transaction is rejected with an error.
- If valid, the nonce is pushed atomically into the `usedQrNonces` array, preventing token replay attacks.

### 11.3 Account & Data Deletion Compliance
The codebase satisfies **Google Play Console Data Safety** policies and **Apple App Store Guideline 5.1.1(v)**:
- Users can initiate account deletion directly within `SettingsScreen.tsx` or via the official Google Form detailed in `ACCOUNT_DELETION_GOOGLE_FORM_SETUP.md`.
- Purges all associated profiles, credentials, emergency guardian relationships, medical notes, and device registrations.

---

## 12. Monorepo Dependency Matrix

### Backend Dependencies (`backend/package.json`)
- `fastify` (^5.10.0): Core HTTP web framework.
- `@fastify/cors` (^11.3.0): Cross-Origin Resource Sharing handling.
- `@fastify/rate-limit` (^11.1.0): Network rate limiting.
- `socket.io` (^4.8.3): Real-time bidirectional event transport.
- `prisma` / `@prisma/client` (^6.4.1): Database ORM and schema migration tool.
- `mongoose` (^9.8.0): MongoDB object modeling and document schemas.
- `jose` (^6.2.3): Universal JavaScript library for Ed25519 / EdDSA JWT signing.
- `tweetnacl` (^1.0.3): Cryptographic library for detached Ed25519 signatures.
- `firebase-admin` (^14.1.0): Firebase Admin SDK for authentication and push notifications.
- `zod` (^4.4.3): Schema validation for environment and API payloads.

### Mobile & Multi-Platform Dependencies (`Connify/package.json`)
- `react` (19.2.3) / `react-native` (0.86.0): Core mobile UI framework.
- `expo` (^57.0.13) / `react-native-web` (^0.21.2): Multi-platform web & Metro runtime.
- `@react-navigation/native` (^7.0.14), `@react-navigation/bottom-tabs` (^7.2.0), `@react-navigation/native-stack` (^7.2.0): Routing and navigation.
- `zustand` (^5.0.14): Client state management.
- `react-native-keychain` (^10.0.0): Hardware Keychain and Keystore access.
- `react-native-biometrics` (^3.0.1): Hardware fingerprint and Face ID sensor prompts.
- `react-native-vision-camera` (^5.2.1) / `@react-native-ml-kit/barcode-scanning` (^2.0.0): Camera module & barcode parsing.
- `@notifee/react-native` (^9.1.8): Local emergency notification channels.
- `react-native-geolocation-service` (^5.3.1): High-accuracy native GPS location provider.
- `react-native-reanimated` (^4.6.0): Native UI animation engine.
- `react-native-webview` (^14.0.1): Embedded web view running Leaflet maps.
- `react-native-qrcode-svg` (^6.3.21): SVG QR code rendering.
- `@react-native-firebase/app` (^25.1.0) / `@react-native-firebase/auth` (^25.1.0): Firebase client SDKs.
- `@react-native-google-signin/google-signin` (^16.1.4): Native Google OAuth 2.0 sign-in.

---

## 13. License

Distributed under the MIT License. See [LICENSE](file:///o:/PROJECTS/CONNIFY-APP/LICENSE) for full legal text.
