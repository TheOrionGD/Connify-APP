# 2. Asset Inventory

This catalog lists all design assets, media files, and reference documentation stored within the repository workspace.

## 2.1 UI Mockups & Visual Screenshots

Each of the 27 folders under [App UI](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/) contains a `screen.png` showing the target interface.

| Screen Folder | Screen Visual Asset Path | Description / Client Target |
|---|---|---|
| `connify_splash_screen_mobile` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/connify_splash_screen_mobile/screen.png) | Mobile app start-up splash. |
| `welcome_to_connify` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/welcome_to_connify/screen.png) | Mobile Onboarding & Permissions screen — **now includes Anonymous Auth initialization via Firebase**. |
| `connify_mobile_home` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/connify_mobile_home/screen.png) | Mobile start profile/welcome presentation — **profile upgrade CTA added for Guardian registration**. |
| `dashboard` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/dashboard/screen.png) | Mobile main operations dashboard. |
| `new_help_request` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/new_help_request/screen.png) | Mobile emergency category & urgency setup — **blocked if no guardian registered**. |
| `verify_identity` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/verify_identity/screen.png) | Mobile QR token generation & status checks. |
| `searching_for_help` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/searching_for_help/screen.png) | Mobile waiting page with radial indicators — **GPS watchdog active during this state**. |
| `accept_verify` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/accept_verify/screen.png) | Mobile accept task, maps, and arrival panel. |
| `accept_verify_handshake` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/accept_verify_handshake/screen.png) | Mobile proximity and authentication indicators — **Responder Panic Abort trigger available**. |
| `active_episode_you` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/active_episode_you/screen.png) | Mobile active emergency dashboard (Requester) — **5s GPS ping active; Guardian SMS watchdog running**. |
| `active_episode_helper` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/active_episode_helper/screen.png) | Mobile active emergency dashboard (Helper). |
| `protocol_feedback` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/protocol_feedback/screen.png) | Mobile quick post-episode evaluation — **SAFE_RESOLVED / SUSPICIOUS_BEHAVIOR / ACTIVE_THREAT outcome results**. |
| `episode_history` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/episode_history/screen.png) | Mobile previous safe sessions logs list. |
| `settings_governance` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/settings_governance/screen.png) | Mobile options panel for security/data controls — **Guardian management section added**. |
| `emergency_mode` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/emergency_mode/screen.png) | Mobile SOS overrides panel. |
| `connify_splash_screen_desktop` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/connify_splash_screen_desktop/screen.png) | Web landing starting state screen. |
| `refined_splash_screen_desktop` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/refined_splash_screen_desktop/screen.png) | Web landing alternative starting screen. |
| `connify_mobile_web` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/connify_mobile_web/screen.png) | Web portal main view. |
| `connify_safety_coordination_protocol` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/connify_safety_coordination_protocol/screen.png) | Web protocol introduction. |
| `connify_trusted_safety_coordination` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/connify_trusted_safety_coordination/screen.png) | Web portal landing page details. |
| `connify_trustworthy_safety_protocol` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/connify_trustworthy_safety_protocol/screen.png) | Web onboarding information view. |
| `features_governance_connify_safety` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/features_governance_connify_safety/screen.png) | Web layout features overview. |
| `how_it_works_connify_protocol` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/how_it_works_connify_protocol/screen.png) | Web documentation/infographic view. |
| `privacy_governance_connify` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/privacy_governance_connify/screen.png) | Web privacy center and controls explainer. |
| `protocol_features_connify_safety` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/protocol_features_connify_safety/screen.png) | Web security features sheet. |
| `nearby_requests` | [screen.png](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/nearby_requests/screen.png) | Mobile feed of incoming, nearby anonymized issues. |
| `safety_core` | *(None)* | Safety core features placeholder directory. |

---

## 2.2 System & Design Images

* **Color Palette Spec**: [Color Pallete.png](file:///o:/PROJECTS/CONNIFY-APP/Color%20Pallete.png) (314 KB)
* **Architecture Diagram**: [architecture_diagram_1783676807991.png](file:///o:/PROJECTS/CONNIFY-APP/architecture_diagram_1783676807991.png) (585 KB)
* **General Interface graphic**: [image.png](file:///o:/PROJECTS/CONNIFY-APP/image.png) (94 KB)

---

## 2.3 Reference Documentation Files

These files contain the academic, mathematical, and architectural background context for the SHARP protocol:

* **SHARP Cryptography Protocol Paper**: [978-3-642-33167-1_21.pdf](file:///o:/PROJECTS/CONNIFY-APP/978-3-642-33167-1_21.pdf) (2.32 MB) — Detail on Bloom filters, fuzzy extractors, and syndrome calculations.
* **Connify Academic Paper Draft (PDF)**: [Connify_IEEE_Journal_Paper.pdf](file:///o:/PROJECTS/CONNIFY-APP/Connify_IEEE_Journal_Paper.pdf) (210 KB)
* **Connify Academic Paper Draft (DOCX)**: [Connify_IEEE_Journal_Paper.docx](file:///o:/PROJECTS/CONNIFY-APP/Connify_IEEE_Journal_Paper.docx) (359 KB)
* **Connify Batch Write-up Document**: [Batch.6 writeup.docx](file:///o:/PROJECTS/CONNIFY-APP/Batch.6%20writeup.docx) (62 KB)

---

## 2.4 Backend Source Assets (v2.0 — New Safety Systems)

| File | Path | Purpose |
|---|---|---|
| `BehavioralRiskEngine.ts` | `backend/src/services/BehavioralRiskEngine.ts` | 5-Pillar harmlessness scoring, trap velocity detection, mandatory guardian assertion |
| `LocationWatchdogService.ts` | `backend/src/services/LocationWatchdogService.ts` | 5s atomic GPS pings, 15s signal loss watchdog, personalized Guardian SMS alerts, unbounded signal recovery |
| `ProfileController.ts` | `backend/src/controllers/ProfileController.ts` | Anonymous-to-Registered profile migration, Firebase UID binding, mandatory guardian enforcement |
| `Guardian.ts` | `backend/src/models/Guardian.ts` | Guardian model: `userFullName`, `fullName`, `phone`, `relationship` |
| `DeviceLocation.ts` | `backend/src/models/DeviceLocation.ts` | Atomic GPS record model: `latitude`, `longitude`, `lastPingAt`, `signalLostAlertSent`, `retryCount` |
| `LocationController.ts` | `backend/src/controllers/LocationController.ts` | Handlers for `POST /api/locations/ping`, `/guardians`, `/watchdog/scan` |

---

## 2.5 Integration Test Suites (v2.0)

| Test Suite | Path | Status |
|---|---|---|
| `adminAuth.test.ts` | `backend/tests/` | ✅ PASSED |
| `allEndpoints.test.ts` | `backend/tests/` | ✅ PASSED |
| `CapsuleController.test.ts` | `backend/tests/` | ✅ PASSED |
| `deviceChallenge.test.ts` | `backend/tests/` | ✅ PASSED |
| `deviceRegistration.test.ts` | `backend/tests/` | ✅ PASSED |
| `e2eJourney.test.ts` | `backend/tests/` | ✅ PASSED |
| `harmlessnessSystem.test.ts` | `backend/tests/` | ✅ PASSED |
| `locationWatchdog.test.ts` | `backend/tests/` | ✅ PASSED |
| `profileMigration.test.ts` | `backend/tests/` | ✅ PASSED |
| `symmetricVerificationPipeline.test.ts` | `backend/tests/` | ✅ PASSED |
| **Total** | | **✅ 100%** |
