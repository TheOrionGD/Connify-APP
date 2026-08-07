import React, { useState } from 'react';
import { 
  Award, Shield, FileCheck, HelpCircle, ArrowUpRight,
  Vote, CheckCircle2, ThumbsUp, ThumbsDown, Calendar, Users, Plus, Check
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
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');

  // Trust Calculator state
  const [escortsCount, setEscortsCount] = useState<number>(12);
  const [responseTimeSec, setResponseTimeSec] = useState<number>(45);

  const handleVote = (id: string, type: 'for' | 'against') => {
    if (votedList.includes(id)) return;

    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updatedFor = type === 'for' ? p.votesFor + 1 : p.votesFor;
          const updatedAgainst = type === 'against' ? p.votesAgainst + 1 : p.votesAgainst;
          const totalVotes = updatedFor + updatedAgainst;
          
          let nextStatus: 'active' | 'passed' | 'defeated' = 'active';
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

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newProp: Proposal = {
      id: `PROP-0${Math.floor(Math.random() * 90) + 45}`,
      title: newTitle,
      description: newDesc,
      category: 'community',
      votesFor: 1,
      votesAgainst: 0,
      status: 'active'
    };

    setProposals(prev => [newProp, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setShowSubmitModal(false);
  };

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  // Calculate trust score
  const computedTrustScore = Math.min(999, Math.round((escortsCount * 45) + (1000 - responseTimeSec * 10)));

  return (
    <section id="governance-council" className="space-y-16 py-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30">
          <Award className="h-4 w-4 text-rose-500" />
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
            DECENTRALIZED COMMUNITY COUNCIL
          </span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          Trust Vetting & Consensus <span className="text-rose-500">Governance</span>
        </h2>
        <p className="font-sans text-slate-300 text-base sm:text-lg">
          Connify safety rules, responder verification thresholds, and encryption standards are debated and cryptographically voted on by the community.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center max-w-5xl mx-auto border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2">
          <Vote className="h-5 w-5 text-rose-400" />
          <span className="font-display font-bold text-white text-lg">Active Protocol Proposals</span>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all cursor-pointer flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>SUBMIT PROPOSAL</span>
        </button>
      </div>

      {/* Proposals Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {proposals.map((prop) => {
          const totalVotes = prop.votesFor + prop.votesAgainst;
          const pctFor = getPercentage(prop.votesFor, totalVotes);
          const hasVoted = votedList.includes(prop.id);

          return (
            <div key={prop.id} className="glass-card-glow rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-rose-400 font-bold">{prop.id}</span>
                  <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase font-bold">
                    {prop.status}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white">{prop.title}</h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">{prop.description}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                {/* Vote Percentage Progress Bar */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>FOR: {pctFor}%</span>
                    <span>AGAINST: {100 - pctFor}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${pctFor}%` }} className="bg-rose-500 h-full"></div>
                    <div style={{ width: `${100 - pctFor}%` }} className="bg-slate-600 h-full"></div>
                  </div>
                </div>

                {/* Vote Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleVote(prop.id, 'for')}
                    disabled={hasVoted}
                    className={`py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      hasVoted 
                        ? 'bg-white/5 text-slate-500 border border-white/10' 
                        : 'bg-rose-600/30 hover:bg-rose-600 text-white border border-rose-500'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-rose-400" />
                    <span>VOTE FOR</span>
                  </button>

                  <button
                    onClick={() => handleVote(prop.id, 'against')}
                    disabled={hasVoted}
                    className={`py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      hasVoted 
                        ? 'bg-white/5 text-slate-500 border border-white/10' 
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5 text-slate-400" />
                    <span>AGAINST</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Trust Score Calculator Widget */}
      <div className="max-w-3xl mx-auto bg-[#090a0f] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-rose-400 font-bold uppercase">REPUTATION CALCULATOR</span>
            <h3 className="font-display font-bold text-xl text-white">Community Trust Score Simulator</h3>
          </div>
          <div className="text-right">
            <span className="font-tech text-3xl font-extrabold text-emerald-400">{computedTrustScore}</span>
            <span className="block font-mono text-[10px] text-slate-400">TRUST SCORE (MAX 999)</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Successful Escorts Completed:</span>
              <span className="text-rose-400 font-bold">{escortsCount}</span>
            </div>
            <input 
              type="range" min="0" max="50" value={escortsCount} 
              onChange={(e) => setEscortsCount(Number(e.target.value))}
              className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Avg Response Time (seconds):</span>
              <span className="text-emerald-400 font-bold">{responseTimeSec}s</span>
            </div>
            <input 
              type="range" min="15" max="120" value={responseTimeSec} 
              onChange={(e) => setResponseTimeSec(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Modal for Submitting Proposal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#12141d] rounded-2xl border border-white/20 p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="font-display font-bold text-xl text-white">Submit Protocol Proposal</h3>
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="text-slate-400 hover:text-white font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProposal} className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-mono text-xs text-slate-300">Proposal Title:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Enable Sub-GHz Beacon Transceivers"
                    className="w-full bg-[#090a0f] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-rose-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-xs text-slate-300">Proposal Rationale & Description:</label>
                  <textarea
                    rows={4}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe the proposed protocol adjustment..."
                    className="w-full bg-[#090a0f] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-rose-500 outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all cursor-pointer uppercase"
                >
                  SUBMIT PROPOSAL TO COUNCIL
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
