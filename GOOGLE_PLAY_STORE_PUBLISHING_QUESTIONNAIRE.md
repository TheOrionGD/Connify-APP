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

**App Category in IARC:** Social / Communication / Peer-to-Peer Networking Tool

| Question | Answer | Rationale & Codebase Context |
| :--- | :--- | :--- |
| **Does the app contain violent material?** | **No** | No violent content or media embedded. |
| **Does the app contain explicit / sexual material?** | **No** | Clean social networking application. |
| **Does the app contain offensive language or profanity?** | **No** | All app string bundles contain professional UI text. |
| **References to controlled substances / drugs / alcohol?** | **No** | None. |
| **Can users interact or exchange content with other users?** | **Yes** | Peer-to-Peer connection requests transmit social messages, status updates, and mutual QR handshake tokens to verified nearby strangers/peers. |
| **Does the app share the user's physical location with other users?** | **Yes** | **Explicit Context:** User's blinded/approximate spatial grid location is shared to allow nearby verified peer discovery and connection requests. Precise location is exchanged only during mutual QR code handshakes. |
| **Does the app allow users to purchase digital goods?** | **No** | Free utility app; no digital purchases or paid subscriptions. |
| **Does the app include an unrestricted web browser?** | **No** | Contains no embedded open web browsers. |

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

### A. General Questions
- **Does your app collect or share any of the required user data types?** -> **Yes**
- **Is all of the user data collected by your app encrypted in transit?** -> **Yes** (TLS 1.3 / HTTPS / Secure WebSockets `wss://`).
- **Do you provide a way for users to request that their data be deleted?** -> **Yes** (In-app wipe + Web account deletion form).

---

### B. Detailed Data Category Breakdown

| Data Category | Data Type | Collected? | Shared? | Required / Optional | Purpose | Encryption & Handling |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Location** | **Precise Location** (`ACCESS_FINE_LOCATION`) | **Yes** | **Yes** *(Shared during mutual QR handshake verification)* | Required | **App Functionality, P2P Connection** (Spatial proximity calculation, QR verification) | Encrypted in transit; active only during active connection sessions. |
| **Location** | **Approximate Location** (`ACCESS_COARSE_LOCATION`) | **Yes** | **Yes** | Required | **App Functionality, Regional Spatial Grids** | Blinded grid tokens allow discovering nearby verified strangers without revealing exact GPS coordinates. |
| **Personal Info** | **Name** | **Yes** | **Yes** *(To peers upon connection request)* | Required | **Account Management, App Functionality** | Used to identify profile to verified connection peers. |
| **Personal Info** | **Email Address** | **Yes** | **No** | Required | **Account Management, Authentication** | Collected via Google OAuth / Firebase Auth. |
| **Personal Info** | **Phone Number** | **Yes** | **Yes** *(Sent via direct SMS when connecting offline)* | Required | **App Functionality** (SMS connection fallback) | User phone and configured contact numbers. |
| **Messages** | **SMS Messages** | **Yes** | **Yes** *(Direct SMS to contacts)* | Required for offline connection requests | **App Functionality** (Carrier SMS fallback) | App dispatches offline connection requests directly via user's SMS service. |
| **App Activity** | **App Interactions & Telemetry** | **Yes** | **No** | Required | **Analytics, App Performance, Security** | Latency, device model, ping telemetry used to verify peer node connectivity. |
| **Device IDs** | **Device Identifiers & Crypto Keys** | **Yes** | **Yes** *(Ed25519 Public Key shared with network)* | Required | **Security, Fraud Prevention, Authentication** | Ed25519 public key & device hash used for signature verification to ensure authentic peer connections. |

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
- [x] Configured P2P Social Connection & Verified Stranger positioning.
- [x] Prepared reviewer test credentials (`playconsole.tester@connify.app`).
- [x] Answered all 14 Play Console Policy & Data Safety questionnaires as documented above.
