# CONNIFY — System Architecture & App Specification

---

## 1. Architecture Philosophy

Connify is not just an app — it's a **protocol implemented as an app**. The architecture borrows directly from zero-trust identity patterns used in agentic AI systems (DIDs, Verifiable Credentials, Just-In-Time credentials, Zero-Knowledge Proofs) but simplifies them for human-to-human, consumer-grade use using the **SHARP protocol** for privacy-preserving proximity verification:

| Zero-Trust Agentic Concept | Connify Equivalent | SHARP Protocol Integration |
|---|---|---|
| Decentralized Identifier (DID) | **Episode ID** | Ephemeral request identifier (UUIDv4) that isolates transactional identity |
| Verifiable Credential (VC) | **Trust Capsule** | Ed25519-signed JWT authorizing single-use temporary contact |
| Just-In-Time (JIT) VC issuance | **JIT Capsule Issuance** | The Trust Capsule is minted only after the SHARP handshake succeeds |
| Zero-Knowledge Proof (selective disclosure) | **Selective Disclosure & Blinding** | Reveals urgency/category pre-match; Bob blinds his grid index $b$ using key $K$ |
| Agent Name Service (ANS) discovery | **Helper Match Engine** | Coarse-grained location filtering (PostGIS) to find nearby candidates |
| Global Session Authority + Revocation | **Episode Lifecycle Manager** | Redis-backed single-use checkouts and absolute timeouts |
| Audit logging by DID | **Outcome Logging Module** | Decoupled, identity-free logging of completion outcomes |
| **Proximity verification / Handshake** | **SHARP Verification Handshake** | Client-side environmental Bloom filters & BCH syndrome key reconstruction |

---

## 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│   React Native / Expo (iOS & Android)  +  Next.js (Web Portal)   │
│   - Requester App View   - Helper App View   - Admin/Audit View  │
└───────────────┬───────────────────────────────┬─────────────────┘
                │  HTTPS/TLS + WebSocket (ephemeral channel)       │
┌───────────────▼───────────────────────────────▼─────────────────┐
│                     API GATEWAY / BFF LAYER                       │
│         Node.js (Express/Fastify) — request routing,             │
│         rate limiting, session token validation                  │
└───────────────┬───────────────────────────────┬─────────────────┘
                │                                │
┌───────────────▼──────────────┐   ┌─────────────▼─────────────────┐
│  LAYER 1: IDENTITY & EPISODE  │   │  LAYER 2: SHARP VERIFICATION   │
│  - Episode Creation Service   │   │  - Environmental Signal Tag    │
│  - Episode ID Registry        │   │  - Bloom Filter Generator      │
│  - Expiry & Lifecycle Manager │   │  - BCH Syndrome Key Exchange   │
│                                │   │  - Oblivious Proximity Handshake│
└───────────────┬───────────────┘   │  - Grid Index Blinding Module  │
                │                    └─────────────┬─────────────────┘
                │                                  │
┌───────────────▼──────────────────────────────────▼───────────────┐
│              LAYER 3: SELECTIVE DISCLOSURE ENGINE                 │
│   Determines minimum data helper needs to see (category, urgency, │
│   general location radius) — never full identity/address/history  │
└───────────────┬─────────────────────────────────────────────────┘
                │
┌───────────────▼───────────────┐
│      LAYER 4: TRUST CAPSULE SERVICE             │
│  - Validates Bob's blinded grid cell response  │
│  - Binds: 1 request + 1 helper + 1 time window  │
│  - Signs capsule (Ed25519 key pair)             │
│  - Enforces single-use + auto-expiry via Redis  │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼──────────────────────┐   ┌──────────────────────────┐
│  LAYER 5: HELPER MATCH ENGINE         │   │ LAYER 6: EPHEMERAL COMMS │
│    based matching                     │   │    channel per episode   │
│  - Pushes match to nearby helpers     │   │  - Auto-destructs on     │
│                                        │   │    capsule expiry        │
└────────────────────────────────────────┘   └──────────────────────────┘
                │
┌───────────────▼─────────────────────────────────┐
│    LAYER 7: OUTCOME LOGGING (Minimal Audit)       │
│  Stores ONLY: success/fail, category, risk level, │
│  completed-within-window (yes/no) — no identity,  │
│  no location trail, no message content            │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────┐
│              DATA LAYER                           │
│  - Encrypted-at-rest DB (episode metadata only)   │
│  - Ephemeral key-value store (active capsules)    │
│  - No persistent identity graph / no full profiles│
└───────────────────────────────────────────────────┘
```

---

## 3. Core Services (Backend)

| Service | Responsibility | Notes |
|---|---|---|
| **Episode Service** | Creates/tracks help-request lifecycle | Each episode = one DID-like unique ID |
| **Verification Service** | Executes the SHARP handshake. | Manages environmental Bloom filters & BCH syndromes, and verifies Bob's blinded grid cell response |
| **Disclosure Service** | Filters data shown to helper | Rule-based, could evolve to ZKP-based proofs |
| **Trust Capsule Service** | Issues, signs, expires tokens | JIT-issuance — only after SHARP verification passes |
| **Matching Service** | Finds nearby candidate helpers | Coarse location filtering using PostGIS radius checks |
| **Comms Relay** | Ephemeral messaging/calling | Channel dies when capsule expires |
| **Outcome Service** | Minimal feedback logging | Decoupled from identity — privacy by design |
| **Revocation/Expiry Worker** | Kills capsules/sessions on timeout or abuse flag | Equivalent to "global logout" pattern |

---

## 4. Threat Mitigation Mapped to Architecture

| Threat | Architectural Control |
|---|---|
| Fake requests | SHARP Verification Service (Environmental location tags containing entropy > 64 bits to prevent forgery) |
| Spoofed location | Multi-signal environmental tags (Wi-Fi frame headers & LTE control messages like TC-RNTI), preventing GPS spoofing apps |
| Malicious helpers | Identity exposure delayed until capsule issuance |
| Replay attacks | Capsule bound to 1 request/1 helper/1 time window and single-use Redis NX lock |
| Surveillance creep | Outcome Service stores minimal, non-identifying data only |


---

## 5. App Pages & Features

### A. Onboarding & Access
**Page: Welcome / Get Started**
- Minimal sign-up (phone number or device-bound key, no heavy KYC)
- Brief protocol explainer ("one-time trust, not a profile")
- Permission requests: location, camera (QR), notifications

**Page: Home Dashboard**
- Toggle: "I need help" vs "I can help nearby"
- Active episode status card (if any)
- Quick-access emergency mode button

---

### B. Requester Flow

**Page: Create Help Request**
- Category selector (medical, transport, general, emergency)
- Urgency slider
- Short context field (auto-limited to prevent oversharing)
- Coarse location capture (approximate grid cell, not exact coordinates)

**Page: Request Verification**
- Generates time-bound QR code containing Alice's location tag syndromes (BCH) and helper string $y$
- Shows device-consistency status
- Optional "add a witness" (nearby trusted contact confirms)

**Page: Waiting for Match**
- Live status: searching → matched → capsule issued
- Cancel button (kills episode instantly)

**Page: Active Episode (Requester View)**
- Ephemeral chat/call with matched helper
- Countdown timer to capsule expiry
- "Mark complete" / "Report issue" buttons

**Page: Feedback**
- Binary success/failure
- Category confirmation
- No free-text personal commentary stored beyond this

---

### C. Helper Flow

**Page: Nearby Requests Feed**
- List of anonymized, disclosure-filtered requests (category + urgency + rough distance only)
- No requester identity shown pre-match

**Page: Accept & Verify**
- Scans requester's QR
- Captures nearby Wi-Fi frame headers and LTE control messages (TC-RNTI) to construct local location tag Bloom filter
- Reconstructs session key $K$ via BCH syndrome decoding, and submits blinded grid cell index $B = \mathcal{H}'(K, b \mathbin{\Vert} \text{"Bob"})$
- Trust Capsule issued only after verification checks pass

**Page: Active Episode (Helper View)**
- Reveals only the minimum info needed to complete the task
- Ephemeral comms channel
- Capsule countdown visible

**Page: Completion & Feedback**
- Confirms task outcome
- Capsule auto-invalidates, channel closes


---

### D. Trust & Safety Layer (Shared)

**Page: Emergency / High-Stakes Mode**
- Streamlined flow for scenarios like the oxygen-concentrator blackout case
- Priority matching + faster verification thresholds
- Optional auto-alert to local emergency services

**Page: Episode History (Minimal)**
- Shows only past episode outcomes (success/fail, category) — never full chat logs or helper/requester identities
- No persistent reputation score exposed to other users (avoids surveillance-style profiling)

---

### E. Settings & Governance

**Page: Privacy & Data**
- Explains exactly what's logged (outcome data only)
- Data deletion / episode purge controls

**Page: Device & Security**
- Manage device-bound keys
- Witness contact management

**Page: About the Protocol**
- Explains episode-bound trust model to build user understanding/trust

---

## 6. Phased Build Alignment

| Phase | Architecture Focus | App Pages Enabled |
|---|---|---|
| **Phase 1** | Episode Service, basic SHARP handshake (Wi-Fi frame header tags, manual QR check) | Create Request, Verification, Waiting for Match, Active Episode (basic) |
| **Phase 2** | Device-bound checks, LTE control signals, BCH syndrome coding, automatic proximity check | Enhanced Verification, countdown timers |
| **Phase 3** | Selective Disclosure Engine, grid cell blinding, PostGIS coarse matching | Nearby Requests Feed filtering, Emergency Mode |
| **Phase 4** | Privacy refinement, outcome-based matching tuning | Episode History, Privacy & Data settings |


---

## 7. Detailed Tech Stack

A note on feasibility first: the original proposal language (DIDs, Verifiable Credentials, ZKPs) is useful as a **conceptual model**, but a real blockchain-based DID/VC stack is unnecessary overhead for a consumer safety app and would add latency, cost, and complexity with no real benefit at MVP scale. Below is what's actually buildable, with the "protocol" ideas implemented as **plain signed tokens and server-side rules** rather than DLT infrastructure. A path to true DID/ZKP is noted at the end for later phases, if ever justified.

### 7.1 Mobile Client (React Native + Expo)
The mobile client is built as a native application using **React Native and the Expo SDK**, targeting iOS and Android. This provides native performance, native UI rendering (rather than WebViews), and seamless access to hardware security modules like Keychain/Keystore.

| Component | Technology | Why |
|---|---|---|
| Mobile Framework | **React Native (Expo)** | Cross-platform native application framework for iOS and Android |
| State Management | **Zustand** | Minimal boilerplate, lightweight state management that scales easily |
| UI/Styling | **NativeWind** or **StyleSheet** | Tailored UI styles; NativeWind allows Tailwind-like syntax in React Native |
| QR Code Generation | `react-native-qrcode-svg` | Renders vector QR codes quickly in React Native |
| QR Code Scanning | `expo-camera` | High-accuracy native camera access for fast, reliable QR verification |
| Geolocation | `expo-location` | Queries high-precision device GPS, falls back to cell/Wi-Fi positioning |
| Push Notifications | `expo-notifications` | Interfaces with iOS APNs and Android FCM via EAS |
| Secure Storage (Sensitive) | `expo-secure-store` | Accesses iOS Keychain and Android Keystore for Ed25519 signing keys and device fingerprints |
| Local Storage (Non-sensitive)| `@react-native-async-storage/async-storage` | Simple, persistent key-value store for app settings/caching |
| Real-time Comms | `socket.io-client` | Standard WebSockets client to communicate with Fastify Socket.IO server |



### 7.2 Frontend (Web — Admin/Audit Portal)
| Component | Technology | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR for admin dashboards, good DX |
| UI | **Tailwind CSS + shadcn/ui** | Fast, accessible components |
| Charts (audit/ops dashboards) | **Recharts** | Lightweight, sufficient for ops metrics |

### 7.3 Backend / API
| Component | Technology | Why |
|---|---|---|
| Runtime | **Node.js 20 LTS** | Matches team's stack, mature ecosystem |
| API framework | **Fastify** (preferred over Express for this) | Built-in schema validation, better throughput for real-time-heavy app |
| Language | **TypeScript** | Type safety across episode/capsule state machines — important given the correctness requirements (single-use, expiry) |
| API contract | **OpenAPI 3 + Zod schemas** | Enforced request/response validation |
| Background jobs | **BullMQ (Redis-backed)** | Capsule expiry sweeps, revocation propagation, match timeouts |
| Real-time layer | **Socket.IO (server)** with Redis adapter | Handles ephemeral chat rooms scoped per episode; Redis adapter needed once you run >1 server instance |

### 7.4 Data Layer
| Component | Technology | Why |
|---|---|---|
| Primary DB | **MongoDB Atlas** | Document flexibility and `2dsphere` indexes for geospatial queries (see §7.6, §8.1) |
| ODM | **Mongoose** | Schema validation, type-safe queries, and rich middleware support |
| Ephemeral/session store | **Render Key Value** (Redis-compatible, Valkey 8) | Active capsules, rate limits, Socket.IO pub/sub, BullMQ queues — same region as the API service to keep latency low |
| Encryption at rest | **MongoDB Atlas built-in encryption** | Minimizes blast radius if DB is breached |
| Data retention | Render **Cron Job** purges episode/location data post-expiry; only outcome summary rows persist long-term | Matches the "minimal outcome logging" design goal |

### 7.5 Identity, Verification & "Trust Capsule" Cryptography
This replaces the DID/VC/DLT framing with a realistic, auditable equivalent based on the **SHARP protocol** for secure, private proximity verification:

| Concept | Real Implementation |
|---|---|
| Episode ID (~"DID") | UUIDv4 generated server-side per request, never reused |
| Trust Capsule (~"VC") | **JWT signed with Ed25519** (via `jose` or `paseto` library) — short expiry (`exp` claim), single-use enforced via Redis key that's deleted on first validation |
| Device consistency check | Device fingerprint (hashed hardware/install ID) stored per episode, compared on capsule redemption |
| QR token / Syndromes | Short-lived QR containing **BCH syndromes** of Alice's location tag Bloom filter and a helper string $y$. |
| Wi-Fi/LTE Location Tag | Built client-side by capturing environmental signals (Wi-Fi frame headers and LTE control messages like TC-RNTI) and loading them into a 1024-bit Bloom filter. |
| Fuzzy Extractor Handshake | Bob reconstructs the temporary session key $K$ by applying BCH syndrome decoding to his own location tag Bloom filter. |
| Fine-Grained Grid Check | Bob sends a blinded grid index $B = \mathcal{H}'(K, b \mathbin{\Vert} \text{"Bob"})$. Alice searches her nearby grid cells to find a match, verifying Bob's proximity without revealing exact location to the server. |
| Signing keys | **Ed25519 key pair per server environment**, stored in a secrets manager (AWS KMS / GCP Secret Manager), rotated periodically |
| Selective disclosure | Server-side filtering + grid blinding — only coarse region shown pre-match, exact proximity verified privately by Alice. |

> **Why not real ZKPs/DIDs at MVP:** They require either a permissioned ledger (ops overhead, no real decentralization benefit for a single-company app) or heavy client-side crypto libraries that hurt mobile performance and add UX friction (key backup/recovery becomes a support nightmare). The SHARP protocol's combination of Bloom filters, BCH syndromes, and grid cell blinding achieves strong location privacy (oblivious server) and unforgeable proximity checks with minimal mobile computational overhead.


### 7.6 Infrastructure & Hosting — Render

Verified against Render's current documentation (not assumed) — the mapping below uses Render's actual service types:

| Component | Render Service | Why / Verified Detail |
|---|---|---|
| API server (Fastify/Node) | **Web Service** | Git-push deploy, auto TLS on custom domains, autoscaling on paid plans. Web Services support inbound WebSocket connections natively — confirmed no enforced max connection duration (Render recommends ping/pong keepalive, since instances can still restart on deploys/maintenance) |
| Real-time chat (Socket.IO) | Same **Web Service**, or a dedicated one | Runs on the same long-lived instance model — this is exactly the persistent-connection use case Render is built for, unlike serverless platforms where WebSockets are tied to function lifecycles |
| Primary database | **MongoDB Atlas** | Utilizes `2dsphere` indexes for geospatial queries in §8.1. Integrated with Render services securely. |
| Redis / session store | **Render Key Value** | Redis-compatible (runs Valkey 8 on new instances — a drop-in-compatible fork, works fine with `ioredis`/`bullmq`); used for capsule single-use locks, rate limiting, Socket.IO pub/sub adapter |
| Background jobs (BullMQ workers) | **Background Worker** | Purpose-built for exactly this: continuously polling a Redis-backed queue with no HTTP interface — matches the capsule-expiry sweep and revocation-propagation jobs described in §3 |
| Scheduled purge job (data retention, §8.1) | **Cron Job** | Render cron jobs support runs up to 12 hours — comfortably enough for a nightly retention/purge task |
| Admin/audit web portal (Next.js) | **Static Site** (if exported statically) or **Web Service** (if you need SSR) | Static Site gives you Render's CDN for free; only use a Web Service here if the admin portal needs server-side rendering |
| Secrets (signing keys, DB credentials) | **Render Environment Variables (marked secret) / Secret Files** | Render doesn't offer an AWS KMS/HSM equivalent — for the Ed25519 signing key, store it as a secret environment variable or Secret File, generated once at provisioning time and rotated manually. If true hardware-backed key custody becomes a compliance requirement later, that would need an external KMS (e.g., AWS KMS) called from the Render service, not something Render itself provides |
| Logs/metrics | Render's built-in log stream + metrics dashboard, **plus Sentry** for error tracking | Render's native tooling covers basic ops visibility; Sentry is still worth adding for structured error tracking/alerting, since that's outside Render's built-in scope |
| CI | **GitHub Actions** for tests/linting before merge, Render's native Git auto-deploy for the actual deploy step | Render deploys directly from a connected GitHub repo — you don't need a separate deploy pipeline, just gate merges with CI checks |

**Practical constraints worth knowing before committing to Render:**
- **Region selection matters more than usual:** Render's regions are limited (e.g., Oregon, Ohio, Virginia, Frankfurt, Singapore). Your Web Service, MongoDB Atlas cluster, and Key Value instance should all be provisioned in the **same region** — cross-region hops add latency to every DB/Redis call, which matters here since capsule verification is latency-sensitive (users are standing there waiting for a QR scan to resolve).
- **Multi-instance WebSockets:** if you ever autoscale the API to multiple instances, a client is **not guaranteed to reconnect to the same instance** after a disruption — this is exactly why the Redis adapter for Socket.IO (already specified in §7.3) is not optional once you scale past one instance.
- **No built-in HSM:** if a future compliance requirement (e.g., partnering with a government/NGO body per §7.8) demands hardware-backed key custody, Render alone won't satisfy that — you'd bolt on an external KMS at that point, not before.


### 7.7 Security Hardening Specifics
- **Rate limiting:** `@fastify/rate-limit` backed by Redis — prevents QR/capsule brute-forcing.
- **TLS everywhere:** enforced via load balancer; no plaintext transport ever.
- **Audit log signing:** each outcome log entry hashed (SHA-256) and chained to the previous entry's hash (simple hash-chain, not a blockchain) so tampering is detectable without DLT overhead.
- **Abuse/kill-switch:** Redis flag per episode ID checked by the Socket.IO gateway on every message — equivalent to the "global session revocation" pattern, without needing a distributed session authority.

### 7.8 Realistic Later-Phase Options (not MVP)
If Connify scales into a multi-organization or cross-platform protocol (e.g., licensed to NGOs, cities, other apps), *then* real DIDs/VCs become justified:
- `did:web` (simplest, no ledger required) issued per organizational partner, not per user
- W3C Verifiable Credentials for cross-org trust (e.g., a city emergency service verifying a partner app's episodes)
- This should only be pursued once there's a genuine multi-party trust boundary — not for a single-vendor consumer app.

---

## 8. Database Architecture (Detailed)

Database choice is **backend-agnostic to how you built the frontend** — MongoDB/Redis work the same whether the client is React Native/Expo, a plain web app, or a Capacitor-wrapped app. Since you've settled on **Render** for hosting (§7.6), the server-side layer below is specifically **MongoDB Atlas** and **Render Key Value**. What *does* change because of the React Native approach is the **client-side local storage layer**, covered in §8.2.

### 8.1 Server-Side Database (Source of Truth)

**MongoDB Atlas** serves as the primary store. The state machine transitions (episode → capsule → outcome) are managed through Mongoose application-level validations. Geospatial queries utilize MongoDB's `2dsphere` indexes, avoiding the need for complex PostGIS setup.

**Core schema (simplified Mongoose definitions):**

```typescript
// ── Device Model ──────────────────────────────────────────────────────
const DeviceSchema = new Schema({
  deviceFingerprintHash: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true },
  isQuarantined: { type: Boolean, default: false },
  suspiciousCount: { type: Number, default: 0 },
  harmlessnessScore: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
});

// ── Episode Model ─────────────────────────────────────────────────────
const EpisodeSchema = new Schema({
  requesterDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  category: { type: String, required: true },
  urgency: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false }, // [longitude, latitude]
  },
  radiusMeters: { type: Number, default: 500 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});
EpisodeSchema.index({ location: '2dsphere' });

// ── Capsule Model ─────────────────────────────────────────────────────
const CapsuleSchema = new Schema({
  episodeId: { type: Schema.Types.ObjectId, ref: 'Episode', required: true },
  helperDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  signedTokenHash: { type: String, required: true },
  status: { type: String, default: 'issued' }, // issued/redeemed/expired/revoked
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// ── Outcome Model ─────────────────────────────────────────────────────
const OutcomeSchema = new Schema({
  episodeId: { type: Schema.Types.ObjectId, ref: 'Episode', required: true },
  result: { type: String, required: true }, // success/failure
  category: { type: String, required: true },
  completedInWindow: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ── AuditLog Model ────────────────────────────────────────────────────
const AuditLogSchema = new Schema({
  eventType: { type: String, required: true },
  episodeId: { type: Schema.Types.ObjectId, ref: 'Episode' },
  prevHash: { type: String, required: true },
  entryHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
```

**Key technical decisions:**
| Decision | Reasoning |
|---|---|
| `location: { type: 'Point', coordinates: [...] }` | Initial coarse filtering uses MongoDB's `$near` and `$geoWithin` operators over a `2dsphere` index to broadcast matching notifications — exact proximity is subsequently validated privately via SHARP. |
| Spatial index | `EpisodeSchema.index({ location: '2dsphere' });` — required for MongoDB radius queries to stay fast as episode volume grows |
| BCH Syndromes & Helper String y | Stored in `episodes` document to allow matched helpers to perform local fuzzy extractor reconstruction of the session key $K$. |
| ObjectIds and Refs | Ensures efficient JOIN-like populated queries, although the state machine is enforced in the `EpisodeController`. |
| `signed_token_hash` not the token | Even if the DB is breached, the actual bearer token (JWT) can't be extracted and replayed |

**Ephemeral/session store — Render Key Value (Redis-compatible):**
- Active capsule single-use lock: `SET capsule:{id} used NX EX {ttl}` — atomic, so two simultaneous redemption attempts can't both succeed (solves the double-spend problem for a single-use token). This works identically on Render Key Value since it's Redis-protocol-compatible (Valkey 8 under the hood on new instances)
- Rate limiting counters (per device, per IP)
- Socket.IO pub/sub adapter + BullMQ job queues (expiry sweeps, match timeouts) — run the BullMQ consumers as a Render **Background Worker**, not inside the Web Service, so a queue backlog can't starve incoming HTTP/WebSocket traffic

**Retention/purge job:**
A scheduled worker (BullMQ cron job) deletes `episodes.coarse_location` and any transient verification data once `status = completed/expired`, retaining only the `outcomes` row long-term. This operationalizes the "minimal outcome logging" principle rather than just stating it as a policy.


---

### 8.2 Client-Side Local Storage (React Native / Expo App)

This is the part that changes because of your build approach. A React Native app runs your JavaScript code directly, rendering native UI components instead of running inside a native WebView. That means standard browser storage APIs like `localStorage` or `IndexedDB` are unavailable. Instead, we use native storage wrappers. Crucially, sensitive keys must use hardware-backed secure storage, as storing signing keys in plain text is a real security gap.

| Storage need | Correct choice | Why |
|---|---|---|
| UI state, draft form data, filter preferences | `@react-native-async-storage/async-storage` | Non-sensitive, fine to lose on app reinstall |
| Cached read-only data (episode history list for offline viewing) | `expo-sqlite` or a SQLite wrapper | Structured, queryable, works offline for **read-only** display |
| Device key pair (Ed25519 private key) | `expo-secure-store` | **Never** use plaintext `AsyncStorage` — private keys must be stored in iOS Keychain or Android Keystore, which are hardware-backed and secure against basic system compromise |
| Device fingerprint / verification token | `expo-secure-store` | It's presented during capsule redemption — if it leaks, an attacker can impersonate the device in the verification handshake |

**Why this matters concretely for Connify:** the "device consistency check" in the Threat Model (§4) is only meaningful if the key it relies on can't be trivially copied off the device. If that key sits in unencrypted local storage, it is extractable with basic tooling on a compromised or rooted device. Keystore/Keychain-backed storage requires hardware-level compromise or device unlock clearance to extract, which is the security guarantee the architecture is claiming to provide.

**No offline path for capsule issuance/redemption — by design, not limitation:**
Single-use enforcement (§8.1, Redis `SET NX`) requires a server round-trip as the single source of truth. If capsule validation were done client-side against locally cached state, two devices could each independently "validate" the same capsule while both offline, and both proceed — a classic double-spend problem. So: cache read-only data offline freely; never let the verification/capsule flow degrade to an offline mode.

---

### 8.3 React Native + Expo Build Pipeline (EAS) — Practical Notes

Since you are using a native development environment with Expo:

1. **Development & Testing:** Use Expo Go for rapid prototyping during local development, or build a custom development client (`npx expo run:android` / `npx expo run:ios`) when native configuration changes are required.
2. **EAS Build & Update:** Leverage Expo Application Services (EAS) for cloud builds (`eas build`) and Over-The-Air (OTA) updates (`eas update`), avoiding the need to configure complex Xcode and Android Studio environments locally.
3. **Credentials Management:** Firebase configuration (`google-services.json` for Android and `GoogleService-Info.plist` for iOS) should be referenced in `app.json` under `expo.android.googleServicesFile` and `expo.ios.googleServicesFile` so Expo handles compilation automatically.
4. **Permissions Configuration:** System permissions (camera, location, notifications) are specified in the `app.json` / `app.config.js` plugins array (e.g., `expo-camera`, `expo-location`). Expo Config Plugins generate the correct native configuration files during the prebuild phase.
5. **Background execution & Socket lifecycle:** React Native JS threads are suspended by the OS when the app is backgrounded. Socket.IO connections will drop. Always use native APNs/FCM push notifications (`expo-notifications`) as the primary wake-up and alert channel, and reconnect/sync socket state when the app regains focus using standard React Native `AppState` listeners.
6. **Metro Bundler configuration:** Metro serves JS bundles to React Native. Ensure configuration in `metro.config.js` supports resolving standard npm dependencies.

---

*This document synthesizes the Connify proposal architecture with zero-trust identity patterns (episode-as-identity, capsule-as-credential, JIT issuance, selective disclosure) adapted for a consumer safety context rather than a multi-agent AI system, and reflects a React Native + Expo mobile application for iOS and Android deployment.*

---

## Tech Stack

### Web Portal (Frontend)
- Next.js (App Router)
- Tailwind CSS + shadcn/ui
- Recharts

### Mobile Client (React Native)
- React Native and Expo SDK
- Zustand (State Management)
- expo-camera (QR Code Scanning)
- expo-location (Geolocation)
- expo-notifications (Push Notifications)
- expo-secure-store (Hardware-backed Secure Storage)
- @react-native-async-storage/async-storage (Local Storage)
- socket.io-client (Real-time Comms)

### Backend and APIs
- Node.js with Fastify and TypeScript
- OpenAPI 3 and Zod
- Socket.IO client/server
- BullMQ

### Data and Storage
- MongoDB Atlas with Mongoose
- Redis-compatible Key Value store
- MongoDB built-in encryption

### Security and Infrastructure
- JWT signed with Ed25519
- Rate limiting, TLS, and secure storage for device keys
- Render Web Service, MongoDB Atlas, Render Key Value, Background Worker, and Cron Job

---

## Developers

| Team Member | Primary Role | Responsibilities |
|---|---|---|
| **Godfrey T R** | Lead Software Engineer & System Architect | Design the overall protocol architecture, backend services, trust capsule lifecycle, API contracts, security architecture, authentication flow, system integration, deployment strategy, and overall engineering decisions. Coordinate implementation across modules. |
| **Hari Prakash A** | Frontend Engineer, UX/UI & Product Experience Lead | Design the user journey, React Native/Expo frontend, prototype screens, trust flow visualization, selective disclosure interface, QR interaction experience, branding, presentation assets, and usability improvements. |
| **Grish Narayanan S** | AI, Security & Verification Systems Engineer | Design and implement the Need Verification Engine, contextual verification logic, trust scoring experiments, AI-assisted fraud detection, device consistency validation, Wi-Fi/GPS verification pipeline, cryptographic token validation, and future intelligent matching algorithms. |
