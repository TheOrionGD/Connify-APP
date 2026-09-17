import React, { useState } from 'react';
import { 
  Users, 
  Car, 
  Footprints, 
  HeartHandshake, 
  PhoneCall, 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  Radio, 
  MessageSquare, 
  MapPin, 
  CheckCircle,
  Activity,
  Compass,
  Zap,
  Lock
} from 'lucide-react';

export default function MutualAidSection() {
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 1, name: "Vehicle Breakdown", category: "everyday", icon: Car, desc: "Flat tire, dead battery, or mechanical breakdown on the road." },
    { id: 2, name: "Emergency Transport", category: "everyday", icon: Zap, desc: "Urgent ride or assistance to reach a hospital or clinic." },
    { id: 3, name: "Missing Child / Senior", category: "everyday", icon: Users, desc: "Instant localized radius broadcast with photo verification." },
    { id: 4, name: "Emergency Blood Supply", category: "everyday", icon: Activity, desc: "Direct matching with nearby donors of compatible blood groups." },
    { id: 5, name: "Medicine & First Aid", category: "everyday", icon: HeartHandshake, desc: "Urgent supply coordination for asthma inhalers, insulin, or bandages." },
    { id: 6, name: "Lost Pet Recovery", category: "everyday", icon: Compass, desc: "Community mesh search across the immediate 500-meter radius." },

    { id: 7, name: "Safe Companion Walk", category: "trust", icon: Footprints, desc: "Walking alongside a verified neighbor through deserted or dimly lit streets." },
    { id: 8, name: "Timed Journey Guard", category: "trust", icon: Activity, desc: "Autonomous countdown timer that alerts guardians if you don't check in." },
    { id: 9, name: "Danger Spot Alerts", category: "trust", icon: AlertTriangle, desc: "Crowdsourced hazard pins with AI cross-verification to prevent accidents." },
    { id: 10, name: "Bystander Attestation", category: "trust", icon: CheckCircle, desc: "Third-party co-signing of physical rendezvous to prevent coercion." },
    { id: 11, name: "Covert Fake Call", category: "trust", icon: PhoneCall, desc: "Simulates realistic incoming calls to safely exit uncomfortable situations." },
    { id: 12, name: "Women's Safety Hub", category: "trust", icon: ShieldAlert, desc: "Dedicated high-priority dispatch with verified female responder priority." },

    { id: 13, name: "Acute Medical SOS", category: "emergency", icon: Activity, desc: "Immediate CPR volunteer summon & automatic ambulance coordination." },
    { id: 14, name: "Panic & Harassment", category: "emergency", icon: AlertTriangle, desc: "Instant silent distress beacon sent to all peers within 300 meters." },
    { id: 15, name: "Covert Duress PIN", category: "emergency", icon: Lock, desc: "Decoy screen unlocks normally while silently dispatching police & guardians." },
    { id: 16, name: "Fire & Natural Disaster", category: "emergency", icon: Flame, desc: "Rapid peer evacuation alerts and safe zone route sharing." },
    { id: 17, name: "Offline BLE Mesh Alert", category: "emergency", icon: Radio, desc: "Hops packet from phone to phone across Bluetooth when cell networks are down." },
    { id: 18, name: "Emergency SMS Fallback", category: "emergency", icon: MessageSquare, desc: "Generates standardized encrypted SMS with satellite GPS coordinates." }
  ];

  const filteredCategories = activeTab === 'all' 
    ? categories 
    : categories.filter(c => c.category === activeTab);

  return (
    <section id="mesh" className="section" style={{ background: '#ffffff' }}>
      <div className="container">

        {/* Header */}
        <div className="section-header">
          <div className="badge-pill primary">
            <Radio size={14} color="#e11d48" />
            <span>P2P COMMUNITY MESH</span>
          </div>
          <h2 className="section-title">
            The 22 Services of the <br />
            <span className="highlight">Peer-to-Peer Safety Mesh</span>
          </h2>
          <p className="section-subtitle">
            From everyday flat-tire assistance and companion night walks to urgent medical crises, Connify turns strangers in physical proximity into an ad-hoc safety and mutual aid network.
          </p>
        </div>

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 20px', fontSize: '0.86rem' }}
          >
            All 22 Categories ({categories.length}+)
          </button>
          <button
            onClick={() => setActiveTab('everyday')}
            className={`btn ${activeTab === 'everyday' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 20px', fontSize: '0.86rem' }}
          >
            Everyday Mutual Aid
          </button>
          <button
            onClick={() => setActiveTab('trust')}
            className={`btn ${activeTab === 'trust' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 20px', fontSize: '0.86rem' }}
          >
            Situational Trust & Escort
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`btn ${activeTab === 'emergency' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 20px', fontSize: '0.86rem' }}
          >
            High-Urgency & SOS
          </button>
        </div>

        {/* Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          {filteredCategories.map((item) => {
            const Icon = item.icon;
            const isEmergency = item.category === 'emergency';
            const isTrust = item.category === 'trust';

            return (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: isEmergency ? 'rgba(255, 241, 242, 0.45)' : 'rgba(255, 255, 255, 0.9)',
                  border: isEmergency ? '1px solid rgba(225, 29, 72, 0.2)' : '1px solid #f1e4e4',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: isEmergency ? '#ffe4e6' : isTrust ? '#f5f3ff' : '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} color={isEmergency ? '#e11d48' : isTrust ? '#8b5cf6' : '#16a34a'} />
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: isEmergency ? '#e11d48' : isTrust ? '#8b5cf6' : '#16a34a'
                  }}>
                    {item.category === 'emergency' ? 'Urgent' : item.category === 'trust' ? 'Escort' : 'Mutual Aid'}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Offline BLE Mesh & Cellular Fallback Demonstration Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
          borderRadius: '24px',
          padding: '40px 32px',
          color: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
          gap: '32px',
          alignItems: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
        }} className="mesh-offline-box">
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(225, 29, 72, 0.2)',
              color: '#ff4d6d',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              <Radio size={13} />
              <span>OFFLINE RESILIENCE GUARANTEE</span>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.03em' }}>
              Zero Internet? <br />
              <span style={{ color: '#ff4d6d' }}>Bluetooth Mesh + Satellite SMS Takes Over.</span>
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '20px' }}>
              During natural disasters, riots, subway tunnels, or network shutdowns, cellular towers go silent. Connify devices automatically form a multi-hop Bluetooth Low Energy (BLE) Mesh network. Alerts hop seamlessly from phone to phone until reaching an connected device or formatting an encrypted SMS payload.
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3ddc84' }} />
                <span>Multi-Hop Bluetooth Relay</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
                <span>Encrypted Satellite SMS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
                <span>Offline Transaction Queue</span>
              </div>
            </div>
          </div>

          {/* Interactive Multi-Hop Visual Diagram */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.76rem', color: '#a1a1aa', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real-Time Mesh Topology Simulation
            </div>

            <svg width="100%" height="160" viewBox="0 0 320 160" fill="none">
              {/* Animated Connection Lines */}
              <line x1="40" y1="80" x2="110" y2="40" stroke="#e11d48" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="40" y1="80" x2="110" y2="120" stroke="#e11d48" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="110" y1="40" x2="200" y2="60" stroke="#38bdf8" strokeWidth="2" />
              <line x1="110" y1="120" x2="200" y2="100" stroke="#38bdf8" strokeWidth="2" />
              <line x1="200" y1="60" x2="280" y2="80" stroke="#10b981" strokeWidth="2.5" />
              <line x1="200" y1="100" x2="280" y2="80" stroke="#10b981" strokeWidth="2.5" />

              {/* Node 1: Stranded User */}
              <circle cx="40" cy="80" r="16" fill="#e11d48" />
              <text x="40" y="84" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">SOS</text>
              <text x="40" y="110" fill="#f43f5e" fontSize="9" textAnchor="middle">No Signal</text>

              {/* Node 2: Peer Hop A */}
              <circle cx="110" cy="40" r="12" fill="#27272a" stroke="#38bdf8" strokeWidth="2" />
              <text x="110" y="44" fill="#ffffff" fontSize="8" textAnchor="middle">Hop 1</text>

              {/* Node 3: Peer Hop B */}
              <circle cx="110" cy="120" r="12" fill="#27272a" stroke="#38bdf8" strokeWidth="2" />
              <text x="110" y="124" fill="#ffffff" fontSize="8" textAnchor="middle">Hop 1</text>

              {/* Node 4: Peer Hop C */}
              <circle cx="200" cy="60" r="12" fill="#27272a" stroke="#a855f7" strokeWidth="2" />
              <text x="200" y="64" fill="#ffffff" fontSize="8" textAnchor="middle">Hop 2</text>

              {/* Node 5: Peer Hop D */}
              <circle cx="200" cy="100" r="12" fill="#27272a" stroke="#a855f7" strokeWidth="2" />
              <text x="200" y="104" fill="#ffffff" fontSize="8" textAnchor="middle">Hop 2</text>

              {/* Node 6: Online Responder / Gateway */}
              <circle cx="280" cy="80" r="18" fill="#10b981" />
              <text x="280" y="84" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">RESCUE</text>
              <text x="280" y="112" fill="#34d399" fontSize="9" textAnchor="middle">4G / Net</text>
            </svg>

            <div style={{ fontSize: '0.74rem', color: '#a1a1aa', marginTop: '10px' }}>
              Packets bounce through ambient peer devices without decrypting payload data.
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .mesh-offline-box {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
