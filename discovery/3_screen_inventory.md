# 3. Screen Inventory

This inventory registers all screens present in the design specification directories, detailing their client target (Mobile App vs. Web Portal), primary functions, visual components, icons, actions, and custom style rules.

## 3.1 Design System Color Token Registry
Across the design templates, the active design token palette uses the Material 3 schema:

* **Primary**: `#b60100` (Main crimson brand color)
* **Secondary**: `#5e604d` (Dark neutral olive accent)
* **Tertiary**: `#0051c6` (Deep cobalt blue accent)
* **Background / Surface**: `#f9f9f9`
* **Error**: `#ba1a1a`
* **Surface Containers**: Lowest (`#ffffff`), Low (`#f3f3f3`), Standard (`#eeeeee`), High (`#e8e8e8`), Highest (`#e2e2e2`).
* **Text on Tokens**: `on-primary` (`#ffffff`), `on-secondary` (`#ffffff`), `on-background` / `on-surface` (`#1b1b1b`).

---

## 3.2 Mobile Application Screen Registry

### 3.2.1 welcome_to_connify
* **Asset Location**: [welcome_to_connify/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/welcome_to_connify/)
* **Client Target**: Mobile App (iOS / Android)
* **Purpose**: Onboarding entry page introducing the zero-trust proximity protocol.
* **Key Components**:
  * Title: "Welcome to Connify — Safety Coordinated by those Nearby"
  * Action Checklist: Explicit permission requests for location access, camera utilization, and push notifications.
  * Form Field: Acceptance checkbox for terms & conditions and privacy policies.
  * Main CTA: "GET STARTED" button with trailing arrow icon.
* **v2.0 Updates**: Firebase Anonymous Auth initializes silently on launch (`signInAnonymously()`). Device fingerprint and Ed25519 key pair are generated and stored in hardware-backed secure storage.
* **Icons Used**: `emergency_share`, `group`, `share_location`, `location_on`, `notifications_active`, `arrow_forward`, `sync`.

### 3.2.2 connify_mobile_home
* **Asset Location**: [connify_mobile_home/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/connify_mobile_home/)
* **Client Target**: Mobile App
* **Purpose**: Safety profile initialization screen — now includes mandatory guardian registration prompt.
* **Key Components**:
  * Action CTA: "Get Started" and "Start My Safety Profile".
  * **v2.0 Update**: "Complete Your Profile" and "Add Emergency Guardian" CTA cards to initiate `POST /api/profile/upgrade`.
  * Explanation cards: Detail local keys and privacy-first outcome logging.
* **Icons Used**: `emergency`, `record_voice_over`, `volunteer_activism`, `verified_user`, `location_off`, `history_toggle_off`, `lock`, `stars`, `notification_important`, `history`, `settings`.

### 3.2.3 dashboard
* **Asset Location**: [dashboard/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/dashboard/)
* **Client Target**: Mobile App
* **Purpose**: Main action screen for the active session.
* **Key Components**:
  * Split CTA Buttons: "I NEED HELP" (primary alert creator — **blocked if guardian not registered**) and "I CAN HELP" (feed of local requests).
  * Safe Session Timer Card: Shows a countdown timer with action "I'M SAFE" or "+5 MIN" duration extensions.
  * High-priority trigger: "EMERGENCY SOS" button (press & hold).
  * **v2.0 Update**: GPS Watchdog status indicator — shows live 5s ping status and last known location sync timestamp.
* **Buttons**: `EMERGENCY`, `I NEED HELP`, `I CAN HELP`, `I'M SAFE`, `+5 MIN`, `HOLD TO TRIGGER`.

### 3.2.4 new_help_request
* **Asset Location**: [new_help_request/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/new_help_request/)
* **Client Target**: Mobile App
* **Purpose**: Request Creator form specifying coordinates, categories, and urgency.
* **Key Components**:
  * Category Quick-Select Grid: "Medical", "Security", "Transport", and "Other".
  * Form Elements: Urgency range slider (1 to 5) and contextual details input.
  * Main Action: "BROADCAST REQUEST" with radial broadcast icon.
  * **v2.0 Update**: Request is blocked at backend if: (a) no guardian registered, (b) device is quarantined, or (c) velocity trap limit reached (≥ 3 episodes in 10 minutes).
* **Buttons**: `arrow_back`, `EMERGENCY`, `Medical`, `Security`, `Transport`, `Other`, `BROADCAST REQUEST`.

### 3.2.5 verify_identity
* **Asset Location**: [verify_identity/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/verify_identity/)
* **Client Target**: Mobile App
* **Purpose**: Presenting verification QR code and environmental parameters to establish initial handshake.
* **Key Components**:
  * QR Code container: Dynamically rendered vector QR containing syndromes.
  * Status bars: Device consistency status, network parameters (Wi-Fi), and proximity indicators.
  * CTA Override: "MANUAL VERIFICATION" button.
* **Icons Used**: `arrow_back`, `signal_cellular_alt`, `location_on`, `battery_charging_full`, `home`, `history`, `settings`.

### 3.2.6 searching_for_help
* **Asset Location**: [searching_for_help/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/searching_for_help/)
* **Client Target**: Mobile App
* **Purpose**: Real-time matching page.
* **Key Components**:
  * Status layout: Spinner animation showing "Searching for verified helpers..."
  * Secondary Action: "Cancel Request" to terminate active episode instantly.
  * **v2.0 Update**: 5-second GPS Watchdog is actively pinging `POST /api/locations/ping` during this state. GPS status badge visible.

### 3.2.7 nearby_requests
* **Asset Location**: [nearby_requests/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/nearby_requests/)
* **Client Target**: Mobile App
* **Purpose**: Feed of anonymized open requests for users in "I Can Help" mode — filtered by 5-Pillar Harmlessness Score.
* **Key Components**:
  * Proximity Request Cards: Category indicator (e.g. Medical Services), general rough distance (e.g. ~350m), and urgency indicator.
  * **v2.0 Update**: Cards from quarantined or velocity-flagged senders are hidden by the `BehavioralRiskEngine`.
  * Actions: "Respond Now", "Offer Support", and "Scan Wider Range (2km+)".
* **Icons Used**: `arrow_back`, `refresh`, `location_on`, `directions_walk`, `shield`, `medical_services`, `home`, `history`, `settings`.

### 3.2.8 accept_verify
* **Asset Location**: [accept_verify/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/accept_verify/)
* **Client Target**: Mobile App
* **Purpose**: Helper accepting a request and navigating to the site.
* **Key Components**:
  * Proximity map frame and navigation routes.
  * Status panel: "Arrived at Scene" marker.
  * Ephemeral messaging panel: "Contact Sarah" quick link.

### 3.2.9 accept_verify_handshake
* **Asset Location**: [accept_verify_handshake/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/accept_verify_handshake/)
* **Client Target**: Mobile App
* **Purpose**: Executes the SHARP location verification checks.
* **Key Components**:
  * Proximity Verification gauges: Signals Wi-Fi beacon matching, device consistency validation, and GPS correlation.
  * Main CTA: "ISSUE TRUST CAPSULE" enabled upon check resolution.
  * **v2.0 Update**: "REPORT THREAT" / "PANIC ABORT" button — triggers `POST /api/episodes/:id/threat-abort`. Increments sender's `suspiciousCount`; quarantines on ≥ 2 reports.

### 3.2.10 active_episode_you
* **Asset Location**: [active_episode_you/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/active_episode_you/)
* **Client Target**: Mobile App (Requester view)
* **Purpose**: Active emergency episode tracking for the request creator.
* **Key Components**:
  * Core parameters: Countdown timer for the Trust Capsule, verified badge, and helper proximity marker.
  * Quick Comms panel: "CHAT" and "CALL" shortcuts.
  * Completion CTA: "Complete Episode" or "Report Issue".
  * **v2.0 Update**: GPS Watchdog ping indicator (5s pulse). Guardian SMS status badge ("Guardian Notified" / "Signal Active").

### 3.2.11 active_episode_helper
* **Asset Location**: [active_episode_helper/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/active_episode_helper/)
* **Client Target**: Mobile App (Helper view)
* **Purpose**: Active tracking dashboard for the responder.
* **Key Components**:
  * Proximity maps and route directions.
  * Trust Capsule expiration countdown.
  * Core action: "Complete Episode" once safety is established.

### 3.2.12 protocol_feedback
* **Asset Location**: [protocol_feedback/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/protocol_feedback/)
* **Client Target**: Mobile App
* **Purpose**: Post-episode feedback capturing.
* **Key Components**:
  * **v2.0 Update**: Three-way outcome selection: `SAFE_RESOLVED`, `SUSPICIOUS_BEHAVIOR`, `ACTIVE_THREAT`.
  * Auto-quarantine triggered if outcome logged as `SUSPICIOUS_BEHAVIOR` and sender's `suspiciousCount` reaches ≥ 2.
  * Submission: "SUBMIT & CLOSE EPISODE" purging local session traces.

### 3.2.13 episode_history
* **Asset Location**: [episode_history/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/episode_history/)
* **Client Target**: Mobile App
* **Purpose**: Minimal records of previous sessions.
* **Key Components**:
  * Logs list: Shows only dates, categories, outcomes (Resolved/Unresolved), and anonymized identifiers. No track logs, names, or addresses.
  * CTA: "PROVIDE FEEDBACK" or "SUBMIT EVALUATION".

### 3.2.14 settings_governance
* **Asset Location**: [settings_governance/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/settings_governance/)
* **Client Target**: Mobile App
* **Purpose**: Privacy settings, device key config, and data control board.
* **Key Components**:
  * Section buttons: "Privacy & Data Settings", "Device & Key Management", "Witness & Contact Config", "About the Protocol".
  * Core actions: "Purge Local Logs", "Rotate Device Keys", and "+ Manage" witness contacts.
  * **v2.0 Update**: "Emergency Guardian" section — add/update guardian full name, phone number, and relationship. Mandatory field; prompts until registered.

### 3.2.15 emergency_mode
* **Asset Location**: [emergency_mode/](file:///o:/PROJECTS/CONNIFY-APP/App%20UI/emergency_mode/)
* **Client Target**: Mobile App
* **Purpose**: Quick-override emergency operations screen.
* **Key Components**:
  * CTAs: "EMERGENCY BROADCAST", "CALL EMERGENCY SERVICES", and "START AUDIO RECORDING".
  * Multi-signal widgets showing environmental status and device key logs.
  * **v2.0 Update**: Guardian SMS is dispatched immediately on SOS trigger with last MongoDB-stored GPS coordinates.

---

## 3.3 Web Portal / Desktop Landing Pages

### 3.3.1 connify_splash_screen_desktop / refined_splash_screen_desktop
* **Client Target**: Web / Desktop Landing Portal
* **Purpose**: Secure entryway and server status splash page.

### 3.3.2 connify_mobile_web / connify_safety_coordination_protocol / connify_trusted_safety_coordination / connify_trustworthy_safety_protocol
* **Client Target**: Web / Marketing Portal
* **Purpose**: Landing pages showing how Connify provides "Urgent Serenity" using secure, local coordination.
* **v2.0 Updates**: Feature pillars now include **5-Pillar Harmlessness Engine**, **5s GPS Watchdog & Guardian SMS**, and **Anonymous → Registered Profile Migration** prominently in the `SafetyProtocolFeatures` section.
* **Metrics Bar**: `27/27 Tests · 5s GPS Watchdog · 5-Pillar Harmlessness · Ed25519 Signing`.

### 3.3.3 features_governance_connify_safety / protocol_features_connify_safety / how_it_works_connify_protocol / privacy_governance_connify
* **Client Target**: Web / Trust & Protocol Documentation
* **Purpose**: Interactive user manuals explaining zero-trust tokens, Bloom filters, 5-Pillar Harmlessness Engine, GPS Watchdog, and outcome logging.
