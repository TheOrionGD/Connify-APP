# Privacy Policy & Security Charter for Connify Safety Network

**Application Name:** Connify ("Connify", "App", "We", "Us", or "Our")  
**Production Release:** v4.8.6 (Version Code: 35)  
**Target SDK:** 36 (Android 15+ / API Level 36 Compliant)  
**Effective Date:** October 26, 2026  
**Last Updated:** October 26, 2026  
**Official Portal:** [https://connify-five.vercel.app/](https://connify-five.vercel.app/)  
**Hosted Policy (Google Sites):** [https://sites.google.com/view/connifyprivacypolicy/home](https://sites.google.com/view/connifyprivacypolicy/home)  
**Contact Email:** `hello.theoriongd@gmail.com`  

---

## 1. Overview & Commitment

Welcome to **Connify**, a decentralized Peer-to-Peer (P2P) Emergency Response and Personal Safety Network. Connify is built on zero-knowledge cryptographic principles to empower individuals during safety episodes, medical emergencies, and distress scenarios while safeguarding user privacy.

Connify is engineered to solve the fundamental *Privacy-Accuracy Paradox*: enabling users to request and receive verified emergency assistance and proximity coordination without continuously exposing unblinded geographic coordinates or personal movement histories to central servers or third-party brokers.

By accessing or using Connify, you acknowledge and agree to the data collection, cryptographic processing, and ephemeral storage practices outlined in this Privacy Policy.

---

## 2. Information We Collect

We only collect information strictly required to provide real-time emergency dispatch, guardian notifications, mutual proximity verification, and safety telemetry.

### A. Personal Identification Data
- **Google OAuth Identity**: When you sign in via Google OAuth, we collect your **Display Name**, verified **Email Address**, and **Google User ID (UID)** via `@react-native-google-signin/google-signin` and Firebase Authentication.
- **User Profile Data**: User-provided full name, primary mobile phone number, and optional avatar URL.

### B. Emergency Guardian Data
- **Primary & Secondary Guardian Contacts**: Full name, verified mobile phone number, and relationship (e.g., Parent, Spouse, Friend) configured for automated distress notifications, WhatsApp tracking deep-links, and offline emergency SMS routing.

### C. Optional On-Device Medical Profile
- **Emergency Medical Information**: User-entered Blood Group, Allergies, Chronic Medical Conditions, and emergency medical intervention notes. Medical data is encrypted locally on-device and shared only with verified emergency responders or guardians during an active distress episode.

### D. Geolocation & Blinded Spatial Grid Data
- **Precise Location Coordinates**: GPS latitude and longitude captured exclusively during active emergency episodes, nearby helper dispatch, and mutual rendezvous handshakes.
- **Blinded Spatial Grid Tokens**: GPS coordinates are quantized to 3 decimal places to create 3x3 contiguous grid neighborhoods (9 cells) and encoded into 1024-bit Bloom filter bit-arrays with 146 parity syndromes over Galois Field $GF(2^4)$. Unblinded coordinate history is **never** permanently stored or tracked.

### E. Ephemeral VoIP Audio Telemetry
- **Live Duplex Peer Audio**: Real-time microphone audio captured during active VoIP peer voice calls (`voipAudioService.ts`) via WebRTC. Audio packets are transmitted directly peer-to-peer over encrypted streams. **Audio is never recorded, stored on servers, monitored, or transcribed.**

### F. Device, Hardware & Security Credentials
- **Device Fingerprint & Ed25519 Cryptographic Keys**: Deterministic 64-hex SHA-256 device fingerprints and Ed25519 public key pairs (`tweetnacl`) used for signing challenge nonces and authenticating optical QR proximity handshakes. No hardware IMEI or MAC addresses are collected.
- **Technical Telemetry**: Device model, OS version, network ping/latency, and application build identifiers.

---

## 3. How We Use Your Information

Collected data is utilized strictly for life-safety, distress coordination, and cryptographic verification:

1. **Emergency Distress Signal Dispatch**: Broadcasting blinded grid cells and urgency indicators to verified nearby responder nodes within an adaptive radius.
2. **Guardian Notification & Fallback**: Routing automated push alerts, WhatsApp tracking links, and carrier SMS alerts to designated emergency guardians.
3. **Mutual Proximity Handshakes**: Generating and verifying encrypted QR code tokens and ephemeral trust capsules during helper-requester rendezvous.
4. **Peer VoIP Voice Communication**: Facilitating real-time, zero-latency duplex audio between requesters and responders during an ongoing crisis episode.
5. **Security & Abuse Prevention**: Verifying Ed25519 challenge signatures to prevent fraudulent alarm triggers and denial-of-service broadcasts.
6. **Tactical Safety Features**: Triggering local high-decibel siren beacons, camera flashlight strobes, and simulated fake emergency calls (`FakeCallModal.tsx`).

We **do not** use personal data for targeted advertising, cross-app tracking, or commercial data brokerage.

---

## 4. The SHARP Protocol & Zero-Knowledge Architecture

Connify implements the proprietary **SHARP Protocol** (*Selective Hashing & Blinded Proximity Protocol*), establishing a mathematical zero-knowledge privacy boundary between raw mobile sensors and central persistence stores:

```
1. SPATIAL QUANTIZATION: Round GPS (lat, lng) to 3 decimal places -> 3x3 grid neighborhood (9 cells).
2. BLOOM VECTORIZATION : Hash each cell 4x using FNV-1a salt multipliers -> 1024-bit vector V.
3. GALOIS FIELD SPLIT  : Segment 1024-bit vector into 146 discrete 7-bit spatial message blocks m_7.
4. BCH ENCODING        : Encode m_7 using generator polynomial G(x) = 0x1D1 over GF(2^4) with p(x) = x^4 + x + 1.
5. ZERO-KNOWLEDGE WIRE : Discard raw blocks m_7; transmit only 146 8-bit parity syndromes S_j + HMAC blinded cell hashes.
6. PEER RECONSTRUCTION : Berlekamp-Massey & Chien search corrects GPS sensor jitter (up to 2 bit-errors per block).
```

Because the central server only routes 146 parity bytes and salted HMAC grid hashes, it is mathematically impossible for server administrators or compromised cloud nodes to reverse parity syndromes into unblinded geographical coordinates.

---

## 5. VoIP Calling & Audio Privacy

- **End-to-End Encrypted WebRTC**: Live peer voice calls during active rescue episodes run over WebRTC and Secure WebSockets (WSS). Direct audio packets flow between peer devices with TLS/SRTP encryption.
- **Zero Server Audio Storage**: Voice streams are purely in-memory. No audio is ever recorded, stored on servers, or processed through speech recognition models. Audio buffers are flushed immediately upon call teardown.
- **Episode-Scoped Access**: VoIP calls can only be initiated during an active, mutually confirmed emergency episode. Unsolicited stranger calling is blocked at the protocol level.

---

## 6. Information Sharing and Disclosure

We do not sell, rent, or trade your personal information. Information is shared only under the following emergency circumstances:

1. **Designated Emergency Guardians**: When a distress beacon or Silent Duress alert is triggered, your location tracking link, emergency message, and contact details are dispatched to configured guardians.
2. **Nearby Verified Mesh Nodes**: Active responders within your radius receive blinded grid tokens, urgency levels, and distance estimates. Exact co-location is only verified upon mutual QR code scanning.
3. **Official Public Emergency Services**: Direct dialing shortcuts (112, 108, 911, 1091) invoke the native system dialer to connect to official emergency dispatch centers.
4. **Legal Compliance**: We disclose records only when compelled by a valid legal warrant, court order, or when necessary to prevent imminent death or severe bodily injury.

---

## 7. Device Permissions Audit (Target SDK 36 / Android 15+)

| Permission Identifier | Category | Functional Purpose & Codebase Implementation | Play Console Status |
| :--- | :--- | :--- | :--- |
| `ACCESS_FINE_LOCATION`<br>`ACCESS_COARSE_LOCATION` | Location | Computes regional 3x3 spatial grids and SHARP Galois Field Bloom vectors during active distress episodes. | Ephemeral Processing |
| `RECORD_AUDIO` | Microphone | Captures live microphone audio for peer VoIP calling during active rescue episodes. Zero recording or retention. | Active Session Only |
| `MODIFY_AUDIO_SETTINGS` | Audio Control | Permits toggling between loudspeaker and earpiece during active emergency calls via InCallManager. | Audio Routing |
| `BLUETOOTH_CONNECT` | Bluetooth | Connects to handsfree Bluetooth headsets and audio accessories during emergency calls. | Hardware Pairing |
| `CAMERA` | Vision / QR | Scans mutual Ed25519 optical QR codes for responder co-location verification via Google ML Kit. | Zero Photo Storage |
| `POST_NOTIFICATIONS` | Alerts | Delivers urgent incoming emergency broadcasts and responder tracking updates via Notifee. | Active Alerts |
| `VIBRATE` | Haptics | Provides tactile haptic feedback during countdown alarms and Silent Duress triggers. | System Haptics |
| `USE_BIOMETRIC`<br>`USE_FINGERPRINT` | Security | Local biometric prompt protecting account settings, guardian contacts, and preventing unauthorized cancellation. | Hardware Enclave |
| `INTERNET`<br>`ACCESS_NETWORK_STATE` | Networking | Establishes encrypted TLS 1.3 HTTPS communication and low-latency WSS socket connections. | Standard Network |
| *Zero Carrier Permissions*<br>*(tel: & sms: intents)* | Telephony | Offline emergency distress SMS and dialing invoke the user's native messaging app and dialer via standard system intents (`Linking.openURL`). Sensitive `SEND_SMS` and `CALL_PHONE` permissions are **not** requested. | Zero Permission Intent |

---

## 8. Data Retention & Account Deletion

### A. Data Retention Policy
- Account identity data is retained while your account remains active.
- Ephemeral emergency episode tokens and blinded spatial grid entries automatically expire within **30 minutes** of episode resolution and are purged from MongoDB Atlas.

### B. In-App Data Wipe ("Disconnect Account & Wipe Data")
Users can immediately wipe all local data from their device at any time:
1. Open **User Profile** (`SettingsScreen.tsx`).
2. Tap **DISCONNECT ACCOUNT & WIPE DATA**.
3. This revokes Google OAuth tokens, deletes Ed25519 cryptographic keypairs from Keychain, wipes cached guardian contacts, and resets device identity.

### C. Permanent Account Deletion via Web Portal (48-Hour SLA)
In compliance with Google Play Developer Policy, GDPR, and CCPA, you have the right to request full and permanent deletion of your account and all associated server records:
- Submit your request via our official [**Google Account Deletion Form**](https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform).
- Or email our Data Protection Officer directly at `hello.theoriongd@gmail.com` / `privacy@connify.app`.
- Upon verification, all user profile records, server logs, guardian links, and cryptographic device registrations will be permanently purged within **48 hours**.

---

## 9. Data Security Measures & Audit Ledger

- **End-to-End Cryptography**: Ephemeral trust capsules and challenge nonces signed using TweetNaCl Ed25519 signatures.
- **SHA-256 Digest Token Storage**: Central database stores only SHA-256 digests of bearer authorization tokens (`signedTokenHash`). Raw tokens are never stored.
- **Tamper-Evident SHA-256 Hash Chained Audit Ledger**: Safety events are recorded in an immutable sequential ledger where each record is cryptographically linked: `H_n = SHA-256(H_{n-1} || EventType || EpisodeID || Timestamp)`.
- **Stale-Aware Offline Queue Engine**: Offline transactions queued during network disconnects (`OfflineQueueService.ts`) are evaluated against configurable maximum age limits (`maxAge`) to discard expired states upon reconnecting.

---

## 10. Children’s Privacy & CSAM Prevention

Connify is intended for general audiences aged 13 and older (or 16 where required by local law). We enforce strict child protection standards:
- **Zero Tolerance for Child Exploitation**: We maintain zero tolerance for Child Sexual Abuse Material (CSAM). Any detected incident results in immediate permanent account termination and referral to the **National Center for Missing & Exploited Children (NCMEC)** and law enforcement.
- **No Minor Targeted Profiling**: We do not collect behavioral data or display advertisements to minors.
- **Parental Deletion Inquiries**: Parents or guardians who believe a minor under 13 has registered without consent may email `hello.theoriongd@gmail.com` for immediate record removal.

---

## 11. Contact & Privacy Inquiries

For questions, feedback, or data privacy requests regarding this Privacy Policy, please contact our Data Protection Officer:

- **Email**: `hello.theoriongd@gmail.com` / `privacy@connify.app`  
- **Official Portal**: [https://connify-five.vercel.app/](https://connify-five.vercel.app/)  
- **Hosted Privacy Policy**: [https://sites.google.com/view/connifyprivacypolicy/home](https://sites.google.com/view/connifyprivacypolicy/home)  
- **GitHub Repository**: [https://github.com/TheOrionGD/Connify-APP](https://github.com/TheOrionGD/Connify-APP)  
- **Account Deletion Portal**: [Google Account Deletion Form](https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform)  

---

## Google Apps Script Deployment Code (`Code.gs`)

Deploy this Privacy Policy as a standalone Web App by copying the following Google Apps Script into your Apps Script editor (`script.google.com`):

```javascript
/**
 * Connify Safety Network - Google Apps Script Privacy Policy Web App
 * @OnlyCurrentDoc
 */

function doGet(e) {
  var htmlOutput = HtmlService.createHtmlOutput(getPolicyHtml());
  htmlOutput.setTitle('Privacy Policy | Connify Safety Network');
  htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return htmlOutput;
}

function getPolicyHtml() {
  // References the standalone ds.html content
  return `<!-- See docs/ds.html for the complete, self-contained HTML version with interactive light/dark mode and search filtering -->`;
}
```
