# 🚀 Connify v4.2.1 - Official Production Release

gh release create v4.2.1 Connify/android/app/build/outputs/apk/release/app-release.apk Connify/android/app/build/outputs/bundle/release/app-release.aab --title "Connify v4.2.1 Release" -F scratch/release_notes.md


We are excited to announce **Connify v4.2.1** (`versionCode 23`), featuring major performance enhancements, full Android 15 (Target SDK 36+) compatibility, signed release binaries, and complete compliance with Google Play Developer Policies.

---

### 📦 Release Highlights & Key Updates

#### 1. 📱 App Version & Build Alignment
- **Version Name:** `4.2.1`
- **Version Code:** `23`
- Fully synchronized version across Mobile Client, Backend Services, and Landing Page portal.

#### 2. 🛡️ Google Play Policy & Child Safety Compliance
- Published official **Child Safety Standards & CSAM Prevention Policy** at `https://theoriongd.github.io/Connify-APP/child-safety-policy.html`.
- Completed **Permissions Declaration Form** for offline SMS emergency dispatch.
- Zero-tolerance policy for child sexual abuse material (CSAM) with 1-tap in-app reporting and NCMEC reporting workflow.

#### 3. 🔐 Signed Production Artifacts
- **Signed APK (`app-release.apk`):** Signed with official `connify-release-key` (2048-bit RSA PKCS12 key).
- **Signed App Bundle (`app-release.aab`):** Optimized Android App Bundle ready for Google Play Store production distribution.

#### 4. ⚡ Core Safety & Protocol Performance
- **Offline Emergency SOS Broadcast:** 1-tap SMS & cellular call fallback containing live satellite GPS location coordinates.
- **Mutual Proximity Handshakes:** High-speed Ed25519 cryptographic key exchange & QR verification for helper-requester meetings.
- **Android 15 (API 36+) Optimization:** Native UI rendering, edge-to-edge support, and Hermesc bytecode optimization.

---

### 📥 Downloads

| File Name | File Type | Size | Description |
| :--- | :--- | :--- | :--- |
| `app-release.apk` | Android Application Package | ~149.3 MB | Direct Android APK installation file |
| `app-release.aab` | Android App Bundle | ~94.2 MB | Google Play Store publishing bundle |

---

### 🔒 Verification & Security
- **Keystore Alias:** `connify-key`
- **SHA-1 Fingerprint:** `F4:61:7D:CE:02:FB:6F:29:D7:C5:2F:EF:1A:E5:8C:C6:74:CD:37:E9`
- **SHA-256 Fingerprint:** `57:A0:CB:81:3A:D8:3C:30:89:54:92:01:F1:5C:6A:9F:02:BF:E6:D7:DD:58:A3:9C:D4:8D:2D:25:15:7A:E3:EC`
