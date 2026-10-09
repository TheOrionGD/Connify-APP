# 🚀 Connify v4.8.6 - Official Production Release

We are excited to announce **Connify v4.8.6**, introducing VoIP audio call service integration, enhanced real-time socket signaling for peer connection coordination, redesigned onboarding experience, Leaflet map tracking improvements, and full Google Play policy compliance for target SDK 36 (Android 15+).

---

### 📦 Release Highlights & Key Updates

#### 1. 📞 Integrated VoIP & Peer Audio Service
- **VoIP Audio Call Engine:** Real-time audio streaming and peer call handling during active connection episodes (`voipAudioService.ts`).
- **Enhanced Peer Call Modal:** Dynamic call controls, mute, speakerphone, and direct responder voice connection.
- **Fake Call De-escalation Screen:** Updated UI and audio triggers for discreet extraction.

#### 2. ⚡ Real-Time Socket Signaling & Episode Management
- **Socket Service:** Low-latency WebSocket signaling for live peer tracking, responder dispatch, and state synchronization (`socketService.ts`).
- **Category Context Engine:** Intelligent assistance category presets and dynamic contextual prompt generation for requesters (`categoryContexts.ts`).
- **Nearby Requests & Dispatch:** Real-time responder radius filtering and interactive request pickup workflow.

#### 3. 🔑 Custom Zero-Knowledge Algorithm: The SHARP Protocol Engine
- **Custom-Invented Cryptographic Engine:** Integration of the proprietary **SHARP Protocol** (*Selective Hashing & Blinded Proximity Protocol*), fully specified and documented in `sharp_protocol_spec.md` and `custom_invented_algorithm_code.txt`.
- **Mathematical & Execution Pipeline:**
  1. **Spatial Quantization & Grid Expansion:** Truncates raw GPS coordinates $(lat, lng)$ to 3 decimal places to construct a standardized base cell, expanding into a 3x3 contiguous grid neighborhood (9 cells).
  2. **1024-Bit Bloom Filter Vectorization:** Hashes each cell 4 times using salt multipliers and `FNV-1a` 32-bit hashing, mapping spatial data onto a 1024-bit bit-array.
  3. **Galois Field $GF(2^4)$ Partitioning:** Linearly segments the 1024-bit Bloom vector into 146 discrete 7-bit spatial message blocks ($m_7$).
  4. **$\text{BCH}(15,7)$ Syndrome Generation:** Encodes each 7-bit block using systematic generator polynomial $G(x) = \mathtt{0x1D1}$ over Galois Field $GF(2^4)$ defined by $p(x) = x^4 + x + 1$ ($\mathtt{0x13}$).
  5. **Zero-Knowledge Wire Transmission:** Discards the raw spatial message blocks and transmits only 146 8-bit parity syndromes ($S_j$) alongside SHA-256 blinded HMAC grid hashes.
  6. **Asymmetric Peer Reconstruction & Error Correction:** The receiving peer executes a $GF(2^4)$ Berlekamp-Massey / Chien search BCH decoding algorithm, correcting up to 2 bit-errors per block caused by GPS sensor noise and verifying co-location without exposing raw coordinates.

#### 4. 🗺️ Map & Location Enhancements
- **Leaflet Map View:** Improved live GPS marker rendering, smooth map pan animations, and spatial location sharing (`LeafletMapView.tsx`).
- **Mutual Proximity Verification:** Cryptographic Ed25519 & QR code handshakes for secure requester-peer meetings.

#### 5. 📱 App Version & Build Alignment
- **Version Name:** `4.8.6`
- **Version Code:** `35`
- Fully synchronized across Mobile Client, Backend Services, and Web Landing Page.

#### 5. 🛡️ Google Play Policy & Security Compliance
- **Target SDK 36 (Android 15+):** Native Hermes engine optimization and edge-to-edge UI support.
- **Child Safety Policy & CSAM Prevention:** Compliance with Google Play Developer Policy with dedicated in-app reporting mechanism.
- **Permissions Declaration:** Fully aligned SMS and location permissions for offline spatial dispatch.

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
