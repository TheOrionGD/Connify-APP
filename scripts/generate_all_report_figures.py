import os
import shutil
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

def setup_style():
    plt.rcParams['font.sans-serif'] = 'Arial'
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['axes.edgecolor'] = '#CBD5E1'
    plt.rcParams['axes.linewidth'] = 1.2

def save_fig(fig, filename, out_dirs):
    for out_dir in out_dirs:
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, filename)
        fig.savefig(path, dpi=300, bbox_inches='tight', facecolor='#F8FAFC')
    plt.close(fig)

def draw_card(ax, x, y, w, h, title, body_text="", border_color="#0284C7", bg_color="#FFFFFF"):
    rect = mpatches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.03,rounding_size=0.1",
                                  facecolor=bg_color, edgecolor=border_color, linewidth=1.5)
    ax.add_patch(rect)
    if title:
        ax.text(x + 0.1, y + h - 0.25, title, fontsize=10, fontweight='bold', color='#0F172A', va='top')
    if body_text:
        ax.text(x + 0.1, y + h - 0.5, body_text, fontsize=8, color='#334155', va='top', wrap=True)

def draw_flow_arrow(ax, x1, y1, x2, y2, label=""):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->,head_width=0.3,head_length=0.5", color="#0284C7", lw=1.5))
    if label:
        mid_x, mid_y = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mid_x, mid_y + 0.1, label, fontsize=8, color="#0284C7", fontweight='bold', ha='center', va='bottom')

def generate_all_figures():
    setup_style()
    out_dirs = [
        r"o:\PROJECTS\CONNIFY-APP\report_figures",
        r"o:\PROJECTS\CONNIFY-APP\docs\report_figures"
    ]

    # -------------------------------------------------------------
    # Fig 3.1: Monorepo Software Architecture
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.1: High-Level Monorepo Software Architecture Diagram", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    draw_card(ax, 0.5, 1.0, 3.4, 5.0, "Mobile Client (apps/mobile)", "• React Native 0.86 / Expo 57\n• TypeScript 5.8 / Zustand 5\n• SHARP Protocol Engine\n• Hardware KeyStore (Ed25519)\n• WebRTC VoIP & Socket.io\n• Auxiliary Trust & Safety Suite", border_color="#0284C7")
    draw_card(ax, 4.3, 1.0, 3.4, 5.0, "Backend Server (api/backend)", "• Fastify 5.10 / Node.js 22\n• Prisma ORM 6.4 & MongoDB\n• REST API & Auth Guards\n• Socket.io Event Dispatcher\n• Cryptographic Audit Chain\n• Admin Health & Chain Repair", border_color="#4F46E5")
    draw_card(ax, 8.1, 1.0, 3.4, 5.0, "Protocol Specs (packages/crypto)", "• SHARP Protocol Specs\n• Galois Field GF(2^4) BCH Engine\n• 1024-bit Bloom Filter Vectorizer\n• FNV-1a Hash Matrix\n• Project CPM Analytics\n• Google Play Store Metadata", border_color="#059669")

    draw_flow_arrow(ax, 3.9, 4.5, 4.3, 4.5, "REST API (HTTP)")
    draw_flow_arrow(ax, 4.3, 3.0, 3.9, 3.0, "WebSocket (Socket.io)")
    draw_flow_arrow(ax, 7.7, 3.5, 8.1, 3.5, "Shared Schemas")

    save_fig(fig, "figure_3_1.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.2: SHARP Protocol Proximity Handshake
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.2: SHARP Protocol Zero-Knowledge Proximity Handshake Sequence", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    
    steps = [
        "1. GPS Quantize (3 Decimals)", "2. 1024-bit Bloom Vector", "3. GF(2^4) BCH Encode",
        "4. Wire Transmission (Syndromes)", "5. Server Broadcast", "6. Peer Local GPS Capture",
        "7. Asymmetric BCH Decode", "8. Blinded Hash Verification", "9. Mutual QR Code Handshake"
    ]
    for i, step in enumerate(steps):
        col = i % 3
        row = i // 3
        x = 0.6 + col * 3.8
        y = 4.8 - row * 1.8
        draw_card(ax, x, y, 3.2, 1.2, f"Step {i+1}", step, border_color="#0284C7" if i%2==0 else "#4F46E5")
        if col < 2:
            draw_flow_arrow(ax, x + 3.2, y + 0.6, x + 3.8, y + 0.6, "--->")

    save_fig(fig, "figure_3_2.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.3: Use Case Diagram
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.3: Use Case Diagram for Connify Mobile Platform", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    draw_card(ax, 0.5, 3.5, 2.2, 2.5, "Actor: Requester", "Mobile user seeking ZK spatial social discovery or co-presence.", border_color="#0284C7")
    draw_card(ax, 0.5, 0.5, 2.2, 2.5, "Actor: Peer", "Co-located nearby user decoding BCH syndromes.", border_color="#059669")

    ucs = ["UC-1 Register Keypair", "UC-2 Create ZK Request", "UC-3 QR Handshake", "UC-4 WebRTC VoIP", "UC-5 Dead-Man Guard", "UC-6 115dB Siren", "UC-7 Fake Call", "UC-8 Hazard Map"]
    for i, uc in enumerate(ucs):
        col = i // 4
        row = i % 4
        x = 3.3 + col * 3.0
        y = 4.8 - row * 1.2
        draw_card(ax, x, y, 2.6, 0.9, uc, "", border_color="#4F46E5")
        draw_flow_arrow(ax, 2.7, 4.0 if row>1 else 2.0, x, y + 0.45, "")

    draw_card(ax, 9.3, 1.5, 2.2, 4.5, "Actor: Server", "Fastify Backend & MongoDB persistence.", border_color="#D97706")
    draw_flow_arrow(ax, 8.9, 3.5, 9.3, 3.5, "")

    save_fig(fig, "figure_3_3.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.4: Level-0 DFD
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.4: Level-0 Context Data Flow Diagram (DFD)", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    draw_card(ax, 4.2, 2.2, 3.6, 2.6, "0.0 CONNIFY SYSTEM", "Central process routing ZK syndromes, blinded grid hashes, & audit entries.", border_color="#0284C7")
    draw_card(ax, 0.5, 3.8, 2.8, 1.8, "Requester Device", "Sends GPS Syndromes", border_color="#4F46E5")
    draw_card(ax, 0.5, 1.0, 2.8, 1.8, "Peer Device", "Sends Decoded Proofs", border_color="#059669")
    draw_card(ax, 8.7, 2.2, 2.8, 2.6, "MongoDB Database", "Stores schema records", border_color="#D97706")

    draw_flow_arrow(ax, 3.3, 4.7, 4.2, 3.8, "Syndromes")
    draw_flow_arrow(ax, 3.3, 1.9, 4.2, 2.8, "Proofs")
    draw_flow_arrow(ax, 7.8, 3.5, 8.7, 3.5, "CRUD Data")

    save_fig(fig, "figure_3_4.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.5: Level-1 DFD
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.5: Level-1 Detailed Data Flow Diagram (DFD)", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    nodes = [
        ("1.1 Quantizer", "Base Grids"), ("1.2 Bloom Vectorizer", "1024-bit Filter"), ("1.3 Syndrome Engine", "BCH Syndromes"),
        ("1.4 Asymmetric Decoder", "Decoded Proof"), ("1.5 Hash Matcher", "Validated Match"), ("1.6 Capsule Issuer", "Signed Capsule")
    ]
    for i, (title, desc) in enumerate(nodes):
        col = i % 3
        row = i // 3
        x = 0.8 + col * 3.8
        y = 4.2 - row * 2.2
        draw_card(ax, x, y, 3.0, 1.6, title, desc, border_color="#0284C7" if i<3 else "#059669")
        if col < 2:
            draw_flow_arrow(ax, x + 3.0, y + 0.8, x + 3.8, y + 0.8, "--->")

    save_fig(fig, "figure_3_5.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.6: System Class Diagram
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.6: System Class Diagram", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    classes = [
        ("authStore", "- deviceId: string\n+ signPayload()"), ("episodeStore", "- activeEpisode: Episode\n+ createEpisode()"),
        ("secureKeyService", "- secretKey: string\n+ generateKeypair()"), ("sharp Math Engine", "- gfPoly: 0x13\n+ generateSyndromes()"),
        ("EpisodeController", "- prisma: PrismaClient\n+ createEpisode()"), ("CapsuleController", "- nacl: TweetNaCl\n+ verifyQrHandshake()")
    ]
    for i, (cname, cbody) in enumerate(classes):
        col = i % 3
        row = i // 3
        x = 0.8 + col * 3.8
        y = 4.2 - row * 2.2
        draw_card(ax, x, y, 3.2, 1.7, f"Class: {cname}", cbody, border_color="#4F46E5")
        if col < 2:
            draw_flow_arrow(ax, x + 3.2, y + 0.85, x + 3.8, y + 0.85, "")

    save_fig(fig, "figure_3_6.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.7: Sequence Diagram
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.7: Sequence Diagram for Zero-Knowledge Handshake & Capsule Issuance", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    seq_steps = [
        "1. Client A ---> POST /api/devices/register", "2. Client A ---> POST /api/episodes (Syndromes)",
        "3. Fastify ---> Socket.io emit('new_episode_available')", "4. Client B ---> POST /api/capsules/issue (BCH Proof)",
        "5. Fastify ---> Returns Signed Capsule Token", "6. Client A <===> Client B (Offline Mutual QR Scan)",
        "7. Client A ---> POST /api/capsules/verify-qr", "8. Fastify ---> Appends record to SHA-256 Audit Log Chain"
    ]
    for i, step in enumerate(seq_steps):
        col = i % 2
        row = i // 2
        x = 0.8 + col * 5.7
        y = 5.0 - row * 1.1
        draw_card(ax, x, y, 5.2, 0.85, f"Step {i+1}", step, border_color="#0284C7" if col==0 else "#059669")

    save_fig(fig, "figure_3_7.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.8: State Machine Diagram
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.8: State Machine Diagram for Active Episode Lifecycle", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    states = [
        ("PENDING", "Syndromes broadcasted", "#0284C7"), ("MATCHED", "Capsule issued", "#4F46E5"),
        ("ACTIVE", "Peer interaction live", "#059669"), ("COMPLETED", "QR handshake scanned", "#D97706"),
        ("EXPIRED", "15-min timer elapsed", "#64748B"), ("CANCELLED", "User cancelled request", "#E11D48")
    ]
    for i, (st, desc, color) in enumerate(states):
        col = i % 3
        row = i // 3
        x = 0.8 + col * 3.8
        y = 4.2 - row * 2.2
        draw_card(ax, x, y, 3.2, 1.6, f"State: {st}", desc, border_color=color)
        if col < 2 and row == 0:
            draw_flow_arrow(ax, x + 3.2, y + 0.8, x + 3.8, y + 0.8, "--->")

    save_fig(fig, "figure_3_8.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.9: Dual-Mode Network Stack
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.9: Component Diagram for Hybrid Dual-Mode Networking Stack", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    draw_card(ax, 0.6, 1.0, 5.0, 5.0, "ONLINE CLOUD STACK", "• HTTPS REST API (Fastify 5.10)\n• Socket.io Bi-Directional WSS\n• WebRTC Peer-to-Peer VoIP Audio\n• Notifee & Firebase Push Alarms\n• MongoDB Document Storage", border_color="#0284C7")
    draw_card(ax, 6.4, 1.0, 5.0, 5.0, "OFFLINE RESILIENT STACK", "• Wi-Fi mDNS Service Discovery\n• Direct TCP Socket Pair Driver\n• Bluetooth Low Energy (BLE) Mesh\n• Encrypted Payload SMS Formatter\n• Offline Storage Queue", border_color="#059669")
    draw_flow_arrow(ax, 5.6, 3.5, 6.4, 3.5, "<===>")

    save_fig(fig, "figure_3_9.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 3.10: Entity-Relationship (ER) Diagram
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 3.10: Entity-Relationship (ER) Diagram for MongoDB / Prisma Schema", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    models = [
        ("Device", "id (PK)\ndeviceFingerprintHash (UQ)\npublicKey"), ("Episode", "id (PK)\nrequesterDeviceId (FK)\nblindedGridSigs (BCH)"),
        ("Capsule", "id (PK)\nepisodeId (FK)\nsignedTokenHash"), ("Outcome", "id (PK)\nepisodeId (FK)\nresult, riskLevel"),
        ("AuditLog", "id (PK)\nprevHash (SHA256)\nentryHash (SHA256)"), ("Profile", "id (PK)\ndeviceId (FK, UQ)\nfirstName, lastName")
    ]
    for i, (mname, mfields) in enumerate(models):
        col = i % 3
        row = i // 3
        x = 0.8 + col * 3.8
        y = 4.2 - row * 2.2
        draw_card(ax, x, y, 3.2, 1.6, f"Model: {mname}", mfields, border_color="#D97706")
        if col < 2:
            draw_flow_arrow(ax, x + 3.2, y + 0.8, x + 3.8, y + 0.8, "1:N")

    save_fig(fig, "figure_3_10.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 4.1: UI Wireframe Layout Structure
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 4.1: Atomic Component Layout Structure for Social Discovery Dashboard", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    draw_card(ax, 0.8, 0.8, 10.4, 5.2, "Social Discovery Dashboard Wireframe Layout", "", border_color="#0284C7")
    draw_card(ax, 1.1, 5.0, 9.8, 0.6, "Header Bar", "Brand Logo + Status Pill + Security Fingerprint", border_color="#0284C7")
    draw_card(ax, 1.1, 3.6, 9.8, 1.2, "Category Selection Grid", "[ Social Connection ]  [ Event Meetup ]  [ Co-Presence ]  [ Activity Partner ]  [ Walk-Together ]", border_color="#4F46E5")
    draw_card(ax, 1.1, 2.2, 4.7, 1.2, "Search Radius & Urgency", "Radius Slider (100m-1000m) & Urgency Level (1-5)", border_color="#059669")
    draw_card(ax, 6.2, 2.2, 4.7, 1.2, "Radar Visualizer", "Pulse Wave Animation & ZK Broadcast Button", border_color="#D97706")
    draw_card(ax, 1.1, 1.0, 9.8, 1.0, "Safety Quick-Action Dock", "[ Acoustic Siren ]   [ Timed Guard ]   [ Fake Call ]   [ Hazard Map ]", border_color="#D97706")

    save_fig(fig, "figure_4_1.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 4.2: Cryptographic Key Generation Pipeline
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 4.2: Cryptographic Key Generation & Keychain Hardware Binding Pipeline", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    pipe = [
        ("1. App Launch", "Identity Check"), ("2. TweetNaCl Gen", "Ed25519 Keypair"), ("3. Keychain Store", "KeyStore Persistence"),
        ("4. Biometric Guard", "Fingerprint / FaceID"), ("5. Challenge Sign", "Detached Signature"), ("6. JWT Issuance", "Fastify Authorization")
    ]
    for i, (ptitle, pbody) in enumerate(pipe):
        col = i % 3
        row = i // 3
        x = 0.8 + col * 3.8
        y = 4.2 - row * 2.2
        draw_card(ax, x, y, 3.2, 1.6, ptitle, pbody, border_color="#0284C7")
        if col < 2:
            draw_flow_arrow(ax, x + 3.2, y + 0.8, x + 3.8, y + 0.8, "--->")

    save_fig(fig, "figure_4_2.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 4.3: Hash-Chained Audit Ledger Structure
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 4.3: Append-Only Hash-Chained Audit Ledger Structure (prevHash ---> entryHash)", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    blocks = [
        ("Block N-1: EPISODE_CREATED", "prevHash: 00000000...\nentryHash: a1b2c3d4..."),
        ("Block N: CAPSULE_REDEEMED", "prevHash: a1b2c3d4...\nentryHash: f6e5d4c3..."),
        ("Block N+1: EPISODE_COMPLETED", "prevHash: f6e5d4c3...\nentryHash: 9x8y7z6w...")
    ]
    for i, (btitle, bbody) in enumerate(blocks):
        x = 0.8 + i * 3.8
        draw_card(ax, x, 2.0, 3.2, 3.2, btitle, bbody, border_color="#D97706")
        if i < 2:
            draw_flow_arrow(ax, x + 3.2, 3.6, x + 3.8, 3.6, "--->")

    ax.text(6, 1.2, "Invariant: entryHash = SHA256(prevHash + eventType + episodeId + timestamp)", fontsize=10, color="#0284C7", ha='center', fontweight='bold')

    save_fig(fig, "figure_4_3.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 5.1: Backend Integration Test Output
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 5.1: Backend Integration Test Suite Execution Output (39/39 Pass)", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    draw_card(ax, 0.8, 1.0, 3.6, 5.0, "Test Metrics Summary", "• Total Test Suites: 9 Passed\n• Total Tests: 39 Passed (100%)\n• Failures: 0 Failed\n• Duration: 12.3 Seconds\n• Framework: Node Native Runner\n• Target: Fastify 5.10 + MongoDB", border_color="#059669")
    draw_card(ax, 4.8, 1.0, 6.4, 5.0, "Verified Route Groups (39 Endpoints)", "• 1. Device Registration (/api/devices/register) ---> PASS\n• 2. Device Challenge & Auth (/api/auth) ---> PASS\n• 3. Server Health Endpoint (/api/health) ---> PASS\n• 4. Geofence Locations (/api/locations) ---> PASS\n• 5. ZK Episode Lifecycle (/api/episodes) ---> PASS\n• 6. Helper Capsule Operations (/api/capsules) ---> PASS\n• 7. Outcome Audit Logging (/api/outcomes) ---> PASS\n• 8. Admin Dashboard (/api/admin/dashboard) ---> PASS\n• 9. Audit Chain & Healing Simulation ---> PASS", border_color="#0284C7")

    save_fig(fig, "figure_5_1.png", out_dirs)

    # -------------------------------------------------------------
    # Fig 5.2: UI Screenshot Inventory Checklist
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6.75))
    fig.patch.set_facecolor('#F8FAFC')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    ax.text(6, 6.5, "Figure 5.2: Application Interface Layout Screenshot Inventory Checklist", fontsize=14, fontweight='bold', color='#0284C7', ha='center')
    screens = [
        "1. Welcome Onboarding", "2. Requester Dashboard", "3. ZK Request Creation", "4. Proximity Searching Radar",
        "5. Nearby Peer Requests", "6. Handshake QR Generator", "7. Active Connection View", "8. Unified Safety Hub",
        "9. 115dB Acoustic Siren", "10. Fake Call Simulator", "11. Timed Safety Guard", "12. Community Hazard Map",
        "13. Governance & Audit"
    ]
    for i, sc in enumerate(screens):
        col = i % 4
        row = i // 4
        x = 0.6 + col * 2.85
        y = 4.8 - row * 1.3
        draw_card(ax, x, y, 2.6, 1.0, f"Screen {i+1}", sc, border_color="#4F46E5")

    save_fig(fig, "figure_5_2.png", out_dirs)

    print("All 15 figures successfully generated as clean light-theme PNG images in:")
    for d in out_dirs:
        print(f"- {d}")

if __name__ == "__main__":
    generate_all_figures()
