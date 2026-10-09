import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Clean Light Theme Colors
    BG_LIGHT = RGBColor(248, 250, 252)        # #F8FAFC
    CARD_WHITE = RGBColor(255, 255, 255)      # #FFFFFF
    CARD_SUBTLE = RGBColor(241, 245, 249)     # #F1F5F9
    TEXT_DARK = RGBColor(15, 23, 42)          # #0F172A
    TEXT_MUTED = RGBColor(71, 85, 105)        # #475569
    TEXT_BODY = RGBColor(51, 65, 85)          # #334155
    
    # Accent Colors (Light Theme Optimized)
    BLUE = RGBColor(2, 132, 199)              # #0284C7
    INDIGO = RGBColor(79, 70, 229)            # #4F46E5
    EMERALD = RGBColor(5, 150, 105)           # #059669
    AMBER = RGBColor(217, 119, 6)             # #D97706
    ROSE = RGBColor(225, 29, 72)              # #E11D48
    BORDER_GRAY = RGBColor(203, 213, 225)     # #CBD5E1

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_LIGHT
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, subtitle_text):
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.9))
        tf = txBox.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = BLUE
        
        p2 = tf.add_paragraph()
        p2.text = subtitle_text
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_MUTED

    def add_card(slide, left, top, width, height, title, bg_color=CARD_WHITE, border_color=BORDER_GRAY):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
        
        if title:
            txBox = slide.shapes.add_textbox(Inches(left + 0.15), Inches(top + 0.1), Inches(width - 0.3), Inches(0.4))
            tf = txBox.text_frame
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = TEXT_DARK
        return shape

    def add_box_with_text(slide, left, top, width, height, text, bg_color=CARD_WHITE, text_color=TEXT_BODY, font_size=10, border_color=BORDER_GRAY):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
        tf = shape.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = text
        p.font.size = Pt(font_size)
        p.font.color.rgb = text_color
        p.font.bold = True
        return shape

    def add_arrow_connector(slide, left, top, width, height, direction="right", color=BLUE):
        shape = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW if direction=="right" else MSO_SHAPE.DOWN_ARROW, Inches(left), Inches(top), Inches(width), Inches(height))
        shape.fill.solid()
        shape.fill.fore_color.rgb = color
        shape.line.fill.background()
        return shape

    def add_flow_hyphen(slide, left, top, width, height, text="--->"):
        txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
        tf = txBox.text_frame
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = text
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = BLUE

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide (Light Theme)
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)
    
    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(3.5))
    tf = tbox.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = "CONNIFY PLATFORM ARCHITECTURE & FLOW DIAGRAMS"
    p.font.size = Pt(30)
    p.font.bold = True
    p.font.color.rgb = BLUE
    
    p2 = tf.add_paragraph()
    p2.text = "Zero-Knowledge Spatial Social & Communication Initialization Platform between Strangers"
    p2.font.size = Pt(17)
    p2.font.color.rgb = TEXT_DARK
    p2.space_before = Pt(15)

    p3 = tf.add_paragraph()
    p3.text = "Complete Light Theme Editable Diagrams (Figures 3.1 to 5.2) with Flow Connectors & Hyphens\nBased on Production Monorepo Specification & Google Play Store Package com.connify"
    p3.font.size = Pt(13)
    p3.font.color.rgb = TEXT_MUTED
    p3.space_before = Pt(20)

    # -------------------------------------------------------------
    # SLIDE 2: Figure 3.1 - High-Level Monorepo System Architecture
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Figure 3.1: High-Level Monorepo System Architecture Diagram", "Monorepo Workspace Decoupling & Network Payload Flow")

    add_card(s2, 0.8, 1.5, 3.6, 5.2, "Connify Mobile Client (Connify/)", bg_color=CARD_WHITE, border_color=BLUE)
    add_card(s2, 4.8, 1.5, 3.7, 5.2, "Fastify Backend Server (backend/)", bg_color=CARD_WHITE, border_color=INDIGO)
    add_card(s2, 8.8, 1.5, 3.7, 5.2, "Patent & Cryptographic Specs (patent/)", bg_color=CARD_WHITE, border_color=EMERALD)

    # Flow arrows between columns
    add_flow_hyphen(s2, 4.25, 3.8, 0.7, 0.4, "--->")
    add_flow_hyphen(s2, 8.35, 3.8, 0.6, 0.4, "--->")

    m_items = ["React Native 0.86 / Expo 57", "TypeScript 5.8 / Zustand 5", "SHARP Protocol Client Engine", "Hardware KeyStore (Ed25519)", "WebRTC VoIP & Socket.io Client", "Auxiliary Trust & Safety Suite"]
    for i, item in enumerate(m_items):
        add_box_with_text(s2, 1.0, 2.1 + (i * 0.7), 3.2, 0.55, item, bg_color=CARD_SUBTLE, text_color=TEXT_DARK, font_size=10, border_color=BLUE)

    b_items = ["Fastify 5.10 / Node.js 22", "Prisma ORM 6.4 & MongoDB", "REST API & Auth Middleware", "Socket.io Real-Time Dispatcher", "Cryptographic Audit Chain", "Admin Health & Chain Repair API"]
    for i, item in enumerate(b_items):
        add_box_with_text(s2, 5.0, 2.1 + (i * 0.7), 3.3, 0.55, item, bg_color=CARD_SUBTLE, text_color=TEXT_DARK, font_size=10, border_color=INDIGO)

    p_items = ["SHARP Protocol Specification", "BCH(15,7) GF(2^4) Math Code", "1024-bit Bloom Filter Vectorizer", "FNV-1a 32-bit Hash Matrix", "CPM Gantt & Project Analytics", "Google Play Store Metadata"]
    for i, item in enumerate(p_items):
        add_box_with_text(s2, 9.0, 2.1 + (i * 0.7), 3.3, 0.55, item, bg_color=CARD_SUBTLE, text_color=TEXT_DARK, font_size=10, border_color=EMERALD)

    # -------------------------------------------------------------
    # SLIDE 3: Figure 3.2 - SHARP Protocol Zero-Knowledge Handshake Flow
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Figure 3.2: SHARP Protocol Zero-Knowledge Proximity Handshake Sequence", "Step-by-Step Data Flow Diagram with Sequential Connectors")

    steps = [
        ("1. GPS Quantize", "Requester rounds GPS to 3 decimals & builds 9-cell grid"),
        ("2. Bloom Vector", "Hashes cells via FNV-1a into 1024-bit Bloom filter"),
        ("3. BCH Encoding", "Splits filter into 146 blocks; computes GF(2^4) syndromes"),
        ("4. Wire Transmission", "Transmits ONLY syndromes & SHA-256 blinded hashes to server"),
        ("5. Server Route", "Server routes syndromes to nearby peers without seeing raw location"),
        ("6. Peer GPS Capture", "Peer captures local GPS & builds local spatial Bloom filter"),
        ("7. Asymmetric Decode", "Peer combines local blocks + syndromes; fixes up to 2 bit errors"),
        ("8. Hash Verification", "Peer reconstructs Bloom filter & verifies blinded grid hashes"),
        ("9. QR Handshake", "Peers meet physically & scan offline QR code to redeem capsule")
    ]

    for i, (title, desc) in enumerate(steps):
        row = i // 3
        col = i % 3
        x = 0.8 + (col * 4.0)
        y = 1.5 + (row * 1.8)
        
        add_card(s3, x, y, 3.4, 1.5, f"Step {i+1}: {title}", bg_color=CARD_WHITE, border_color=BLUE if i%2==0 else INDIGO)
        
        txBox = s3.shapes.add_textbox(Inches(x + 0.15), Inches(y + 0.45), Inches(3.1), Inches(0.9))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_BODY

        # Add Flow Hyphens between steps
        if col < 2:
            add_flow_hyphen(s3, x + 3.4, y + 0.5, 0.6, 0.4, "--->")

    # -------------------------------------------------------------
    # SLIDE 4: Figure 3.3 - Use Case Flow Diagram
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Figure 3.3: Use Case Diagram for Connify Mobile Platform", "Actor Flow Diagram with Connection Hyphens")

    # Actors Left
    add_card(s4, 0.8, 1.5, 2.4, 2.4, "Actor: Requester", bg_color=CARD_WHITE, border_color=BLUE)
    add_box_with_text(s4, 0.9, 2.1, 2.2, 1.6, "Mobile User seeking ZK spatial social connection, meetup, or co-presence.", bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=BLUE)

    add_card(s4, 0.8, 4.2, 2.4, 2.5, "Actor: Peer / Helper", bg_color=CARD_WHITE, border_color=EMERALD)
    add_box_with_text(s4, 0.9, 4.8, 2.2, 1.7, "Co-located nearby user receiving syndromes, performing BCH decoding, & scanning QR.", bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=EMERALD)

    # Hyphens from Actors
    add_flow_hyphen(s4, 3.1, 2.5, 0.6, 0.4, "--->")
    add_flow_hyphen(s4, 3.1, 5.2, 0.6, 0.4, "--->")

    # Use Cases Center
    ucs = [
        "UC-1: Register Hardware Identity (Ed25519)",
        "UC-2: Create ZK Social Request (Syndromes)",
        "UC-3: Execute Offline QR Handshake Scan",
        "UC-4: Initiate WebRTC VoIP Audio Stream",
        "UC-5: Trigger Timed Dead-Man Safety Guard",
        "UC-6: Activate 115dB Siren & Visual Strobe",
        "UC-7: Simulate Realistic Fake Call",
        "UC-8: Report Community Hazard Map Marker"
    ]
    for i, uc in enumerate(ucs):
        col = i // 4
        row = i % 4
        x = 3.6 + (col * 3.5)
        y = 1.5 + (row * 1.3)
        add_box_with_text(s4, x, y, 3.2, 1.1, uc, bg_color=CARD_WHITE, text_color=TEXT_DARK, font_size=10, border_color=INDIGO)

    # Hyphen to Admin
    add_flow_hyphen(s4, 9.8, 3.8, 0.6, 0.4, "--->")

    # Actor Right
    add_card(s4, 10.3, 1.5, 2.3, 5.2, "Actor: Admin / Server", bg_color=CARD_WHITE, border_color=AMBER)
    admin_items = ["Fastify Server Logic", "UC-9: Monitor Audit Ledger", "UC-10: Simulate Chain Repair", "Prisma Database CRUD", "Socket.io Event Dispatch"]
    for i, item in enumerate(admin_items):
        add_box_with_text(s4, 10.4, 2.2 + (i * 0.9), 2.1, 0.7, item, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=AMBER)

    # -------------------------------------------------------------
    # SLIDE 5: Figure 3.4 - Level-0 Context DFD Flow
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Figure 3.4: Level-0 Context Data Flow Diagram (DFD)", "System Boundary, External Entities, and High-Level Information Flow")

    add_card(s5, 4.6, 2.5, 4.1, 3.0, "CONNIFY SYSTEM (0.0)", bg_color=CARD_WHITE, border_color=BLUE)
    add_box_with_text(s5, 4.8, 3.2, 3.7, 2.0, "Central Process Routing Zero-Knowledge Syndromes, Blinded Grid Hashes, Socket Events, & Hash-Chained Audit Logs.", bg_color=CARD_SUBTLE, text_color=TEXT_DARK, font_size=11, border_color=BLUE)

    # Left Entities & Hyphens
    add_card(s5, 0.8, 1.5, 3.2, 2.0, "Requester Device", bg_color=CARD_WHITE, border_color=INDIGO)
    add_box_with_text(s5, 0.9, 2.1, 3.0, 1.2, "Sends GPS Syndromes & Hashes;\nReceives Capsule Tokens & Events", bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=INDIGO)
    add_flow_hyphen(s5, 4.0, 2.3, 0.6, 0.4, "--->")

    add_card(s5, 0.8, 4.0, 3.2, 2.0, "Peer / Helper Device", bg_color=CARD_WHITE, border_color=EMERALD)
    add_box_with_text(s5, 0.9, 4.6, 3.0, 1.2, "Sends Local Decoded Proofs;\nReceives Match Verification & QR", bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=EMERALD)
    add_flow_hyphen(s5, 4.0, 4.8, 0.6, 0.4, "--->")

    # Right Entity & Hyphen
    add_card(s5, 9.3, 2.5, 3.2, 3.0, "MongoDB Database", bg_color=CARD_WHITE, border_color=AMBER)
    add_box_with_text(s5, 9.5, 3.2, 2.8, 2.0, "Stores Device Keys, Episodes, Capsules, Outcomes, & Audit Logs via Prisma ORM.", bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=11, border_color=AMBER)
    add_flow_hyphen(s5, 8.7, 3.8, 0.6, 0.4, "--->")

    # -------------------------------------------------------------
    # SLIDE 6: Figure 3.5 - Level-1 Detailed Data Flow Diagram
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Figure 3.5: Level-1 Detailed Data Flow Diagram (DFD)", "Internal Sub-Processes and Data Transformation Pipeline")

    sub_processes = [
        ("1.1 Spatial Quantizer", "Converts continuous lat/lng to 3-decimal base grid & 9-cell neighborhood"),
        ("1.2 Bloom Vectorizer", "Hashes 9 grid cells 4x via FNV-1a to create 1024-bit Bloom vector"),
        ("1.3 Syndrome Engine", "Segments vector; computes GF(2^4) BCH(15,7) parity syndromes & blinded hashes"),
        ("1.4 Asymmetric Decoder", "Peer combines local 7-bit blocks with syndromes; fixes up to 2 bit errors"),
        ("1.5 Hash Matcher", "Reconstructs requester's Bloom filter & verifies SHA-256 blinded grid hashes"),
        ("1.6 Capsule Issuer", "Generates signed Capsule token & appends entry to hash-chained AuditLog")
    ]

    for i, (title, desc) in enumerate(sub_processes):
        row = i // 3
        col = i % 3
        x = 0.8 + (col * 4.0)
        y = 1.5 + (row * 2.6)
        
        add_card(s6, x, y, 3.4, 2.2, title, bg_color=CARD_WHITE, border_color=BLUE if i<3 else EMERALD)
        add_box_with_text(s6, x + 0.15, y + 0.55, 3.1, 1.4, desc, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=BLUE if i<3 else EMERALD)
        
        if col < 2:
            add_flow_hyphen(s6, x + 3.4, y + 1.0, 0.6, 0.4, "--->")

    # -------------------------------------------------------------
    # SLIDE 7: Figure 3.6 - System Class Diagram
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Figure 3.6: System Class Diagram", "Frontend Stores, Cryptographic Services, and Backend Model Contracts")

    classes = [
        ("authStore (Zustand)", "- deviceId: string\n- publicKey: string\n- secretKey: string\n+ initializeIdentity()\n+ signPayload()"),
        ("episodeStore (Zustand)", "- episodes: Episode[]\n- activeEpisode: Episode\n+ createEpisode()\n+ fetchNearbyEpisodes()"),
        ("secureKeyService", "+ generateDeviceKeypair()\n+ storePrivateKeyInKeychain()\n+ signData()\n+ verifySignature()"),
        ("sharp (Core Math)", "+ fnv1a32()\n+ generateProximityRequest()\n+ verifyProximityHelper()\n+ sha256()"),
        ("EpisodeController", "+ createEpisode()\n+ getActiveEpisodes()\n+ cancelEpisode()\n+ logAuditEntry()"),
        ("CapsuleController", "+ issueCapsule()\n+ verifyQrHandshake()\n+ revokeCapsule()\n+ validateProof()")
    ]

    for i, (title, desc) in enumerate(classes):
        row = i // 3
        col = i % 3
        x = 0.8 + (col * 4.0)
        y = 1.5 + (row * 2.6)
        
        add_card(s7, x, y, 3.5, 2.3, title, bg_color=CARD_WHITE, border_color=INDIGO)
        add_box_with_text(s7, x + 0.15, y + 0.55, 3.2, 1.5, desc, bg_color=CARD_SUBTLE, text_color=BLUE, font_size=10, border_color=INDIGO)
        
        if col < 2:
            add_flow_hyphen(s7, x + 3.5, y + 1.0, 0.5, 0.4, "--->")

    # -------------------------------------------------------------
    # SLIDE 8: Figure 3.7 - Sequence Diagram Flow
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Figure 3.7: Sequence Diagram for Zero-Knowledge Handshake & Capsule Issuance", "Inter-Component Message Lifecycle with Flow Connectors")

    seq_steps = [
        ("1. Device Key Registration", "Client A ---> POST /api/devices/register ---> Registers Ed25519 Public Key"),
        ("2. ZK Episode Creation", "Client A ---> POST /api/episodes ---> Transmits Syndromes & Blinded Hashes"),
        ("3. Socket.io Event Broadcast", "Fastify ---> Socket.io emit('new_episode_available') ---> Notifies Nearby Peers"),
        ("4. Proximity Match Request", "Client B ---> Executes BCH Decoding ---> POST /api/capsules/issue"),
        ("5. Signed Capsule Issuance", "Fastify ---> Generates Signed Capsule Token ---> Returns to Client B"),
        ("6. Offline Mutual QR Scan", "Client A <===> Client B (Physical Meeting) ---> Scan Signed QR Token"),
        ("7. Capsule Redemption", "Client A ---> POST /api/capsules/verify-qr ---> Handshake Confirmed"),
        ("8. Audit Ledger Commit", "Fastify ---> Appends record to SHA-256 Audit Chain (prevHash ---> entryHash)")
    ]

    for i, (title, desc) in enumerate(seq_steps):
        row = i // 2
        col = i % 2
        x = 0.8 + (col * 5.9)
        y = 1.5 + (row * 1.3)
        add_card(s8, x, y, 5.6, 1.1, title, bg_color=CARD_WHITE, border_color=BLUE if col==0 else EMERALD)
        add_box_with_text(s8, x + 0.15, y + 0.45, 5.3, 0.55, desc, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=BLUE if col==0 else EMERALD)

    # -------------------------------------------------------------
    # SLIDE 9: Figure 3.8 - State Machine Flow Diagram
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Figure 3.8: State Machine Diagram for Active Episode Lifecycle", "Episode Lifecycle State Transitions and Flow Connectors")

    states = [
        ("PENDING", "Initial state upon POST /api/episodes. Syndromes broadcasted.", BLUE),
        ("MATCHED", "Peer successfully decodes BCH syndromes & Capsule issued.", INDIGO),
        ("ACTIVE", "Peers confirm mutual proximity & initiate real-time VoIP / chat.", EMERALD),
        ("COMPLETED", "Mutual QR code handshake scanned & outcome logged.", AMBER),
        ("EXPIRED", "15-minute timer elapses without a peer match or handshake.", TEXT_MUTED),
        ("CANCELLED", "Requester manually cancels active request prior to match.", ROSE)
    ]

    for i, (st, desc, col_rgb) in enumerate(states):
        row = i // 3
        col = i % 3
        x = 0.8 + (col * 4.0)
        y = 1.6 + (row * 2.5)
        add_card(s9, x, y, 3.4, 2.1, f"State: {st}", bg_color=CARD_WHITE, border_color=col_rgb)
        add_box_with_text(s9, x + 0.15, y + 0.55, 3.1, 1.3, desc, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=col_rgb)
        
        if col < 2 and row == 0:
            add_flow_hyphen(s9, x + 3.4, y + 0.9, 0.6, 0.4, "--->")

    # -------------------------------------------------------------
    # SLIDE 10: Figure 3.9 - Component Diagram (Dual-Mode Stack)
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Figure 3.9: Component Diagram for Hybrid Dual-Mode Networking Stack", "Online Cloud WebSockets vs. Offline Resilient Mesh Fallback Stack")

    add_card(s10, 0.8, 1.5, 5.3, 5.2, "ONLINE CLOUD STACK (Primary)", bg_color=CARD_WHITE, border_color=BLUE)
    on_items = ["HTTPS REST API (Fastify 5.10)", "Socket.io Bi-Directional WSS Engine", "WebRTC Peer-to-Peer VoIP Audio", "Notifee & Firebase Push Alarms", "MongoDB Document Cloud Storage"]
    for i, item in enumerate(on_items):
        add_box_with_text(s10, 1.0, 2.2 + (i * 0.9), 4.9, 0.7, item, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=11, border_color=BLUE)

    add_flow_hyphen(s10, 6.1, 3.8, 0.7, 0.4, "<===>")

    add_card(s10, 6.8, 1.5, 5.7, 5.2, "OFFLINE RESILIENT STACK (Fallback)", bg_color=CARD_WHITE, border_color=EMERALD)
    off_items = ["Wi-Fi mDNS Service Discovery", "Direct TCP Socket Pair Driver", "Bluetooth Low Energy (BLE) Mesh", "Encrypted Payload SMS Formatter", "Offline Queue Storage Engine"]
    for i, item in enumerate(off_items):
        add_box_with_text(s10, 7.0, 2.2 + (i * 0.9), 5.3, 0.7, item, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=11, border_color=EMERALD)

    # -------------------------------------------------------------
    # SLIDE 11: Figure 3.10 - ER Diagram
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "Figure 3.10: Entity-Relationship (ER) Diagram for MongoDB / Prisma Schema", "Data Models, Fields, Types, Constraints, and Relationships")

    entities = [
        ("Device", "id (PK)\ndeviceFingerprintHash (UQ)\npublicKey\nphoneHash\ncreatedAt"),
        ("Episode", "id (PK)\nrequesterDeviceId (FK)\ncategory, urgency, status\nlat, lng, radiusMeters\nblindedGridSigs (BCH)"),
        ("Capsule", "id (PK)\nepisodeId (FK)\nhelperDeviceId (FK)\nsignedTokenHash\nstatus, issuedAt"),
        ("Outcome", "id (PK)\nepisodeId (FK)\nresult, category\nriskLevel\ncompletedInWindow"),
        ("AuditLog", "id (PK)\neventType\nepisodeId (FK)\nprevHash (SHA-256)\nentryHash (SHA-256)"),
        ("Profile", "id (PK)\ndeviceId (FK, UQ)\nfirstName, lastName\nphone\nmedicalNotes")
    ]

    for i, (ent, fields) in enumerate(entities):
        row = i // 3
        col = i % 3
        x = 0.8 + (col * 4.0)
        y = 1.5 + (row * 2.6)
        add_card(s11, x, y, 3.4, 2.3, f"Model: {ent}", bg_color=CARD_WHITE, border_color=AMBER)
        add_box_with_text(s11, x + 0.15, y + 0.55, 3.1, 1.5, fields, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=AMBER)
        
        if col < 2:
            add_flow_hyphen(s11, x + 3.4, y + 1.0, 0.6, 0.4, "--->")

    # -------------------------------------------------------------
    # SLIDE 12: Figure 4.1 - Atomic Component Layout Structure
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)
    add_header(s12, "Figure 4.1: Atomic Component Layout Structure for Social Discovery Dashboard", "UI Hierarchy and Component Wireframe Layout")

    add_card(s12, 0.8, 1.5, 11.733, 5.2, "Social Discovery Dashboard Wireframe Layout", bg_color=CARD_WHITE, border_color=BLUE)
    
    add_box_with_text(s12, 1.1, 2.1, 11.1, 0.6, "Header Bar: Brand Logo + Status Badge + Hardware Security Fingerprint", bg_color=CARD_SUBTLE, text_color=BLUE, font_size=11, border_color=BLUE)
    add_box_with_text(s12, 1.1, 2.8, 11.1, 1.3, "Category Selection Grid (Atomic Buttons):\n[ Social Connection ]   [ Event Meetup ]   [ Co-Presence ]   [ Activity Partner ]   [ Walk-Together ]", bg_color=CARD_SUBTLE, text_color=TEXT_DARK, font_size=11, border_color=INDIGO)
    add_box_with_text(s12, 1.1, 4.2, 5.4, 1.3, "Search Radius & Urgency Controls:\n- Search Radius Slider (100m - 1000m)\n- Urgency Level Selector (1 - 5)", bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=EMERALD)
    add_box_with_text(s12, 6.7, 4.2, 5.5, 1.3, "Radar Visualizer & Connection Pulse:\n- Animated Pulse Wave Component\n- ZK Syndrome Broadcast Trigger Button", bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=AMBER)
    add_box_with_text(s12, 1.1, 5.6, 11.1, 0.8, "Safety Quick-Action Dock: [ Acoustic Siren ]   [ Timed Guard ]   [ Fake Call ]   [ Hazard Map ]", bg_color=CARD_SUBTLE, text_color=AMBER, font_size=11, border_color=AMBER)

    # -------------------------------------------------------------
    # SLIDE 13: Figure 4.2 - Cryptographic Key Generation Pipeline Flow
    # -------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13)
    add_header(s13, "Figure 4.2: Cryptographic Key Generation & Keychain Hardware Binding Pipeline", "Hardware Security Layer & Ed25519 Signature Pipeline")

    pipe_steps = [
        ("1. App Launch", "App detects missing identity; triggers keypair generation"),
        ("2. TweetNaCl Gen", "Generates Ed25519 public key (32 bytes) & secret key (64 bytes)"),
        ("3. Keychain Store", "Persists secret key inside Android KeyStore / iOS Keychain via SecureStore"),
        ("4. Biometric Guard", "Enforces biometric authentication (Fingerprint / FaceID) for key access"),
        ("5. Challenge Sign", "Client signs random server challenge string with detached Ed25519 signature"),
        ("6. JWT Issuance", "Fastify verifies signature against registered public key & issues JWT token")
    ]

    for i, (title, desc) in enumerate(pipe_steps):
        row = i // 3
        col = i % 3
        x = 0.8 + (col * 4.0)
        y = 1.5 + (row * 2.6)
        add_card(s13, x, y, 3.4, 2.2, title, bg_color=CARD_WHITE, border_color=BLUE)
        add_box_with_text(s13, x + 0.15, y + 0.55, 3.1, 1.4, desc, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=BLUE)
        
        if col < 2:
            add_flow_hyphen(s13, x + 3.4, y + 1.0, 0.6, 0.4, "--->")

    # -------------------------------------------------------------
    # SLIDE 14: Figure 4.3 - Append-Only Hash-Chained Audit Ledger
    # -------------------------------------------------------------
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14)
    add_header(s14, "Figure 4.3: Append-Only Hash-Chained Audit Ledger Structure (prevHash ---> entryHash)", "Tamper-Evident Cryptographic Logging & Auditability Chain")

    blocks = [
        ("Block N-1: EPISODE_CREATED", "prevHash: 0000000000...\nentryHash: a1b2c3d4e5f6...\ntimestamp: 10:40:00 UTC"),
        ("Block N: CAPSULE_REDEEMED", "prevHash: a1b2c3d4e5f6...\nentryHash: f6e5d4c3b2a1...\ntimestamp: 10:42:15 UTC"),
        ("Block N+1: EPISODE_COMPLETED", "prevHash: f6e5d4c3b2a1...\nentryHash: 9x8y7z6w5v4u...\ntimestamp: 10:45:30 UTC")
    ]

    for i, (title, desc) in enumerate(blocks):
        x = 0.8 + (i * 4.0)
        add_card(s14, x, 2.0, 3.4, 3.5, title, bg_color=CARD_WHITE, border_color=AMBER)
        add_box_with_text(s14, x + 0.15, 2.7, 3.1, 2.5, desc, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=AMBER)
        
        if i < 2:
            add_flow_hyphen(s14, x + 3.4, 3.3, 0.6, 0.4, "--->")

    add_box_with_text(s14, 0.8, 5.8, 11.733, 0.8, "Mathematical Invariant: entryHash = SHA256(prevHash + eventType + episodeId + timestamp)\nTamper Detection: Modifying any historical block breaks all subsequent hashes in the chain.", bg_color=CARD_SUBTLE, text_color=BLUE, font_size=11, border_color=BLUE)

    # -------------------------------------------------------------
    # SLIDE 15: Figure 5.1 - Backend Integration Test Suite Output
    # -------------------------------------------------------------
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15)
    add_header(s15, "Figure 5.1: Backend Integration Test Suite Execution Output (39/39 Pass)", "Empirical System Verification & Test Execution Results")

    add_card(s15, 0.8, 1.5, 4.0, 5.2, "Test Metrics Summary", bg_color=CARD_WHITE, border_color=EMERALD)
    metrics = [
        ("Total Test Suites", "9 Passed"),
        ("Total Tests", "39 Passed (100%)"),
        ("Test Failures", "0 Failed"),
        ("Execution Time", "12,302 ms (12.3s)"),
        ("Test Framework", "Node Native Runner"),
        ("Target Backend", "Fastify 5.10 + MongoDB")
    ]
    for i, (k, v) in enumerate(metrics):
        add_box_with_text(s15, 1.0, 2.2 + (i * 0.7), 3.6, 0.55, f"{k}: {v}", bg_color=CARD_SUBTLE, text_color=TEXT_DARK, font_size=10, border_color=EMERALD)

    add_card(s15, 5.1, 1.5, 7.4, 5.2, "Verified Test Categories (39 Endpoints)", bg_color=CARD_WHITE, border_color=BLUE)
    categories = [
        "1. Device Registration (/api/devices/register) ---> PASS",
        "2. Device Challenge & Auth (/api/auth/challenge & /verify) ---> PASS",
        "3. Server Health Endpoint (/api/health) ---> PASS",
        "4. Coarse Geofence Locations (/api/locations) ---> PASS",
        "5. ZK Episode Lifecycle (/api/episodes) ---> PASS",
        "6. Helper Capsule Operations (/api/capsules) ---> PASS",
        "7. Outcome Audit Logging (/api/outcomes) ---> PASS",
        "8. Admin Dashboard & Metrics (/api/admin/dashboard) ---> PASS",
        "9. Cryptographic Audit Chain & Healing Simulation ---> PASS"
    ]
    for i, cat in enumerate(categories):
        add_box_with_text(s15, 5.3, 2.1 + (i * 0.5), 7.0, 0.42, cat, bg_color=CARD_SUBTLE, text_color=TEXT_BODY, font_size=10, border_color=BLUE)

    # -------------------------------------------------------------
    # SLIDE 16: Figure 5.2 - Application Interface Screenshot Checklist
    # -------------------------------------------------------------
    s16 = prs.slides.add_slide(blank_layout)
    set_slide_background(s16)
    add_header(s16, "Figure 5.2: Application Interface Layout Screenshot Inventory Checklist", "Complete Inventory of Implemented Mobile UI Controllers")

    screens = [
        "1. Welcome & Onboarding (`WelcomeScreen.tsx`)",
        "2. Requester Dashboard (`DashboardScreen.tsx`)",
        "3. ZK Request Creation (`CreateRequestScreen.tsx`)",
        "4. Proximity Searching Radar (`SearchingScreen.tsx`)",
        "5. Nearby Peer Requests (`NearbyRequestsScreen.tsx`)",
        "6. Handshake QR Generator (`HandshakeScreen.tsx`)",
        "7. Active Connection View (`EmergencyScreen.tsx`)",
        "8. Unified Safety Hub (`UnifiedSafetyHubScreen.tsx`)",
        "9. 115dB Acoustic Siren (`WomenSafetyScreen.tsx`)",
        "10. Fake Call Simulator (`FakeCallScreen.tsx`)",
        "11. Timed Safety Guard (`TimedSafetyGuardScreen.tsx`)",
        "12. Community Hazard Map (`HazardMapScreen.tsx`)",
        "13. Governance & Audit (`GovernanceScreen.tsx`)"
    ]

    for i, sc in enumerate(screens):
        col = i // 7
        row = i % 7
        x = 0.8 + (col * 5.9)
        y = 1.5 + (row * 0.75)
        add_box_with_text(s16, x, y, 5.6, 0.6, sc, bg_color=CARD_WHITE, text_color=TEXT_BODY, font_size=10, border_color=INDIGO)

    out_dir = r"o:\PROJECTS\CONNIFY-APP\docs"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "CONNIFY_PROJECT_DIAGRAMS.pptx")
    root_path = r"o:\PROJECTS\CONNIFY-APP\CONNIFY_PROJECT_DIAGRAMS.pptx"

    prs.save(out_path)
    prs.save(root_path)
    print(f"Successfully generated LIGHT THEME PowerPoint presentation at:\n1. {out_path}\n2. {root_path}")

if __name__ == "__main__":
    create_presentation()
