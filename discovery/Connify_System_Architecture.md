# CONNIFY — System Architecture & App Specification

---

## 1. Architecture Philosophy

Connify is not just an app — it's a **protocol implemented as an app**. The architecture borrows directly from zero-trust identity patterns used in agentic AI systems (DIDs, Verifiable Credentials, Just-In-Time credentials, Zero-Knowledge Proofs) but simplifies them for human-to-human, consumer-grade use:

| Zero-Trust Agentic Concept | Connify Equivalent |
|---|---|
| Decentralized Identifier (DID) | **Episode ID** — a unique, ephemeral identifier per help request |
| Verifiable Credential (VC) | **Trust Capsule** — a signed, time-bound permission token |
| Just-In-Time (JIT) VC issuance | Trust Capsule is only minted after verification passes |
| Zero-Knowledge Proof (selective disclosure) | **Selective Disclosure Module** — reveals only what's needed |
| Agent Name Service (ANS) discovery | **Helper Match Engine** — capability/proximity-based matching |
| Global Session Authority + Revocation | **Episode Lifecycle Manager** — expires/kills a capsule instantly |
| Audit logging by DID | **Outcome Logging Module** — minimal, decoupled from identity |

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
│  LAYER 1: IDENTITY & EPISODE  │   │  LAYER 2: VERIFICATION LAYER   │
│  - Episode Creation Service   │   │  - QR Token Generator/Validator│
│  - Episode ID Registry        │   │  - Device Consistency Check    │
│  - Expiry & Lifecycle Manager │   │  - Wi-Fi Proximity Handshake   │
│                                │   │  - GPS Cross-Check              │
└───────────────┬───────────────┘   │  - Optional Witness Confirm    │
                │                    └─────────────┬─────────────────┘
                │                                  │
┌───────────────▼──────────────────────────────────▼───────────────┐
│              LAYER 3: SELECTIVE DISCLOSURE ENGINE                 │
│   Determines minimum data helper needs to see (category, urgency, │
│   general location radius) — never full identity/address/history  │
└───────────────┬─────────────────────────────────────────────────┘
                │
┌───────────────▼───────────────────────────────┐
│      LAYER 4: TRUST CAPSULE SERVICE             │
│  - Mints one-time cryptographic token           │
│  - Binds: 1 request + 1 helper + 1 time window  │
│  - Signs capsule (public/private key pair)      │
│  - Enforces single-use + auto-expiry            │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼──────────────────────┐   ┌──────────────────────────┐
│  LAYER 5: HELPER MATCH ENGINE         │   │ LAYER 6: EPHEMERAL COMMS │
│  - Proximity + urgency + category     │◄─►│  - Temporary chat/call   │
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
| **Verification Service** | QR + device + Wi-Fi/GPS checks | Multi-signal, never single-factor |
| **Disclosure Service** | Filters data shown to helper | Rule-based, could evolve to ZKP-based proofs |
| **Trust Capsule Service** | Issues, signs, expires tokens | JIT-issuance — only after verification passes |
| **Matching Service** | Finds nearby eligible helpers | Category + urgency + distance weighting |
| **Comms Relay** | Ephemeral messaging/calling | Channel dies when capsule expires |
| **Outcome Service** | Minimal feedback logging | Decoupled from identity — privacy by design |
| **Revocation/Expiry Worker** | Kills capsules/sessions on timeout or abuse flag | Equivalent to "global logout" pattern |
| **BehavioralRiskEngine** *(v2.0)* | 5-pillar real-time harmlessness scoring | Trap velocity detection, quarantine, responder panic abort — `POST /api/episodes/:id/threat-abort` |
| **LocationWatchdogService** *(v2.0)* | 5s atomic GPS pings + 15s Guardian SMS watchdog | Reads coordinates from MongoDB; personalized SMS with name, relationship, & Google Maps link; unbounded signal recovery |
| **ProfileController** *(v2.0)* | Anonymous → Registered profile migration | Firebase `linkWithCredential` binding; mandatory guardian enforcement; `POST /api/profile/upgrade` |

---

## 3.1 New MongoDB Models (v2.0)

| Model | Fields | Purpose |
|---|---|---|
| **Device** | `deviceFingerprintHash`, `publicKey`, `isQuarantined`, `suspiciousCount`, `harmlessnessScore` | Stores Ed25519 public key and behavioral risk state |
| **Episode** | `requesterDeviceId`, `category`, `urgency`, `location`, `isDuress`, `acousticSampleHash` | Distress episode with geospatial 2dsphere index |
| **Profile** | `deviceId`, `firebaseUid`, `firstName`, `lastName`, `phone`, `email`, `isAnonymous` | User profile — starts anonymous, upgraded via `/api/profile/upgrade` |
| **Guardian** | `deviceId`, `userFullName`, `fullName`, `phone`, `relationship` | Mandatory guardian contact; used for personalized watchdog SMS alerts |
| **DeviceLocation** | `deviceId`, `latitude`, `longitude`, `lastPingAt`, `signalLostAlertSent`, `retryCount`, `isActiveSession` | 5-second atomic GPS record; drives watchdog signal loss detection |
| **Outcome** | `episodeId`, `responderDeviceId`, `result`, `createdAt` | Outcome logging: `SAFE_RESOLVED`, `SUSPICIOUS_BEHAVIOR`, `ACTIVE_THREAT` |

---

## 4. Threat Mitigation Mapped to Architecture

| Threat | Architectural Control |
|---|---|
| Fake requests | Verification Service (QR + device + witness) |
| Spoofed location | GPS + Wi-Fi + QR timing combined, never GPS alone |
| Malicious helpers | Identity exposure delayed until capsule issuance |
| Replay attacks | Capsule bound to 1 request/1 helper/1 time window |
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
- Location capture (approximate radius, not exact address)

**Page: Request Verification**
- Auto-generates time-bound QR token
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
- Device/location proximity handshake runs automatically
- Trust Capsule issued only after all checks pass

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
| **Phase 1** | Episode Service, basic QR capsule, manual verification | Create Request, Verification, Waiting for Match, Active Episode (basic) |
| **Phase 2** | Device-bound checks, Wi-Fi proximity, expiry logic | Enhanced Verification, countdown timers |
| **Phase 3** | Selective Disclosure Engine, contextual matching | Nearby Requests Feed filtering, Emergency Mode |
| **Phase 4** | Privacy refinement, outcome-based matching tuning | Episode History, Privacy & Data settings |

---

## 7. Detailed Tech Stack

A note on feasibility first: the original proposal language (DIDs, Verifiable Credentials, ZKPs) is useful as a **conceptual model**, but a real blockchain-based DID/VC stack is unnecessary overhead for a consumer safety app and would add latency, cost, and complexity with no real benefit at MVP scale. Below is what's actually buildable, with the "protocol" ideas implemented as **plain signed tokens and server-side rules** rather than DLT infrastructure. A path to true DID/ZKP is noted at the end for later phases, if ever justified.

### 7.1 Frontend (Mobile-First Web App, wrapped via Capacitor)
Corrected from the earlier draft: since the actual build path is a **mobile-first responsive web app, later wrapped into a native Android shell with Capacitor CLI**, React Native/Expo-specific packages don't apply. Everything below is standard web tech that Capacitor bridges into native APIs.

| Component | Technology | Why |
|---|---|---|
| Web framework | **React (Vite)** or **Next.js (static export)** | Vite is lighter/faster if you don't need SSR; Next.js static export works fine too since Capacitor just needs a `www`/`dist` output folder |
| Styling | **Tailwind CSS** | Mobile-first utility classes map directly to your responsive design goal |
| State management | **Zustand** | Minimal boilerplate, works identically in web and Capacitor contexts |
| Native shell | **Capacitor CLI** (`@capacitor/core`, `@capacitor/android`) | Wraps the web build in a native WebView, exposes native plugin bridge |
| QR generation | `qrcode` or `qrcode.react` (pure JS, no native dependency) | Runs fine in-browser or in WebView, no plugin needed |
| QR scanning | `@capacitor-community/barcode-scanner` **or** `@capacitor/camera` + a JS decode library (`jsQR`) | Browser `<video>` + `getUserMedia` is unreliable for continuous QR scanning across Android devices — use the native plugin for real-time scanning accuracy |
| Geolocation | `@capacitor/geolocation` | Falls back to browser Geolocation API on plain web, uses native GPS via plugin inside the wrapped app |
| Push notifications | `@capacitor/push-notifications` (requires Firebase project + `google-services.json`) | Browser push isn't available before wrapping; only works once Capacitor-wrapped |
| Local storage (non-sensitive) | `@capacitor/preferences` | Thin wrapper — SharedPreferences on Android, falls back to localStorage on web |
| Local storage (sensitive) | `capacitor-secure-storage-plugin` or `@aparajita/capacitor-secure-storage` | Bridges to Android Keystore — **do not** store signing keys/device fingerprint in localStorage/IndexedDB, see §8.2 |
| Real-time channel client | **Socket.IO client** (standard WebSocket) | Works identically in-browser and inside the Capacitor WebView, no plugin required |


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
| Primary DB | **PostgreSQL 16 on Render Postgres** | Relational integrity matters here (episode → capsule → outcome is a strict state machine); Render Postgres confirmed supports the `postgis` extension needed for proximity queries (see §7.6, §8.1) |
| ORM | **Prisma** | Type-safe queries, migrations |
| Ephemeral/session store | **Render Key Value** (Redis-compatible, Valkey 8) | Active capsules, rate limits, Socket.IO pub/sub, BullMQ queues — same region as the API service to keep latency low |
| Encryption at rest | **pgcrypto** (Postgres extension, also confirmed supported on Render Postgres) for any location/context fields | Minimizes blast radius if DB is breached |
| Data retention | Render **Cron Job** purges episode/location data post-expiry; only outcome summary rows persist long-term | Matches the "minimal outcome logging" design goal |

### 7.5 Identity, Verification & "Trust Capsule" Cryptography
This replaces the DID/VC/DLT framing with a realistic, auditable equivalent:

| Concept | Real Implementation |
|---|---|
| Episode ID (~"DID") | UUIDv4 generated server-side per request, never reused |
| Trust Capsule (~"VC") | **JWT signed with Ed25519** (via `jose` or `paseto` library) — short expiry (`exp` claim), single-use enforced via Redis key that's deleted on first validation |
| Device consistency check | Device fingerprint (hashed hardware/install ID) stored per episode, compared on capsule redemption |
| QR token | Signed short-lived JWT encoded into QR (via `qrcode` lib), scoped to one episode |
| Wi-Fi/GPS proximity | Client sends GPS coords + nearby Wi-Fi BSSID list (Android) or coarse location (iOS, which restricts BSSID access — plan for GPS-primary on iOS); server checks both against expected radius before issuing capsule |
| Signing keys | **Ed25519 key pair per server environment**, stored in a secrets manager (AWS KMS / GCP Secret Manager), rotated periodically |
| Selective disclosure | Server-side field-level filtering (a "public view" vs "matched view" of the same episode record) — not ZKPs; simpler, auditable, sufficient for this threat model |

> **Why not real ZKPs/DIDs at MVP:** They require either a permissioned ledger (ops overhead, no real decentralization benefit for a single-company app) or heavy client-side crypto libraries that hurt mobile performance and add UX friction (key backup/recovery becomes a support nightmare). Signed JWTs + server enforcement achieve the same trust guarantees (single-use, time-bound, tamper-evident) with far less risk of shipping broken cryptography.

### 7.6 Infrastructure & Hosting — Render

Verified against Render's current documentation (not assumed) — the mapping below uses Render's actual service types:

| Component | Render Service | Why / Verified Detail |
|---|---|---|
| API server (Fastify/Node) | **Web Service** | Git-push deploy, auto TLS on custom domains, autoscaling on paid plans. Web Services support inbound WebSocket connections natively — confirmed no enforced max connection duration (Render recommends ping/pong keepalive, since instances can still restart on deploys/maintenance) |
| Real-time chat (Socket.IO) | Same **Web Service**, or a dedicated one | Runs on the same long-lived instance model — this is exactly the persistent-connection use case Render is built for, unlike serverless platforms where WebSockets are tied to function lifecycles |
| Primary database | **Render Postgres** | Confirmed supports `CREATE EXTENSION postgis` (required for the `GEOGRAPHY`/`GIST` proximity queries in §8.1) — extension availability depends on Postgres version, so pin to a version where PostGIS is confirmed supported when provisioning |
| Redis / session store | **Render Key Value** | Redis-compatible (runs Valkey 8 on new instances — a drop-in-compatible fork, works fine with `ioredis`/`bullmq`); used for capsule single-use locks, rate limiting, Socket.IO pub/sub adapter |
| Background jobs (BullMQ workers) | **Background Worker** | Purpose-built for exactly this: continuously polling a Redis-backed queue with no HTTP interface — matches the capsule-expiry sweep and revocation-propagation jobs described in §3 |
| Scheduled purge job (data retention, §8.1) | **Cron Job** | Render cron jobs support runs up to 12 hours — comfortably enough for a nightly retention/purge task |
| Admin/audit web portal (Next.js) | **Static Site** (if exported statically) or **Web Service** (if you need SSR) | Static Site gives you Render's CDN for free; only use a Web Service here if the admin portal needs server-side rendering |
| Secrets (signing keys, DB credentials) | **Render Environment Variables (marked secret) / Secret Files** | Render doesn't offer an AWS KMS/HSM equivalent — for the Ed25519 signing key, store it as a secret environment variable or Secret File, generated once at provisioning time and rotated manually. If true hardware-backed key custody becomes a compliance requirement later, that would need an external KMS (e.g., AWS KMS) called from the Render service, not something Render itself provides |
| Logs/metrics | Render's built-in log stream + metrics dashboard, **plus Sentry** for error tracking | Render's native tooling covers basic ops visibility; Sentry is still worth adding for structured error tracking/alerting, since that's outside Render's built-in scope |
| CI | **GitHub Actions** for tests/linting before merge, Render's native Git auto-deploy for the actual deploy step | Render deploys directly from a connected GitHub repo — you don't need a separate deploy pipeline, just gate merges with CI checks |

**Practical constraints worth knowing before committing to Render:**
- **Region selection matters more than usual:** Render's regions are limited (e.g., Oregon, Ohio, Virginia, Frankfurt, Singapore). Your Web Service, Postgres, and Key Value instance should all be provisioned in the **same region** — cross-region hops add latency to every DB/Redis call, which matters here since capsule verification is latency-sensitive (users are standing there waiting for a QR scan to resolve).
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

Database choice is **backend-agnostic to how you built the frontend** — Postgres/Redis work the same whether the client is React Native, a plain web app, or a Capacitor-wrapped app. Since you've settled on **Render** for hosting (§7.6), the server-side layer below is specifically **Render Postgres** and **Render Key Value**. What *does* change because of the Capacitor approach is the **client-side local storage layer**, covered in §8.2.

### 8.1 Server-Side Database (Source of Truth)

**PostgreSQL 16 on Render Postgres** remains the right primary store: the episode → capsule → outcome flow is a strict state machine with foreign-key relationships and uniqueness constraints (a capsule must map to exactly one episode and be usable exactly once) — this is a textbook relational-integrity problem, not a document/NoSQL one. Render Postgres has confirmed support for `CREATE EXTENSION postgis`, so the geospatial approach below is provisionable as-is, not a theoretical "if your host supports it" caveat.

**Core schema (simplified):**

```sql
-- Devices, not "user accounts" — matches the minimal-identity design goal
CREATE TABLE devices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint_hash TEXT NOT NULL UNIQUE,  -- SHA-256 of device-bound secret, never raw ID
  public_key        TEXT NOT NULL,               -- Ed25519 public key, private key never leaves device
  phone_hash        TEXT,                        -- optional, hashed, only if phone verification is used
  created_at        TIMESTAMPTZ DEFAULT now(),
  last_seen_at      TIMESTAMPTZ
);

-- One row per help request
CREATE TABLE episodes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_device_id UUID NOT NULL REFERENCES devices(id),
  category          TEXT NOT NULL,               -- medical, transport, general, emergency
  urgency           SMALLINT NOT NULL,            -- 1-5
  status            TEXT NOT NULL DEFAULT 'pending', -- pending/matched/active/completed/expired/cancelled
  location          GEOGRAPHY(Point, 4326),       -- PostGIS type, see below
  radius_meters     INTEGER NOT NULL DEFAULT 500,
  created_at        TIMESTAMPTZ DEFAULT now(),
  expires_at        TIMESTAMPTZ NOT NULL
);

-- One row per issued trust capsule (episode may have multiple attempts, only one active)
CREATE TABLE capsules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id        UUID NOT NULL REFERENCES episodes(id),
  helper_device_id  UUID NOT NULL REFERENCES devices(id),
  signed_token_hash TEXT NOT NULL,                -- hash of the issued JWT, not the token itself
  status            TEXT NOT NULL DEFAULT 'issued', -- issued/redeemed/expired/revoked
  issued_at         TIMESTAMPTZ DEFAULT now(),
  expires_at        TIMESTAMPTZ NOT NULL,
  redeemed_at       TIMESTAMPTZ
);

-- Minimal outcome record — deliberately decoupled from full episode detail
CREATE TABLE outcomes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id        UUID NOT NULL REFERENCES episodes(id),
  result            TEXT NOT NULL,                -- success/failure
  category          TEXT NOT NULL,
  risk_level        SMALLINT,
  completed_in_window BOOLEAN NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Hash-chained audit log (tamper-evident, not a blockchain)
CREATE TABLE audit_log (
  id                BIGSERIAL PRIMARY KEY,
  event_type        TEXT NOT NULL,
  episode_id        UUID REFERENCES episodes(id),
  prev_hash         TEXT NOT NULL,
  entry_hash        TEXT NOT NULL,                -- SHA-256(prev_hash + event_data)
  created_at        TIMESTAMPTZ DEFAULT now()
);
```

**Key technical decisions:**
| Decision | Reasoning |
|---|---|
| `GEOGRAPHY(Point, 4326)` via **PostGIS extension** | Proximity/radius matching (helper search "within 500m") should use `ST_DWithin`, which is indexed and scales — don't compute haversine distance in application code against every row |
| Spatial index | `CREATE INDEX ON episodes USING GIST (location);` — required for PostGIS radius queries to stay fast as episode volume grows |
| No raw device IDs stored | Only hashed fingerprints — matches the "no persistent identity graph" principle from the proposal |
| Foreign keys + status enums as `TEXT` with `CHECK` constraints | Enforces the state machine at the DB level, not just in application code — reduces risk of an invalid state (e.g., a "redeemed but not issued" capsule) ever existing |
| `signed_token_hash` not the token | Even if the DB is breached, the actual bearer token (JWT) can't be extracted and replayed |

**Ephemeral/session store — Render Key Value (Redis-compatible):**
- Active capsule single-use lock: `SET capsule:{id} used NX EX {ttl}` — atomic, so two simultaneous redemption attempts can't both succeed (solves the double-spend problem for a single-use token). This works identically on Render Key Value since it's Redis-protocol-compatible (Valkey 8 under the hood on new instances)
- Rate limiting counters (per device, per IP)
- Socket.IO pub/sub adapter + BullMQ job queues (expiry sweeps, match timeouts) — run the BullMQ consumers as a Render **Background Worker**, not inside the Web Service, so a queue backlog can't starve incoming HTTP/WebSocket traffic

**Retention/purge job:**
A scheduled worker (BullMQ cron job) deletes `episodes.location` and any transient verification data once `status = completed/expired`, retaining only the `outcomes` row long-term. This operationalizes the "minimal outcome logging" principle rather than just stating it as a policy.

---

### 8.2 Client-Side Local Storage (Capacitor-Wrapped App)

This is the part that changes because of your build approach. A Capacitor app runs your web build inside a native WebView (Chromium via Android System WebView on Android). That means standard browser storage APIs are available, but **they are not equivalent to hardware-backed secure storage**, and treating them the same is a real security gap for this app specifically, since the device's signing key is a security control, not just a preference.

| Storage need | Correct choice | Why |
|---|---|---|
| UI state, draft form data, filter preferences | `localStorage` or `IndexedDB` (via a small wrapper like `idb`), or `@capacitor/preferences` | Non-sensitive, fine to lose on app reinstall |
| Cached read-only data (episode history list for offline viewing) | `IndexedDB` or `@capacitor-community/sqlite` | Structured, queryable, works offline for **read-only** display |
| Device key pair (Ed25519 private key) | `capacitor-secure-storage-plugin` (bridges Android Keystore) | **Never** localStorage/IndexedDB — WebView storage can be read if the device is rooted, if a malicious app gets file-system access, or via Chrome remote debugging if left enabled in a build |
| Device fingerprint / verification token | Same secure storage plugin | It's presented during capsule redemption — if it leaks, an attacker can impersonate the device in the verification handshake |

**Why this matters concretely for Connify:** the "device consistency check" in the Threat Model (§4) is only meaningful if the key it relies on can't be trivially copied off the device. If that key sits in `localStorage`, it's just a file inside the app's WebView data directory — extractable with basic tooling on a rooted device. Keystore-backed storage requires actual hardware-level compromise to extract, which is the security guarantee the architecture is claiming to provide.

**No offline path for capsule issuance/redemption — by design, not limitation:**
Single-use enforcement (§8.1, Redis `SET NX`) requires a server round-trip as the single source of truth. If capsule validation were done client-side against locally cached state, two devices could each independently "validate" the same capsule while both offline, and both proceed — a classic double-spend problem. So: cache read-only data offline freely; never let the verification/capsule flow degrade to an offline mode.

---

### 8.3 Capacitor + Android Studio Build Pipeline — Practical Notes

Since you're going web-first then wrapping:

1. **Build order:** `npm run build` (web build output, e.g. `dist/`) → `npx cap sync android` (copies web assets into the native project + updates Capacitor plugin native dependencies) → open in Android Studio → build/sign APK/AAB.
2. **Re-run `cap sync` after every plugin install/update** — a common failure mode is editing native Android files directly without re-syncing, causing drift between the web config and native project.
3. **Firebase setup for push:** `google-services.json` must be placed in `android/app/` manually — this isn't handled by `cap sync` and is the most commonly missed step.
4. **Permissions:** Camera (QR scanning) and Geolocation require both the Capacitor plugin *and* the corresponding `<uses-permission>` entries in `AndroidManifest.xml` — most community plugins auto-merge these via their own manifest, but always verify after `cap sync`, especially after major plugin version bumps.
5. **Background WebSocket behavior:** Android aggressively suspends WebView JS execution when the app is backgrounded (Doze mode/battery optimization). A live Socket.IO connection for the ephemeral chat **will drop** when the user backgrounds the app — don't rely on it as the sole notification path. Use `@capacitor/push-notifications` (FCM) as the wake/alert mechanism, and have the app re-establish the socket connection on resume (`App.addListener('resume', ...)` from `@capacitor/app`).
6. **WebView version dependency:** Since QR scanning and camera access route through Capacitor plugins (not raw `getUserMedia`), you're less exposed to WebView version fragmentation than a pure-PWA approach would be — but still test on a low-end/older Android WebView version, since `@capacitor/camera`'s underlying behavior can vary slightly across Android API levels.

---

*This document synthesizes the Connify proposal architecture with zero-trust identity patterns (episode-as-identity, capsule-as-credential, JIT issuance, selective disclosure) adapted for a consumer safety context rather than a multi-agent AI system, and reflects a mobile-first web app wrapped via Capacitor for Android deployment.*

---

## Tech Stack

### Frontend
- React (Vite) or Next.js
- Tailwind CSS
- Zustand

### Mobile and Native Layer
- Capacitor CLI with Android support
- Capacitor barcode scanner/camera
- Capacitor Geolocation
- Capacitor Push Notifications

### Backend and APIs
- Node.js with Fastify and TypeScript
- OpenAPI 3 and Zod
- Socket.IO client/server
- BullMQ

### Data and Storage
- PostgreSQL with PostGIS
- Redis-compatible Key Value store
- pgcrypto encryption

### Security and Infrastructure
- JWT signed with Ed25519
- Rate limiting, TLS, and secure storage for device keys
- Render Web Service, Render Postgres, Render Key Value, Background Worker, and Cron Job

---