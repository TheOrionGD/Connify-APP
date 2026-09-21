# 🚀 Connify v4.3.1 - Official Production Release

We are excited to announce **Connify v4.3.1** (`versionCode 25`), introducing VoIP audio call service integration, enhanced real-time socket signaling for emergency coordination, redesigned onboarding experience, Leaflet map tracking improvements, and full Google Play policy compliance for target SDK 36 (Android 15+).

---

### 📦 Release Highlights & Key Updates

#### 1. 📞 Integrated VoIP & Emergency Audio Service
- **VoIP Audio Call Engine:** Real-time audio streaming and emergency call handling during active safety episodes (`voipAudioService.ts`).
- **Enhanced Emergency Call Modal:** Dynamic call controls, mute, speakerphone, and direct responder voice connection.
- **Fake Call De-escalation Screen:** Updated UI and audio triggers for discreet emergency extraction.

#### 2. ⚡ Real-Time Socket Signaling & Episode Management
- **Socket Service:** Low-latency WebSocket signaling for live emergency tracking, responder dispatch, and state synchronization (`socketService.ts`).
- **Category Context Engine:** Intelligent assistance category presets and dynamic contextual prompt generation for requesters (`categoryContexts.ts`).
- **Nearby Requests & Dispatch:** Real-time responder radius filtering and interactive request pickup workflow.

#### 3. 🗺️ Map & Location Enhancements
- **Leaflet Map View:** Improved live GPS marker rendering, smooth map pan animations, and emergency location sharing (`LeafletMapView.tsx`).
- **Mutual Proximity Verification:** Cryptographic Ed25519 & QR code handshakes for secure requester-helper meetings.

#### 4. 📱 App Version & Build Alignment
- **Version Name:** `4.3.1`
- **Version Code:** `25`
- Fully synchronized across Mobile Client, Backend Services, and Web Landing Page.

#### 5. 🛡️ Google Play Policy & Security Compliance
- **Target SDK 36 (Android 15+):** Native Hermes engine optimization and edge-to-edge UI support.
- **Child Safety Policy & CSAM Prevention:** Compliance with Google Play Developer Policy with dedicated in-app reporting mechanism.
- **Permissions Declaration:** Fully aligned SMS and location permissions for offline SOS dispatch.

---

### 📥 Release Downloads

| File Name | File Type | Size | Description |
| :--- | :--- | :--- | :--- |
| `app-release.apk` | Android Application Package | 142.5 MB | Direct Android APK installation file |
| `app-release.aab` | Android App Bundle | 89.9 MB | Google Play Store production publishing bundle |

---

### 🔒 Verification & Security Hashes

#### SHA-256 Checksums
- **`app-release.apk`:** `36A9C1FC32CE448F0D2E09497C2904CA2E875368F1B6578C516756097593E589`
- **`app-release.aab`:** `6065D064C2B29E14E259787CAA2C6EF9A0D56EFD91976ACE326F2ACFE231BE39`

#### Keystore Credentials
- **Alias:** `connify-key`
- **Signature Algorithm:** 2048-bit RSA PKCS12
