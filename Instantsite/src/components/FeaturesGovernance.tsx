import React, { useState } from 'react';
import { 
  Award, Shield, FileCheck, HelpCircle, ArrowUpRight,
  Vote, CheckCircle2, ThumbsUp, ThumbsDown, Calendar, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Proposal } from '../types';

export default function FeaturesGovernance() {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 'PROP-042',
      title: 'Enlarge Guardian Alert Sweep Radius',
      description: 'Expand the active local mesh routing alert trigger radius from 1000m to 1500m in suburban areas to offset sparse responder density.',
      category: 'protocol',
      votesFor: 1240,
      votesAgainst: 420,
      status: 'active'
    },
    {
      id: 'PROP-043',
      title: 'Approve Local Pharmacy Vetting Standards',
      description: 'Establish standard protocol parameters for pharmacies and 24h drugstores to be registered automatically as secure "Illuminated Safe Havens".',
      category: 'hardware',
      votesFor: 890,
      votesAgainst: 120,
      status: 'active'
    },
    {
      id: 'PROP-044',
      title: 'Zero-Knowledge Multi-Hop Routing Integration',
      description: 'Incorporate anonymous multi-hop onion routing for coordination requests so that intermediating responder nodes can never log parent source coordinates.',
      category: 'privacy',
      votesFor: 1840,
      votesAgainst: 40,
      status: 'active'
    }
  ]);

  const [votedList, setVotedList] = useState<string[]>([]);

  const handleVote = (id: string, type: 'for' | 'against') => {
    if (votedList.includes(id)) return;

    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updatedFor = type === 'for' ? p.votesFor + 1 : p.votesFor;
          const updatedAgainst = type === 'against' ? p.votesAgainst + 1 : p.votesAgainst;
          const totalVotes = updatedFor + updatedAgainst;
          
          let nextStatus: 'active' | 'passed' | 'defeated' = 'active';
          // Auto resolve logic for sandbox
          if (totalVotes > 100) {
            nextStatus = updatedFor > updatedAgainst ? 'passed' : 'defeated';
          }

          return {
            ...p,
            votesFor: updatedFor,
            votesAgainst: updatedAgainst,
            status: nextStatus
          };
        }
        return p;
      })
    );
    setVotedList(prev => [...prev, id]);
  };

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const categories = {
    protocol: 'Protocol Mechanism',
    privacy: 'Cryptography / Privacy',
    community: 'Community Vetting',
    hardware: 'Hardware Integrations'
  };

  return (
    <div id="features-governance-page" className="space-y-24 pb-20">
      
      {/* Page Hero Header */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-red/10 rounded border border-brand-red/25">
          <Award className="h-4 w-4 text-brand-red" />
          <span className="font-mono text-xs font-bold text-brand-red uppercase tracking-widest">Decentralized Governance</span>
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-brand-black tracking-tight">
          Trust Vetting & Decentralized <span className="text-brand-red">Governance</span>
        </h1>

        <p className="font-sans text-brand-muted text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Connify has no corporate boardroom or venture monopolies. All responder verification criteria, safety protocols, and software rules are debated and voted upon by the community.
        </p>
      </section>

      {/* Vetting Standard Breakdown Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
        
        <div className="bg-brand-surface border-2 border-brand-black rounded p-7 space-y-4 shadow-[4px_4px_0px_rgba(27,27,27,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_rgba(27,27,27,1)] transition-all">
          <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red w-fit rounded">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-lg text-brand-black">Triple-Neighbor Sponsorship</h3>
          <p className="font-sans text-xs text-brand-muted leading-relaxed">
            To register as an active civilian defender node, a volunteer must get three cryptographically signed sponsorships from existing, vetted neighborhood guardians on the network.
          </p>
        </div>

        <div className="bg-brand-surface border-2 border-brand-black rounded p-7 space-y-4 shadow-[4px_4px_0px_rgba(27,27,27,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_rgba(27,27,27,1)] transition-all">
          <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red w-fit rounded">
            <FileCheck className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-lg text-brand-black">Periodic Escrow Verification</h3>
          <p className="font-sans text-xs text-brand-muted leading-relaxed">
            Identity checks and community registry statuses undergo automated daily audits. Vetting certificates are stored client-side inside secure hardware enclaves.
          </p>
        </div>

        <div className="bg-brand-surface border-2 border-brand-black rounded p-7 space-y-4 shadow-[4px_4px_0px_rgba(27,27,27,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_rgba(27,27,27,1)] transition-all">
          <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red w-fit rounded">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-lg text-brand-black">Anonymous Accountability Flags</h3>
          <p className="font-sans text-xs text-brand-muted leading-relaxed">
            If a responder breaches the code of conduct, an anonymous review can trigger an instant temporary suspension. The final decision is peer-arbitrated.
          </p>
        </div>

      </section>

      {/* Interactive Council Proposal Voting Sandbox */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface border-2 border-brand-black rounded-xl p-8 sm:p-12 space-y-8 relative overflow-hidden shadow-[6px_6px_0px_rgba(27,27,27,1)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-[90px] pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <span className="font-mono text-[10px] font-bold text-brand-red uppercase tracking-widest bg-brand-red/5 px-2.5 py-1 rounded border border-brand-red/20">Community Consensus Hub</span>
            <h2 className="font-display font-extrabold text-3xl text-brand-black">Active Improvement Proposals</h2>
            <p className="font-sans text-sm text-brand-muted max-w-2xl font-medium">
              Audit current protocol proposals. Click "Vote For" or "Vote Against" to participate in real-time. The results and pass conditions update dynamically.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 pt-4 relative z-10">
            {proposals.map((prop) => {
              const totalVotes = prop.votesFor + prop.votesAgainst;
              const forPercent = getPercentage(prop.votesFor, totalVotes);
              const againstPercent = getPercentage(prop.votesAgainst, totalVotes);
              const hasVoted = votedList.includes(prop.id);

              return (
                <div 
                  key={prop.id} 
                  className={`bg-white border-2 rounded p-6 flex flex-col justify-between space-y-6 transition-all duration-300 ${
                    hasVoted ? 'border-brand-red bg-brand-red/5' : 'border-brand-black/20 hover:border-brand-black shadow-[3px_3px_0px_rgba(27,27,27,0.1)] hover:shadow-[4px_4px_0px_rgba(27,27,27,0.15)]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-brand-muted font-bold">{prop.id}</span>
                      <span className="text-brand-red uppercase tracking-wider font-bold">
                        {categories[prop.category] || prop.category}
                      </span>
                    </div>

                    <h4 className="font-display font-extrabold text-base text-brand-black leading-tight">
                      {prop.title}
                    </h4>

                    <p className="font-sans text-xs text-brand-muted leading-relaxed font-medium">
                      {prop.description}
                    </p>
                  </div>

                  {/* Voting Progress visual bars */}
                  <div className="space-y-3 border-t border-brand-black/10 pt-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-brand-black font-extrabold">SUPPORT: {prop.votesFor} ({forPercent}%)</span>
                        <span className="text-brand-muted font-bold">AGAINST: {prop.votesAgainst} ({againstPercent}%)</span>
                      </div>
                      
                      {/* Split Bar */}
                      <div className="w-full bg-brand-beige h-2.5 rounded border border-brand-black/20 overflow-hidden flex">
                        <div className="bg-brand-red h-full transition-all duration-500" style={{ width: `${forPercent}%` }} />
                        <div className="bg-brand-muted h-full transition-all duration-500" style={{ width: `${againstPercent}%` }} />
                      </div>
                    </div>

                    {/* Voting Action buttons */}
                    <AnimatePresence mode="wait">
                      {!hasVoted ? (
                        <motion.div 
                          key="actions"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="grid grid-cols-2 gap-2"
                        >
                          <button
                            onClick={() => handleVote(prop.id, 'for')}
                            className="py-2 bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-xs rounded border-2 border-brand-black shadow-[2px_2px_0px_#1b1b1b] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1px_1px_0px_#1b1b1b] transition-all cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <ThumbsUp className="h-3.5 w-3.5 fill-white" />
                            <span>VOTE FOR</span>
                          </button>
                          <button
                            onClick={() => handleVote(prop.id, 'against')}
                            className="py-2 bg-white hover:bg-brand-beige text-brand-black font-sans font-bold text-xs rounded border-2 border-brand-black shadow-[2px_2px_0px_#1b1b1b] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1px_1px_0px_#1b1b1b] transition-all cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            <span>AGAINST</span>
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="voted"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="py-2 bg-white border-2 border-brand-red text-brand-red font-mono text-[11px] font-bold rounded flex items-center justify-center space-x-1 shadow-[2px_2px_0px_#1b1b1b]"
                        >
                          <CheckCircle2 className="h-4 w-4 text-brand-red" />
                          <span>YOUR VOTE WAS LOGGED ON-MESH</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Protocol Core Developers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-brand-surface border-2 border-brand-black rounded-xl p-8 sm:p-12 space-y-8 relative overflow-hidden shadow-[6px_6px_0px_rgba(27,27,27,1)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-[90px] pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <span className="font-mono text-[10px] font-bold text-brand-red uppercase tracking-widest bg-brand-red/5 px-2.5 py-1 rounded border border-brand-red/20">Protocol Engineers</span>
            <h2 className="font-display font-extrabold text-3xl text-brand-black">Connify Core Engineering Council</h2>
            <p className="font-sans text-sm text-brand-muted max-w-2xl font-medium">
              Meet the system architects and engineers who designed and maintain the zero-trust proximity verification protocol.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 relative z-10">
            
            {/* Developer 1 */}
            <div className="bg-white border-2 border-brand-black rounded p-6 space-y-4 shadow-[4px_4px_0px_#1b1b1b] flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1b1b1b] transition-all">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-display font-bold text-base">
                    G
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-black">Girijesh R.</h4>
                    <span className="font-mono text-[9px] text-brand-red uppercase font-bold block">Lead Systems & Network Integrity</span>
                  </div>
                </div>
                <p className="font-sans text-xs text-brand-muted leading-relaxed">
                  Focuses on physical signal validation metrics, ambient Wi-Fi tag hashing, network traffic encryption audits, and system penetration modeling under active proximity handshakes.
                </p>
              </div>
              <div className="pt-3 border-t border-brand-black/10 flex justify-between items-center text-[10px] font-mono">
                <span className="text-brand-muted">ROLE: Network Integrity</span>
                <span className="text-brand-red font-bold">CORE COUNCIL</span>
              </div>
            </div>

            {/* Developer 2 */}
            <div className="bg-white border-2 border-brand-black rounded p-6 space-y-4 shadow-[4px_4px_0px_#1b1b1b] flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1b1b1b] transition-all">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-display font-bold text-base">
                    G
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-black">Gangash S.</h4>
                    <span className="font-mono text-[9px] text-brand-red uppercase font-bold block">Protocol Systems Architect</span>
                  </div>
                </div>
                <p className="font-sans text-xs text-brand-muted leading-relaxed">
                  Oversees the mathematical definitions of our SHARP protocol, Bloom filter allocations, and cryptographic single-use JWT generation pipelines to eliminate central surveillance creep.
                </p>
              </div>
              <div className="pt-3 border-t border-brand-black/10 flex justify-between items-center text-[10px] font-mono">
                <span className="text-brand-muted">ROLE: Protocol Systems</span>
                <span className="text-brand-red font-bold">CORE COUNCIL</span>
              </div>
            </div>

            {/* Developer 3 */}
            <div className="bg-white border-2 border-brand-black rounded p-6 space-y-4 shadow-[4px_4px_0px_#1b1b1b] flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1b1b1b] transition-all">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-display font-bold text-base">
                    G
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-black">Godfrey T R</h4>
                    <span className="font-mono text-[9px] text-brand-red uppercase font-bold block">Lead SE & System Architect</span>
                  </div>
                </div>
                <p className="font-sans text-xs text-brand-muted leading-relaxed">
                  Designed the overall protocol architecture, backend services, trust capsule lifecycle, API contracts, security architecture, authentication flow, system integration, deployment strategy, and overall engineering decisions. Coordinates implementation across modules.
                </p>
              </div>
              <div className="pt-3 border-t border-brand-black/10 flex justify-between items-center text-[10px] font-mono">
                <span className="text-brand-muted">ROLE: Lead Architect</span>
                <span className="text-brand-red font-bold">CORE COUNCIL</span>
              </div>
            </div>

            {/* Developer 4 */}
            <div className="bg-white border-2 border-brand-black rounded p-6 space-y-4 shadow-[4px_4px_0px_#1b1b1b] flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1b1b1b] transition-all">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-display font-bold text-base">
                    G
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-black">Grish Narayanan S</h4>
                    <span className="font-mono text-[9px] text-brand-red uppercase font-bold block">Security & Verification Systems Engineer</span>
                  </div>
                </div>
                <p className="font-sans text-xs text-brand-muted leading-relaxed">
                  Engineered and implemented the Need Verification Engine, contextual verification logic, trust validation experiments, cryptographic fraud detection, device consistency validation, Wi-Fi/GPS verification pipeline, and geographic matching algorithms.
                </p>
              </div>
              <div className="pt-3 border-t border-brand-black/10 flex justify-between items-center text-[10px] font-mono">
                <span className="text-brand-muted">ROLE: Security & Verification</span>
                <span className="text-brand-red font-bold">CORE COUNCIL</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
