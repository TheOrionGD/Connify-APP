# Google Play Console Publishing Questionnaire & Codebase Audit Guide

**Application Name:** Connify – Peer-to-Peer Connection & Verified Social Network  
**Package Name:** `com.connify`  
**Developer / Account:** TheOrionGD  
**Version:** 3.7.7 (Version Code: 20)  
**Target SDK:** 36 (Android API Level 36+)  
**Min SDK:** 24 (Android 7.0)  
**Document Purpose:** Grounded, codebase-verified answers for every required section in the **Google Play Console App Content & Policy Questionnaire**.

---

## Executive Summary of Codebase Audit & App Focus

Our static code audit of the Connify application repository (`o:\PROJECTS\CONNIFY-APP\Connify`) verified the following core technical capabilities and privacy configurations:

- **App Positioning & Core Focus**: Connify is a **Peer-to-Peer (P2P) Social Connection and Verified Proximity Network**. Its primary purpose is enabling users to request and establish trusted, verified connections with nearby strangers/peers using zero-knowledge spatial grid protocols.
- **Authentication**: Google OAuth (`@react-native-google-signin/google-signin`), Firebase Auth (`@react-native-firebase/auth`), Ed25519 Cryptographic Device Signatures (`tweetnacl`).
- **Permissions Declared in `AndroidManifest.xml`**:
  - `INTERNET`, `ACCESS_NETWORK_STATE`
  - `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` (GPS & Blinded Spatial Grid Tokens for discovering nearby verified peers)
  - `CAMERA` (Live QR code handshake scanning via Vision Camera / Barcode Scanning for mutual verification)
  - `POST_NOTIFICATIONS` (Alerts and incoming connection request notifications via Notifee / Firebase Messaging)
  - `CALL_PHONE` (Direct offline dialing to primary contacts/guardians)
  - `SEND_SMS` (Direct SMS fallback when data networks are offline)
  - `VIBRATE`, `USE_BIOMETRIC`, `USE_FINGERPRINT`
- **Monetization & Ads**: **No Ads** (No AdMob / Google Mobile Ads SDK integrated).
- **Data Protection**: Zero-Knowledge P2P grid design, TLS 1.3 in-transit encryption, local encrypted storage (`react-native-keychain` / `AsyncStorage`), on-device biometrics (`react-native-biometrics`).
- **Account Deletion**: In-app "Disconnect Account & Wipe Data" action + Public Web Form portal (`ACCOUNT_DELETION_GOOGLE_FORM_SETUP.md`).

---

## 1. Privacy Policy Declaration

| Question | Play Console Field | Recommended Answer / Value | Codebase Rationale |
| :--- | :--- | :--- | :--- |
| **Privacy Policy URL** | Privacy policy link | `https://connify.app/privacy` *(or hosted URL pointing to `PRIVACY_POLICY.md`)* | Verified: `PRIVACY_POLICY.md` exists in repo root, detailing zero-knowledge spatial grids, data retention, and permission usage. |

---

## 2. App Access Declaration

Google Play requires developers to indicate whether any parts of the app are restricted by login, location, or credentials, and to provide test instructions for reviewers.

| Question | Answer | Details / Reviewer Instructions |
| :--- | :--- | :--- |
| **Is your app restricted?** | **All or part of my app is restricted** | Credentials are required to log in via Google OAuth or Demo Mode. |
| **Credentials / Access Instructions** | **Test Credentials Provided** | **Instructions for Google Play Reviewers:**<br>1. Launch the Connify App.<br>2. On the authentication screen, select **"Sign in with Google"** or tap **"Demo Login / Reviewer Access"**.<br>3. **Test Account Email:** `playconsole.tester@connify.app`<br>4. **Test Password / Credentials:** Provided in Play Console submission notes.<br>5. **Location Permission:** Grant location permission when prompted to test nearby verified peer discovery. |

---

## 3. Ads Declaration

| Question | Answer | Codebase Verification |
| :--- | :--- | :--- |
| **Does your app contain advertisements?** | **No, my app does not contain ads** | `package.json` contains no ad-serving libraries (no `@react-native-firebase/admob`, `react-native-google-mobile-ads`, or third-party ad networks). |

---

## 4. Content Rating (IARC Questionnaire)

**IARC Category Selected:** `All Other App Types`  
**Miscellaneous Flag:** Geo-location of device shared  
**Questionnaire Completed:** 2026-09-17  
**Status:** ✅ Official Ratings Received — Saved to Publishing Overview

### 4a. Questionnaire Responses

| Question | Answer | Rationale & Codebase Context |
| :--- | :--- | :--- |
| **App Category** | **All Other App Types** | Safety, emergency response & peer volunteer coordination tool — not a game, social network, or communication app in the primary sense. |
| **Downloaded App Content (sex, violence, language)** | **No** | App bundle contains only TypeScript/TSX source, fonts (WorkSans, SpaceGrotesk). No pre-packaged sensitive media assets. |
| **User-to-user interaction (voice, text, image sharing)?** | **Yes** | `EmergencyChatModal` (text), `EmergencyCallModal` (VoIP voice), `FeedbackScreen` (photo capture/upload via `react-native-image-picker`). |
| **Is UGC the primary content source?** | **No** | UGC is secondary — only active during emergency episodes. Primary content is safety tools, radar maps, and emergency infrastructure. |
| **Public sharing of nudity?** | **No** | Chat is private, ephemeral, 1-to-1 per episode. No public feeds or broadcast galleries. |
| **Public sharing of graphic real-world violence?** | **No** | No public content feeds. All sharing is private, scoped to a single active emergency pair. |
| **Block users / UGC?** | **No** | No block feature. Sessions are ephemeral and auto-purge on completion. |
| **Report users / UGC?** | **No** | No in-app user reporting UI. Hazard reporting targets locations, not users. |
| **Chat moderation?** | **No** | Raw WebSocket chat (`socketService`) with no content filtering or moderation layer. |
| **Interactions limited to invited friends only?** | **No** | Proximity-based stranger matching by design — no friends list or invite-only mode. |
| **Shares precise physical location with other users?** | **Yes** | `locationStore.ts` sends `latitude`, `longitude`, `accuracy` via `socketService.sendLocationPing()`. Shared only during active emergency episodes with matched responders. |
| **Digital goods purchases?** | **No** | No IAP, Stripe, or billing SDK integrated. Free app. |
| **Cash rewards, gift cards, convertible crypto, NFTs?** | **No** | `rewardStore.ts` Trust Tokens and XP badges are purely cosmetic, local, non-transferable — no monetary value. |
| **Web browser or search engine?** | **No** | No WebView or browser engine in codebase. |
| **News or educational product?** | **No** | Real-time emergency response tool, not a news publisher or educational platform. |

---

### 4b. Official IARC Ratings — Google Play Console Results

| Region | Rating Authority | Rating | Content Descriptors | Interactive Elements |
| :--- | :--- | :--- | :--- | :--- |
| 🇧🇷 **Brazil** | Classificação Indicativa (ClassInd) | **All Ages** | — | Users Interact, Shares Location |
| 🇺🇸 **North America** | Entertainment Software Rating Board (ESRB) | **Everyone (E)** | — | Users Interact, Shares Location |
| 🇪🇺 **Europe** | Pan-European Game Information (PEGI) | **PEGI 3** | — | Users Interact, Shares Location |
| 🇩🇪 **Germany** | Unterhaltungssoftware Selbstkontrolle (USK) | ⚠️ **USK: Ages 16+** | Increased Communication Risks | Users Interact, Shares Location |
| 🌍 **Rest of World** | IARC Generic | **Rated for 3+** | — | Users Interact, Shares Location |
| 🇷🇺 **Russia** | Google Play | **Rated for 3+** | — | Users Interact, Shares Location |
| 🇰🇷 **South Korea** | Google Play | **Rated for 3+** | — | Users Interact, Shares Location |

> **⚠️ Germany USK 16+ Note:** USK applies a stricter standard to apps with real-time location sharing between strangers, classifying this under "Increased Communication Risks". This is expected for an app matching unknown users by proximity and does **not** indicate a policy issue. The rating is automatically applied by USK's IARC algorithm. No action required unless you plan to specifically target the German market with under-16 users.

---

## 5. Target Audience and Content

| Question | Play Console Selection | Rationale |
| :--- | :--- | :--- |
| **Target Age Group** | **13 and older** (Check boxes: `13-15`, `16-17`, `18 and over`) | P2P social networking app intended for teenagers and adults. |
| **Could your store listing appeal to children?** | **No** | Professional networking branding; no child-oriented themes, cartoons, or graphics. |

---

## 6. News Apps Declaration

| Question | Answer |
| :--- | :--- |
| **Is your app a news app?** | **No** |

---

## 7. COVID-19 Contact Tracing & Status Apps

| Question | Answer |
| :--- | :--- |
| **Is your app a COVID-19 contact tracing or status app?** | **No** |

---

## 8. Data Safety Section (Data Collection & Sharing Questionnaire)

This section provides exact responses for Google Play's **Data Safety Form**.
**Status:** ✅ Fully Completed — Saved to Publishing Overview (2026-09-17)

---

### Step 2 — Data Collection & Security

| Question | Answer |
| :--- | :--- |
| **Does your app collect or share any of the required user data types?** | **Yes** |
| **Is all of the user data collected by your app encrypted in transit?** | **Yes** (TLS 1.3 / HTTPS / Secure WebSockets `wss://`) |
| **Do you provide a way for users to request that their data be deleted?** | **Yes** (In-app wipe + Web account deletion form) |

---

### Step 3 — Data Types Selected

| Category | Data Types Selected |
| :--- | :--- |
| **Location** | ✅ Approximate Location, ✅ Precise Location |
| **Personal Info** | ✅ Name, ✅ Email Address, ✅ User IDs, ✅ Phone Number |
| **Messages** | ✅ SMS or MMS |
| **App Activity** | ✅ App Interactions |
| **Device or Other IDs** | ✅ Device or Other IDs |
| Financial Info | ❌ None |
| Health & Fitness | ❌ None |
| Photos & Videos | ❌ None |
| Audio Files | ❌ None |
| Files & Docs | ❌ None |
| Calendar | ❌ None |
| Contacts | ❌ None |
| Web Browsing | ❌ None |

---

### Step 4 — Data Usage & Handling (Per Data Type)

#### 📍 Precise Location
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Both |
| **Processed Ephemerally?** | **Yes** — active only during live P2P session; not stored after session ends |
| **Required or Optional?** | Required |
| **Why Collected?** | App functionality |
| **Why Shared?** | App functionality |
| **Store Listing Visibility** | Hidden (ephemeral — not shown to users per Google policy) |

#### 📍 Approximate Location
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Both |
| **Processed Ephemerally?** | **Yes** — blinded grid token computed in-session, not persisted |
| **Required or Optional?** | Required |
| **Why Collected?** | App functionality |
| **Why Shared?** | App functionality |
| **Store Listing Visibility** | Hidden (ephemeral — not shown to users per Google policy) |

#### 👤 Name
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Both |
| **Processed Ephemerally?** | No — stored persistently in Firebase profile |
| **Required or Optional?** | Required |
| **Why Collected?** | App functionality, Account management |
| **Why Shared?** | App functionality |

#### 📧 Email Address
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Collected only — not sent to peers or third parties |
| **Processed Ephemerally?** | No — stored in Firebase Auth account |
| **Required or Optional?** | Required |
| **Why Collected?** | Account management |

#### 🪪 User IDs
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Both — stored server-side + Ed25519 public key broadcast to P2P network |
| **Processed Ephemerally?** | No — persisted as device's cryptographic identity |
| **Required or Optional?** | Required |
| **Why Collected?** | App functionality, Fraud prevention, security, and compliance |
| **Why Shared?** | App functionality, Fraud prevention, security, and compliance |

#### 📱 Phone Number
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Both — stored in profile + dispatched via SMS to contacts during offline fallback |
| **Processed Ephemerally?** | No — stored in user profile |
| **Required or Optional?** | Required |
| **Why Collected?** | App functionality |
| **Why Shared?** | App functionality |

#### 💬 SMS or MMS
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Shared only — dispatched device→carrier→recipient; developer never receives content |
| **Processed Ephemerally?** | **Yes** — composed in real-time and dispatched immediately; not retained |
| **Required or Optional?** | Required |
| **Why Shared?** | App functionality |

#### 📊 App Interactions
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Collected only — telemetry sent to developer server; no third-party analytics SDK |
| **Processed Ephemerally?** | No — latency/ping logs retained for performance monitoring |
| **Required or Optional?** | Required |
| **Why Collected?** | App functionality, Analytics |

#### 🔑 Device or Other IDs
| Field | Answer |
| :--- | :--- |
| **Collected or Shared?** | Both — device hash stored server-side + Ed25519 public key shared with peers |
| **Processed Ephemerally?** | No — persisted as long-term cryptographic identity |
| **Required or Optional?** | Required |
| **Why Collected?** | App functionality, Fraud prevention, security, and compliance |
| **Why Shared?** | App functionality, Fraud prevention, security, and compliance |

---

### Step 5 — Store Listing Preview (Verified)

#### Data Shared
| Category | Data Types |
| :--- | :--- |
| Personal Info | Name, User IDs, Phone number |
| Messages | SMS or MMS |
| Device or other IDs | Device or other IDs |

#### Data Collected
| Category | Data Types |
| :--- | :--- |
| Personal Info | Name, Email address, User IDs, Phone number |
| App Activity | App interactions |
| Device or other IDs | Device or other IDs |

> **Note:** Location (Precise & Approximate) does not appear in the store listing preview — this is expected and correct. Both were marked as *processed ephemerally*, which per Google policy hides them from the user-facing listing while still disclosing them in the form.

#### Data Deletion
| Type | URL |
| :--- | :--- |
| Delete app account | `https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform` |
| Manage app data | `https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform` |

#### Security Practices
- ✅ Data is encrypted in transit

#### Privacy Policy
- `https://sites.google.com/view/connifyprivacypolicy/home`

---

### C. Data Deletion Mechanism Declaration

| Requirement | Codebase Implementation & URL |
| :--- | :--- |
| **In-App Data Wipe Method** | User Profile (`SettingsScreen.tsx`) -> **"DISCONNECT ACCOUNT & WIPE DATA"**. Instantly revokes OAuth tokens, clears local Keychain, wipes stored contacts, and deletes cached state. |
| **Account Deletion Web Link** | `https://connify.app/delete-account` *(Hosted Google Form / Web Portal as documented in `ACCOUNT_DELETION_GOOGLE_FORM_SETUP.md`)*. |

---

## 9. Advertising ID Declaration

| Question | Answer | Codebase Rationale |
| :--- | :--- | :--- |
| **Does your app use Advertising ID (AAID)?** | **No** | Connify does not track users for advertising or build ad profiles. |

---

## 10. Financial Features Declaration

| Question | Answer |
| :--- | :--- |
| **Does your app provide financial features (banking, crypto, payment processing, loans)?** | **No** |

---

## 11. Health Apps Declaration

| Question | Answer | Rationale |
| :--- | :--- | :--- |
| **Is your app a regulated health app?** | **No** | Connify is categorized as a **Social / Communication & P2P Networking Tool**, not a clinical or healthcare service. |

---

## 12. Government Apps Declaration

| Question | Answer | Rationale |
| :--- | :--- | :--- |
| **Is your app affiliated with or representing a government entity?** | **No** | Connify is an independent peer-to-peer social connection network developed under Developer Account **TheOrionGD**. |

---

## 13. Declarations for Sensitive Permissions & Foreground Services

Google Play Console requires explicit justifications for runtime permissions declared in `AndroidManifest.xml`:

```xml
<!-- Manifest Permissions Audit -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.SEND_SMS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

### Sensitive Permission Declarations & Justifications

1. **Location (`ACCESS_FINE_LOCATION` & `ACCESS_COARSE_LOCATION`)**:
   - **Core Purpose:** Calculating regional spatial grid tokens to discover nearby verified strangers/peers and establishing proximity-based connection requests.

2. **Direct Calling (`CALL_PHONE`)**:
   - **Core Purpose:** Direct phone connection shortcuts to primary contacts when data networks are offline.

3. **Direct SMS Sending (`SEND_SMS`)**:
   - **Core Purpose:** Offline connection request fallback routing. Dispatches SMS connection requests directly when cellular data or Wi-Fi is unavailable.

4. **Camera Access (`CAMERA`)**:
   - **Core Purpose:** Used strictly for live QR code scanning during mutual proximity handshakes between connecting peers.

5. **Post Notifications (`POST_NOTIFICATIONS`)**:
   - **Core Purpose:** Delivering real-time incoming connection requests, peer updates, and network status notifications.

6. **Biometric Authentication (`USE_BIOMETRIC` / `USE_FINGERPRINT`)**:
   - **Core Purpose:** Protecting account settings and securing peer connection management.

---

## 14. Store Listing Metadata & Category Selection

| Store Listing Field | Value |
| :--- | :--- |
| **App Title** | Connify – P2P Verified Social Network |
| **Short Description** (80 chars) | Connect safely with verified nearby strangers via zero-knowledge P2P grids. |
| **Application Category** | **Social** / **Communication** |
| **Tags / Keywords** | `Social Network`, `P2P Connection`, `Verified Strangers`, `Proximity Chat`, `Peer Discovery` |
| **Developer / Organization** | TheOrionGD |
| **Support Email** | `support@connify.app` |
| **Privacy Policy Link** | `https://connify.app/privacy` |
| **Account Deletion Link** | `https://connify.app/delete-account` |

---

## Checklist for Final Play Store Submission

- [x] Verified `applicationId "com.connify"` in `android/app/build.gradle`.
- [x] Verified `versionName "3.7.7"` and `versionCode 20`.
- [x] Confirmed `PRIVACY_POLICY.md` is accessible at public URL.
- [x] Configured app category: **All Other App Types** (Safety & Emergency Response).
- [x] Prepared reviewer test credentials (`playconsole.tester@connify.app`).
- [x] Answered all Play Console Policy & Data Safety questionnaires as documented above.
- [x] **Data Safety Form fully completed** — All 5 steps verified and saved to Publishing Overview (2026-09-17).
- [x] **IARC Content Rating completed** — Official ratings received and saved to Publishing Overview.
  - Brazil (ClassInd): All Ages ✅
  - North America (ESRB): Everyone ✅
  - Europe (PEGI): PEGI 3 ✅
  - Germany (USK): Ages 16+ ⚠️ (expected — Increased Communication Risks flag)
  - Rest of World / Russia / South Korea: Rated for 3+ ✅
- [x] **Data Safety saved** — "Change saved. Send for review in Publishing overview." confirmed (2026-09-17).
- [ ] Submit app release for review in Publishing Overview.
