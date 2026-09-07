# Privacy Policy for Connify Safety Network

**Effective Date:** September 3, 2026  
**Last Updated:** September 3, 2026  
**Application Name:** Connify ("Connify", "App", "We", "Us", or "Our")  
**Contact Email:** privacy@connify.app / support@connify.app  

---

## 1. Overview & Commitment

Welcome to **Connify**, a decentralized Peer-to-Peer (P2P) Emergency Response and Personal Safety Network. Connify is built on zero-knowledge cryptographic principles to empower individuals during safety episodes, medical emergencies, and distress scenarios while safeguarding user privacy.

This Privacy Policy explains how we collect, use, store, process, and protect your personal information when you use the Connify mobile application and associated backend services. By accessing or using Connify, you consent to the practices described in this Privacy Policy.

---

## 2. Information We Collect

We only collect information necessary to provide real-time emergency dispatch, guardian notifications, proximity verification, and safety telemetry.

### A. Personal Identification Data
- **Account Credentials**: When you sign in via Google OAuth or create an account, we collect your **Display Name**, **Email Address**, and **Google User ID (UID)**.
- **User Profile Data**: User-provided full name, primary phone number, and optional avatar URL.

### B. Emergency Guardian Data
- **Primary & Secondary Guardian Contacts**: Full name, phone number, and relationship (e.g., Parent, Spouse, Friend) configured by you for automated SMS, phone calls, and WhatsApp distress routing.

### C. Optional Medical Profile Data
- **Emergency Medical Information**: User-entered Blood Group, Allergies, Chronic Conditions, and emergency medical notes. Medical profile data is stored on-device and shared only with verified emergency responders or guardians during an active distress episode.

### D. Geolocation & Blinded Spatial Grid Data
- **Precise Location Data**: GPS latitude and longitude used exclusively during active emergency triggers, nearby helper dispatch, and proximity spatial grids.
- **Blinded Spatial Grid Tokens**: GPS coordinates are converted into regional grid tokens to obscure exact user coordinates from network nodes until mutual response verification. Location coordinates are **never** tracked, sold, or logged when no active distress episode is in progress.

### E. Device, Hardware & Security Credentials
- **Device Fingerprint & Ed25519 Cryptographic Keys**: Deterministic 64-hex device fingerprints and Ed25519 public key pairs used for signing server challenge nonces, authenticating QR proximity handshakes, and preventing malicious emergency broadcasts.
- **Technical Telemetry**: Device model, OS version, network ping/latency, and app build identifiers.

---

## 3. How We Use Your Information

We use the collected information strictly for safety, emergency coordination, and security verification purposes:

1. **Emergency Distress Signal Dispatch**: Broadcasting distress signals to nearby verified helper nodes and primary/secondary emergency guardians.
2. **Guardian Notification & Fallback**: Routing automated SMS messages, phone calls, and WhatsApp alerts to designated emergency guardians.
3. **Mutual Proximity Handshakes**: Generating and verifying encrypted QR code tokens and ephemeral trust capsules during helper-requester meetings.
4. **Offline Emergency Routing**: Enforcing carrier SMS fallback channels when cellular internet connectivity is offline or degraded.
5. **Security & Abuse Prevention**: Verifying Ed25519 challenge signatures to prevent fraudulent alarm triggers and denial-of-service broadcasts.
6. **Tactical Safety Features**: Triggering local audible siren beacons, camera flashlight strobes, and fake call simulations.

We **do not** use your data for targeted advertising, cross-app tracking, or data brokerage.

---

## 4. Zero-Knowledge Architecture & Ephemeral Data Handling

- **Location Data Expiry**: Location tracking tokens are active only during an emergency episode and are automatically purged from active session channels upon episode resolution.
- **No Background Surveillance**: Connify does not track your movements or record location history in the background when the app is idle.
- **Local Storage Encryption**: Sensitive guardian contacts and medical profiles are stored securely in device storage (`AsyncStorage` / Encrypted Keychain).

---

## 5. Information Sharing and Disclosure

We do not sell, rent, or trade your personal information. Information is shared only under the following emergency circumstances:

1. **Designated Emergency Guardians**: When an emergency SOS or Silent Duress signal is triggered, your location grid link, emergency message, and contact details are sent to your configured guardians.
2. **Nearby Verified Mesh Nodes**: Nearby active helpers receive blinded regional grid tokens and urgency levels to evaluate proximity before dispatching help.
3. **Official Public Emergency Services**: Direct dialing shortcuts (112, 108, 911, 1091) connect you directly to official government emergency services.
4. **Legal Compliance**: We may disclose information if required by applicable law, court order, or governmental subpoena, or to protect the physical safety of any person during life-threatening distress.

---

## 6. Device Permissions Requested & Rationale

| Permission | Purpose |
| :--- | :--- |
| **ACCESS_FINE_LOCATION** & **ACCESS_COARSE_LOCATION** | Required to calculate blinded spatial grids and dispatch emergency helpers to your position. |
| **POST_NOTIFICATIONS** | Required to deliver urgent incoming emergency broadcasts and responder updates. |
| **CAMERA** | Required for scanning mutual QR codes during proximity verification handshakes. |
| **CALL_PHONE** & **SEND_SMS** | Required for offline emergency dialing and direct SMS fallback routing to guardians. |
| **VIBRATE** | Used for tactile haptic feedback during countdown alarms and Silent Duress triggers. |

---

## 7. Data Retention & Account Deletion

### A. Data Retention Policy
- Account identity data is retained while your account remains active.
- Temporary incident telemetry logs are retained only as necessary for user safety history audits and are automatically archived or purged.

### B. In-App Data Wipe ("Disconnect Account & Wipe Data")
You can immediately wipe all local data from your device at any time inside the app:
- Open **User Profile** (`SettingsScreen`).
- Tap **DISCONNECT ACCOUNT & WIPE DATA**.
- This revokes Google OAuth tokens, clears local guardian contacts, wipes cached encryption keys, and resets device identity.

### C. Permanent Account Deletion via Google Form
In compliance with Google Play Console & Apple App Store Policies, you have the right to request full and permanent deletion of your account and server records:
- Open **User Profile** -> **ACCOUNT DELETION & DATA PRIVACY**.
- Tap **PERMANENT ACCOUNT DELETION FORM** to submit your deletion request via our official Google Form.
- Alternatively, submit your request directly via email to **privacy@connify.app**.
- Upon verification, all user profile records, server logs, guardian links, and cryptographic device registrations will be permanently deleted within **48 hours**.

---

## 8. Data Security Measures

We implement robust technical and organizational security measures:
- **End-to-End Cryptography**: Ephemeral trust capsules and challenge nonces signed using TweetNaCl Ed25519 signatures.
- **Secure Transport Layer**: All network API calls and real-time socket streams run over HTTPS and Secure WebSockets (WSS).
- **Sanitized Logging**: Telemetry and error logs are stripped of sensitive personal identifiers.

---

## 9. Children’s Privacy

Connify is intended for general audiences. We do not knowingly collect personal information from children under the age of 13 (or 16 in certain jurisdictions) without parental or guardian oversight. If you believe a minor has registered an account without parental consent, please contact us at **privacy@connify.app** to request immediate data deletion.

---

## 10. Changes to This Privacy Policy

We may update this Privacy Policy periodically to reflect new features, security enhancements, or legal requirements. Material changes will be communicated via in-app notifications or email updates.

---

## 11. Contact & Privacy Inquiries

For questions, feedback, or data privacy requests regarding this Privacy Policy, please contact our Data Protection Officer:

- **Email**: `hello.theoriongd@gmail.com` / `privacy@connify.app`  
- **Official Website**: `connify-green.vercel.app`  
- **GitHub Repository**: `github.com/TheOrionGD/Connify-APP`  

---

## Google Apps Script Deployment Code (`Code.gs`)

Copy and paste the following Google Apps Script code into your Google Apps Script editor (`script.google.com`) to deploy the styled Privacy Policy as a standalone Web App.

```javascript
/**
 * Connify Safety Network - Google Apps Script Privacy Policy Web App
 * @OnlyCurrentDoc
 */

function doGet(e) {
  var htmlOutput = HtmlService.createHtmlOutput(getPolicyHtml());
  htmlOutput.setTitle('Privacy Policy - Connify Safety Network');
  htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return htmlOutput;
}

function getPolicyHtml() {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Privacy Policy | Connify Safety Network</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">
    <style>
        /* --- RESET & BASE (mobile-first) --- */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :root {
            --primary: #2563eb;
            --primary-gradient: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            --hero-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
            --accent-green: #10b981;
            --accent-purple: #8b5cf6;
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-body: #334155;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
            --shadow-lg: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
            --radius-sm: 6px;
            --radius-md: 12px;
            --radius-lg: 16px;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.65;
            color: var(--text-body);
            background-color: var(--bg-color);
            -webkit-font-smoothing: antialiased;
            padding: 0;
            margin: 0;
        }

        /* --- TYPOGRAPHY SCALING (mobile first) --- */
        h1 {
            font-size: 1.9rem;
        }

        h2 {
            font-size: 1.4rem;
        }

        h3 {
            font-size: 1.1rem;
        }

        p,
        li {
            font-size: 0.95rem;
        }

        /* --- HERO BANNER (mobile first) --- */
        .hero-banner {
            background: var(--hero-gradient);
            color: #ffffff;
            padding: 32px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(15, 23, 42, 0.25);
        }

        .hero-banner::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 60%);
            pointer-events: none;
        }

        .brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #93c5fd;
            margin-bottom: 16px;
        }

        .brand-badge svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }

        .hero-banner h1 {
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #ffffff;
            margin-bottom: 10px;
            font-size: clamp(1.8rem, 6vw, 2.75rem);
        }

        .hero-banner p {
            font-size: 0.95rem;
            color: #94a3b8;
            max-width: 640px;
            margin: 0 auto 20px auto;
            padding: 0 4px;
        }

        .meta-pills {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            font-size: 0.75rem;
        }

        .meta-pill {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            padding: 5px 12px;
            border-radius: 8px;
            color: #cbd5e1;
            white-space: nowrap;
        }

        .meta-pill strong {
            color: #ffffff;
        }

        /* --- HIGHLIGHTS GRID (mobile first) --- */
        .highlights-container {
            max-width: 1100px;
            margin: -28px auto 28px auto;
            padding: 0 16px;
            position: relative;
            z-index: 10;
        }

        .highlights-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .highlight-card {
            background: var(--card-bg);
            padding: 16px 14px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-md);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .highlight-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg);
        }

        .highlight-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            font-size: 1.1rem;
        }

        .icon-blue {
            background: #eff6ff;
            color: #2563eb;
        }

        .icon-green {
            background: #ecfdf5;
            color: #10b981;
        }

        .icon-purple {
            background: #f5f3ff;
            color: #8b5cf6;
        }

        .icon-amber {
            background: #fffbeb;
            color: #d97706;
        }

        .highlight-card h4 {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 2px;
        }

        .highlight-card p {
            font-size: 0.75rem;
            color: var(--text-muted);
            line-height: 1.4;
            margin-bottom: 0;
        }

        /* --- PAGE WRAPPER (mobile first) --- */
        .page-wrapper {
            max-width: 1100px;
            margin: 0 auto 40px auto;
            padding: 0 16px;
            display: flex;
            flex-direction: column;
            gap: 28px;
        }

        /* --- SIDEBAR (hidden on mobile, shown on larger) --- */
        .sidebar {
            display: none;
        }

        /* --- MAIN CONTENT (full width, mobile first) --- */
        .main-content {
            background: var(--card-bg);
            padding: 24px 18px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-md);
            width: 100%;
        }

        /* --- POLICY SECTIONS --- */
        .policy-section {
            margin-bottom: 32px;
            scroll-margin-top: 16px;
        }

        .policy-section:last-child {
            margin-bottom: 0;
        }

        h2 {
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 14px;
            padding-bottom: 6px;
            border-bottom: 2px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1.3rem;
        }

        h2::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 20px;
            background: var(--primary);
            border-radius: 2px;
            flex-shrink: 0;
        }

        h3 {
            font-weight: 600;
            color: #1e293b;
            margin: 20px 0 8px 0;
            font-size: 1.05rem;
        }

        p {
            margin-bottom: 12px;
        }

        ul,
        ol {
            padding-left: 20px;
            margin-bottom: 14px;
        }

        li {
            margin-bottom: 6px;
        }

        /* --- CALLOUTS --- */
        .callout {
            padding: 14px 16px;
            border-radius: var(--radius-md);
            margin: 16px 0;
            font-size: 0.9rem;
            border-left: 4px solid;
        }

        .callout-info {
            background: #eff6ff;
            border-color: #2563eb;
            color: #1e40af;
        }

        .callout-warning {
            background: #fffbeb;
            border-color: #f59e0b;
            color: #92400e;
        }

        .callout-success {
            background: #ecfdf5;
            border-color: #10b981;
            color: #065f46;
        }

        /* --- TABLE (responsive) --- */
        .table-responsive {
            overflow-x: auto;
            margin: 16px 0;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
            -webkit-overflow-scrolling: touch;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.8rem;
            text-align: left;
            min-width: 480px;
        }

        th {
            background: #f8fafc;
            color: var(--text-main);
            font-weight: 700;
            padding: 12px 12px;
            border-bottom: 1px solid var(--border-color);
        }

        td {
            padding: 12px 12px;
            border-bottom: 1px solid var(--border-color);
            vertical-align: top;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:nth-child(even) {
            background-color: #fafafa;
        }

        .permission-badge {
            display: inline-block;
            font-family: monospace;
            font-weight: 700;
            font-size: 0.7rem;
            background: #e0e7ff;
            color: #3730a3;
            padding: 3px 6px;
            border-radius: 6px;
            margin-bottom: 2px;
        }

        /* --- CONTACT CARD --- */
        .contact-card {
            background: #f8fafc;
            border: 1px solid var(--border-color);
            padding: 18px 16px;
            border-radius: var(--radius-md);
            margin-top: 12px;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            font-size: 0.9rem;
            flex-wrap: wrap;
        }

        .contact-item:last-child {
            margin-bottom: 0;
        }

        .contact-item a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            word-break: break-all;
        }

        .contact-item a:hover {
            text-decoration: underline;
        }

        /* --- BACK TO TOP (floating) --- */
        .back-to-top {
            position: fixed;
            bottom: 20px;
            right: 16px;
            background: var(--primary);
            color: #ffffff;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-lg);
            text-decoration: none;
            font-size: 1.5rem;
            transition: transform 0.2s ease, background 0.2s ease;
            z-index: 100;
            border: none;
        }

        .back-to-top:hover {
            transform: scale(1.1);
            background: #1d4ed8;
        }

        /* --- FOOTER --- */
        footer {
            text-align: center;
            padding: 28px 16px;
            border-top: 1px solid var(--border-color);
            background: #ffffff;
            color: var(--text-muted);
            font-size: 0.8rem;
        }

        footer a {
            color: var(--primary);
            text-decoration: none;
        }

        /* ========== TABLET & DESKTOP (≥ 768px) ========== */
        @media (min-width: 768px) {
            .highlights-grid {
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
            }

            .highlight-card {
                padding: 20px;
            }

            .highlight-card h4 {
                font-size: 0.95rem;
            }

            .highlight-card p {
                font-size: 0.85rem;
            }

            .main-content {
                padding: 36px 40px;
            }

            .hero-banner {
                padding: 48px 32px;
            }

            .hero-banner h1 {
                font-size: 2.5rem;
            }

            .meta-pills {
                gap: 14px;
                font-size: 0.85rem;
            }

            .page-wrapper {
                padding: 0 24px;
                flex-direction: row;
                gap: 36px;
            }

            /* show sidebar */
            .sidebar {
                display: block;
                position: sticky;
                top: 24px;
                height: fit-content;
                background: var(--card-bg);
                padding: 20px 16px;
                border-radius: var(--radius-md);
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-sm);
                flex: 0 0 240px;
                max-width: 260px;
            }

            .sidebar h3 {
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--text-muted);
                margin-bottom: 14px;
                padding-bottom: 8px;
                border-bottom: 1px solid var(--border-color);
            }

            .sidebar-nav {
                list-style: none;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .sidebar-nav a {
                display: block;
                padding: 8px 12px;
                font-size: 0.8rem;
                font-weight: 500;
                color: var(--text-body);
                text-decoration: none;
                border-radius: var(--radius-sm);
                transition: background 0.15s ease, color 0.15s ease;
            }

            .sidebar-nav a:hover {
                background: #f1f5f9;
                color: var(--primary);
            }

            .main-content {
                flex: 1;
                min-width: 0;
            }
        }

        /* --- large screens fine-tuning --- */
        @media (min-width: 1024px) {
            .main-content {
                padding: 44px 48px;
            }

            .page-wrapper {
                gap: 44px;
            }

            .hero-banner h1 {
                font-size: 2.75rem;
            }
        }

        /* --- small phone extra tweaks --- */
        @media (max-width: 480px) {
            .highlights-grid {
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .highlight-card {
                padding: 12px 10px;
            }

            .highlight-icon {
                width: 32px;
                height: 32px;
                font-size: 1rem;
            }

            .highlight-card h4 {
                font-size: 0.8rem;
            }

            .highlight-card p {
                font-size: 0.7rem;
            }

            .main-content {
                padding: 18px 12px;
            }

            h2 {
                font-size: 1.2rem;
            }

            .contact-item {
                font-size: 0.85rem;
                gap: 6px;
            }
        }
    </style>
</head>

<body>

    <!-- Header Banner -->
    <header class="hero-banner">
        <div class="brand-badge">
            <svg viewBox="0 0 24 24">
                <path
                    d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            CONNIFY SAFETY NETWORK
        </div>
        <h1>Privacy Policy & Security Charter</h1>
        <p>Transparency, zero-knowledge cryptographic safeguards, and emergency distress protocols.</p>

        <div class="meta-pills">
            <div class="meta-pill"><strong>Effective:</strong> Sept 3, 2026</div>
            <div class="meta-pill"><strong>v2.4 Live</strong></div>
            <div class="meta-pill"><strong>ZK P2P</strong></div>
        </div>
    </header>

    <!-- Quick Highlights Grid -->
    <div class="highlights-container">
        <div class="highlights-grid">
            <div class="highlight-card">
                <div class="highlight-icon icon-blue">🛡️</div>
                <h4>Zero-Knowledge P2P</h4>
                <p>Location blinded into spatial grid tokens during alerts.</p>
            </div>
            <div class="highlight-card">
                <div class="highlight-icon icon-green">🔐</div>
                <h4>Ed25519 Encryption</h4>
                <p>Hardware signed challenge nonces prevent spoofing.</p>
            </div>
            <div class="highlight-card">
                <div class="highlight-icon icon-purple">🚫</div>
                <h4>No Data Brokerage</h4>
                <p>Never track, sell, or rent personal information.</p>
            </div>
            <div class="highlight-card">
                <div class="highlight-icon icon-amber">⚡</div>
                <h4>48-Hour Deletion</h4>
                <p>Instant wipe or server purge via Google Form.</p>
            </div>
        </div>
    </div>

    <!-- Main Content Layout -->
    <div class="page-wrapper">
        <!-- Sticky Sidebar Navigation (visible on larger screens) -->
        <aside class="sidebar">
            <h3>Navigation</h3>
            <ul class="sidebar-nav">
                <li><a href="#section-1">1. Overview</a></li>
                <li><a href="#section-2">2. Information Collected</a></li>
                <li><a href="#section-3">3. How We Use Data</a></li>
                <li><a href="#section-4">4. Zero-Knowledge System</a></li>
                <li><a href="#section-5">5. Information Sharing</a></li>
                <li><a href="#section-6">6. Device Permissions</a></li>
                <li><a href="#section-7">7. Retention & Deletion</a></li>
                <li><a href="#section-8">8. Security Measures</a></li>
                <li><a href="#section-9">9. Children’s Privacy</a></li>
                <li><a href="#section-10">10. Policy Changes</a></li>
                <li><a href="#section-11">11. Contact Inquiries</a></li>
            </ul>
        </aside>

        <!-- Main Body Content -->
        <main class="main-content">

            <!-- Section 1 -->
            <section id="section-1" class="policy-section">
                <h2>1. Overview & Commitment</h2>
                <p>Welcome to <strong>Connify</strong>, a decentralized Peer-to-Peer (P2P) Emergency Response and
                    Personal Safety Network. Connify is built on zero-knowledge cryptographic principles to empower
                    individuals during safety episodes, medical emergencies, and distress scenarios while safeguarding
                    user privacy.</p>
                <p>This Privacy Policy explains how we collect, use, store, process, and protect your personal
                    information when you use the Connify mobile application and associated backend services. By
                    accessing or using Connify, you consent to the practices described in this Privacy Policy.</p>
            </section>

            <!-- Section 2 -->
            <section id="section-2" class="policy-section">
                <h2>2. Information We Collect</h2>
                <p>We only collect information necessary to provide real-time emergency dispatch, guardian
                    notifications, proximity verification, and safety telemetry.</p>

                <h3>A. Personal Identification Data</h3>
                <ul>
                    <li><strong>Account Credentials:</strong> When you sign in via Google OAuth or create an account, we
                        collect your <strong>Display Name</strong>, <strong>Email Address</strong>, and <strong>Google
                            User ID (UID)</strong>.</li>
                    <li><strong>User Profile Data:</strong> User-provided full name, primary phone number, and optional
                        avatar URL.</li>
                </ul>

                <h3>B. Emergency Guardian Data</h3>
                <ul>
                    <li><strong>Primary & Secondary Guardian Contacts:</strong> Full name, phone number, and
                        relationship (e.g., Parent, Spouse, Friend) configured by you for automated SMS, phone calls,
                        and WhatsApp distress routing.</li>
                </ul>

                <h3>C. Optional Medical Profile Data</h3>
                <ul>
                    <li><strong>Emergency Medical Information:</strong> User-entered Blood Group, Allergies, Chronic
                        Conditions, and emergency medical notes. Medical profile data is stored on-device and shared
                        only with verified emergency responders or guardians during an active distress episode.</li>
                </ul>

                <h3>D. Geolocation & Blinded Spatial Grid Data</h3>
                <ul>
                    <li><strong>Precise Location Data:</strong> GPS latitude and longitude used exclusively during
                        active emergency triggers, nearby helper dispatch, and proximity spatial grids.</li>
                    <li><strong>Blinded Spatial Grid Tokens:</strong> GPS coordinates are converted into regional grid
                        tokens to obscure exact user coordinates from network nodes until mutual response verification.
                        Location coordinates are <strong>never</strong> tracked, sold, or logged when no active distress
                        episode is in progress.</li>
                </ul>

                <h3>E. Device, Hardware & Security Credentials</h3>
                <ul>
                    <li><strong>Device Fingerprint & Ed25519 Cryptographic Keys:</strong> Deterministic 64-hex device
                        fingerprints and Ed25519 public key pairs used for signing server challenge nonces,
                        authenticating QR proximity handshakes, and preventing malicious emergency broadcasts.</li>
                    <li><strong>Technical Telemetry:</strong> Device model, OS version, network ping/latency, and app
                        build identifiers.</li>
                </ul>
            </section>

            <!-- Section 3 -->
            <section id="section-3" class="policy-section">
                <h2>3. How We Use Your Information</h2>
                <p>We use the collected information strictly for safety, emergency coordination, and security
                    verification purposes:</p>
                <ol>
                    <li><strong>Emergency Distress Signal Dispatch:</strong> Broadcasting distress signals to nearby
                        verified helper nodes and primary/secondary emergency guardians.</li>
                    <li><strong>Guardian Notification & Fallback:</strong> Routing automated SMS messages, phone calls,
                        and WhatsApp alerts to designated emergency guardians.</li>
                    <li><strong>Mutual Proximity Handshakes:</strong> Generating and verifying encrypted QR code tokens
                        and ephemeral trust capsules during helper-requester meetings.</li>
                    <li><strong>Offline Emergency Routing:</strong> Enforcing carrier SMS fallback channels when
                        cellular internet connectivity is offline or degraded.</li>
                    <li><strong>Security & Abuse Prevention:</strong> Verifying Ed25519 challenge signatures to prevent
                        fraudulent alarm triggers and denial-of-service broadcasts.</li>
                    <li><strong>Tactical Safety Features:</strong> Triggering local audible siren beacons, camera
                        flashlight strobes, and fake call simulations.</li>
                </ol>
                <div class="callout callout-info">
                    <strong>Notice on Data Monitization:</strong> We <strong>do not</strong> use your data for targeted
                    advertising, cross-app tracking, or data brokerage.
                </div>
            </section>

            <!-- Section 4 -->
            <section id="section-4" class="policy-section">
                <h2>4. Zero-Knowledge Architecture & Ephemeral Handling</h2>
                <ul>
                    <li><strong>Location Data Expiry:</strong> Location tracking tokens are active only during an
                        emergency episode and are automatically purged from active session channels upon episode
                        resolution.</li>
                    <li><strong>No Background Surveillance:</strong> Connify does not track your movements or record
                        location history in the background when the app is idle.</li>
                    <li><strong>Local Storage Encryption:</strong> Sensitive guardian contacts and medical profiles are
                        stored securely in device storage (<code>AsyncStorage</code> / Encrypted Keychain).</li>
                </ul>
            </section>

            <!-- Section 5 -->
            <section id="section-5" class="policy-section">
                <h2>5. Information Sharing and Disclosure</h2>
                <p>We do not sell, rent, or trade your personal information. Information is shared only under the
                    following emergency circumstances:</p>
                <ol>
                    <li><strong>Designated Emergency Guardians:</strong> When an emergency SOS or Silent Duress signal
                        is triggered, your location grid link, emergency message, and contact details are sent to your
                        configured guardians.</li>
                    <li><strong>Nearby Verified Mesh Nodes:</strong> Nearby active helpers receive blinded regional grid
                        tokens and urgency levels to evaluate proximity before dispatching help.</li>
                    <li><strong>Official Public Emergency Services:</strong> Direct dialing shortcuts (112, 108, 911,
                        1091) connect you directly to official government emergency services.</li>
                    <li><strong>Legal Compliance:</strong> We may disclose information if required by applicable law,
                        court order, or governmental subpoena, or to protect the physical safety of any person during
                        life-threatening distress.</li>
                </ol>
            </section>

            <!-- Section 6 -->
            <section id="section-6" class="policy-section">
                <h2>6. Device Permissions Requested & Rationale</h2>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Permission Tag</th>
                                <th>Purpose & Functional Rationale</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="permission-badge">ACCESS_FINE_LOCATION</span><br><span
                                        class="permission-badge" style="margin-top:4px;">ACCESS_COARSE_LOCATION</span>
                                </td>
                                <td>Required to calculate blinded spatial grids and dispatch emergency helpers to your
                                    position during alerts.</td>
                            </tr>
                            <tr>
                                <td><span class="permission-badge">POST_NOTIFICATIONS</span></td>
                                <td>Required to deliver urgent incoming emergency broadcasts and responder updates.</td>
                            </tr>
                            <tr>
                                <td><span class="permission-badge">CAMERA</span></td>
                                <td>Required for scanning mutual QR codes during proximity verification handshakes.</td>
                            </tr>
                            <tr>
                                <td><span class="permission-badge">CALL_PHONE</span><br><span class="permission-badge"
                                        style="margin-top:4px;">SEND_SMS</span></td>
                                <td>Required for offline emergency dialing and direct SMS fallback routing to guardians.
                                </td>
                            </tr>
                            <tr>
                                <td><span class="permission-badge">VIBRATE</span></td>
                                <td>Used for tactile haptic feedback during countdown alarms and Silent Duress triggers.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Section 7 -->
            <section id="section-7" class="policy-section">
                <h2>7. Data Retention & Account Deletion</h2>
                <h3>A. Data Retention Policy</h3>
                <p>Account identity data is retained while your account remains active. Temporary incident telemetry
                    logs are retained only as necessary for user safety history audits and are automatically archived or
                    purged.</p>

                <h3>B. In-App Data Wipe ("Disconnect Account & Wipe Data")</h3>
                <p>You can immediately wipe all local data from your device at any time inside the app:</p>
                <ul>
                    <li>Open <strong>User Profile</strong> (<code>SettingsScreen</code>).</li>
                    <li>Tap <strong>DISCONNECT ACCOUNT & WIPE DATA</strong>.</li>
                    <li>This revokes Google OAuth tokens, clears local guardian contacts, wipes cached encryption keys,
                        and resets device identity.</li>
                </ul>

                <h3>C. Permanent Account Deletion via Google Form</h3>
                <p>In compliance with Google Play Console & Apple App Store Policies, you have the right to request full
                    and permanent deletion of your account and server records:</p>
                <div class="callout callout-warning">
                    <strong>Account Deletion Request:</strong> You can submit a permanent deletion request via our
                    official <a href="https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform" target="_blank" rel="noopener noreferrer">Google Form</a>
                    or email <a href="mailto:hello.theoriongd@connify.app"><strong>hello.theoriongd@connify.app</strong></a>. Upon verification, all
                    user profile records, server logs, guardian links, and cryptographic device registrations will be
                    permanently purged within <strong>48 hours</strong>.
                </div>
            </section>

            <!-- Section 8 -->
            <section id="section-8" class="policy-section">
                <h2>8. Data Security Measures</h2>
                <p>We implement robust technical and organizational security measures:</p>
                <ul>
                    <li><strong>End-to-End Cryptography:</strong> Ephemeral trust capsules and challenge nonces signed
                        using TweetNaCl Ed25519 signatures.</li>
                    <li><strong>Secure Transport Layer:</strong> All network API calls and real-time socket streams run
                        over HTTPS and Secure WebSockets (WSS).</li>
                    <li><strong>Sanitized Logging:</strong> Telemetry and error logs are stripped of sensitive personal
                        identifiers.</li>
                </ul>
            </section>

            <!-- Section 9 -->
            <section id="section-9" class="policy-section">
                <h2>9. Children’s Privacy</h2>
                <p>Connify is intended for general audiences. We do not knowingly collect personal information from
                    children under the age of 13 (or 16 in certain jurisdictions) without parental or guardian
                    oversight. If you believe a minor has registered an account without parental consent, please contact
                    us at <strong>hello.theoriongd@connify.app </strong> to request immediate data deletion.</p>
            </section>

            <!-- Section 10 -->
            <section id="section-10" class="policy-section">
                <h2>10. Changes to This Privacy Policy</h2>
                <p>We may update this Privacy Policy periodically to reflect new features, security enhancements, or
                    legal requirements. Material changes will be communicated via in-app notifications or email updates.
                </p>
            </section>

            <!-- Section 11 -->
            <section id="section-11" class="policy-section">
                <h2>11. Contact & Privacy Inquiries</h2>
                <p>For questions, feedback, or data privacy requests regarding this Privacy Policy, please contact our
                    Data Protection Officer:</p>
                <div class="contact-card">
                    <div class="contact-item">
                        <span>📧</span> <strong>Email:</strong> <a
                            href="mailto:hello.theoriongd@gmail.com">hello.theoriongd@gmail.com</a>
                    </div>
                    <div class="contact-item">
                        <span>🌐</span> <strong>Official Website:</strong> <a href="https://connify-green.vercel.app"
                            target="_blank">connify-green.vercel.app</a>
                    </div>
                    <div class="contact-item">
                        <span>💻</span> <strong>GitHub Repository:</strong> <a
                            href="https://github.com/TheOrionGD/Connify-APP"
                            target="_blank">github.com/TheOrionGD/Connify-APP</a>
                    </div>
                </div>
            </section>

        </main>
    </div>

    <!-- Back to Top Button -->
    <a href="#" class="back-to-top" title="Back to Top">↑</a>

    <!-- Footer -->
    <footer>
        <p>&copy; 2026 Connify Safety Network. All rights reserved.</p>
        <p style="margin-top:6px; font-size:0.8rem;">Decentralized P2P Emergency & Personal Safety Infrastructure</p>
    </footer>

</body>

</html>
}
```

