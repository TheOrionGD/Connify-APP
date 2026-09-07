import React, { useState } from 'react';
import { 
  Award, Shield, FileCheck, HelpCircle, ArrowUpRight,
  Vote, CheckCircle2, ThumbsUp, ThumbsDown, Calendar, Users, Plus, Check,
  Layers3, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Proposal } from '../types';
import CardSwipeDeck from './CardSwipeDeck';

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
  const [showFaqModal, setShowFaqModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');

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
    <section id="governance-council" className="space-y-12 py-8 font-sans">
      
      {/* Header - High Contrast White Text for Dark Background */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30 backdrop-blur-md">
          <Award className="h-4 w-4 text-rose-400" />
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
            DECENTRALIZED COMMUNITY COUNCIL
          </span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight drop-shadow-md">
          Trust Vetting &amp; Consensus <span className="text-rose-500">Governance</span>
        </h2>
        <p className="font-sans text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Connify safety rules, responder verification thresholds, and encryption standards are debated and cryptographically voted on by the community.
        </p>

        <div className="flex justify-center items-center gap-4 text-xs font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-rose-400" /> Self-Sovereign DAO</span>
          <span className="flex items-center gap-1"><FileCheck className="h-3.5 w-3.5 text-emerald-400" /> Ed25519 Signed Votes</span>
          <button 
            onClick={() => setShowFaqModal(true)}
            className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" /> Governance FAQ
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-5xl mx-auto border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2.5">
          <Vote className="h-5 w-5 text-rose-400" />
          <span className="font-display font-bold text-white text-lg tracking-wide">Active Protocol Proposals</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#12141d] p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('swipe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'swipe' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Swipe Vote Deck"
            >
              <Layers3 className="w-3.5 h-3.5" />
              <span>Swipe Deck</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center space-x-2 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>SUBMIT PROPOSAL</span>
          </button>
        </div>
      </div>

      {/* Swipe Deck Mode for Community Council Proposals */}
      {viewMode === 'swipe' ? (
        <CardSwipeDeck<Proposal>
          items={proposals}
          stackHeight="h-[450px]"
          badgeText="Swipe RIGHT to Vote FOR • Swipe LEFT to Vote AGAINST"
          onCardSwiped={(direction, prop) => {
            if (direction === 'right') {
              handleVote(String(prop.id), 'for');
            } else {
              handleVote(String(prop.id), 'against');
            }
          }}
          renderCard={(prop, isTop) => {
            const totalVotes = prop.votesFor + prop.votesAgainst;
            const pctFor = getPercentage(prop.votesFor, totalVotes);
            const hasVoted = votedList.includes(String(prop.id));

            return (
              <div className={`w-full h-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden relative ${
                isTop ? 'ring-2 ring-rose-500/20' : ''
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1">
                      <FileCheck className="h-3 w-3 text-rose-600" /> {prop.id}
                    </span>
                    <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 uppercase font-bold shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {prop.status}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mb-2 leading-snug">{prop.title}</h3>
                  <p className="font-sans text-sm text-slate-700 leading-relaxed font-medium">{prop.description}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {/* Vote Percentage Progress Bar */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-700 font-bold">
                      <span className="text-emerald-700 flex items-center gap-1"><Users className="h-3 w-3" /> FOR: {pctFor}% ({prop.votesFor})</span>
                      <span className="text-slate-600">AGAINST: {100 - pctFor}% ({prop.votesAgainst})</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                      <div style={{ width: `${pctFor}%` }} className="bg-emerald-500 h-full"></div>
                      <div style={{ width: `${100 - pctFor}%` }} className="bg-slate-400 h-full"></div>
                    </div>
                  </div>

                  {/* Vote Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(String(prop.id), 'for');
                      }}
                      disabled={hasVoted}
                      className={`py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        hasVoted 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4 text-emerald-600" />
                      <span>VOTE FOR</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(String(prop.id), 'against');
                      }}
                      disabled={hasVoted}
                      className={`py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        hasVoted 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4 text-slate-600" />
                      <span>AGAINST</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        />
      ) : (
        /* Proposals Grid (High Contrast Light Theme Cards) */
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {proposals.map((prop) => {
            const totalVotes = prop.votesFor + prop.votesAgainst;
            const pctFor = getPercentage(prop.votesFor, totalVotes);
            const hasVoted = votedList.includes(String(prop.id));

            return (
              <div key={prop.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">{prop.id}</span>
                    <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase font-bold flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-600" /> {prop.status}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">{prop.title}</h3>
                  <p className="font-sans text-xs text-slate-700 font-medium leading-relaxed">{prop.description}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {/* Vote Percentage Progress Bar */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-700 font-bold">
                      <span className="text-emerald-700">FOR: {pctFor}%</span>
                      <span className="text-slate-600">AGAINST: {100 - pctFor}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      <div style={{ width: `${pctFor}%` }} className="bg-emerald-500 h-full"></div>
                      <div style={{ width: `${100 - pctFor}%` }} className="bg-slate-400 h-full"></div>
                    </div>
                  </div>

                  {/* Vote Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleVote(String(prop.id), 'for')}
                      disabled={hasVoted}
                      className={`py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        hasVoted 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                      <span>VOTE FOR</span>
                    </button>

                    <button
                      onClick={() => handleVote(String(prop.id), 'against')}
                      disabled={hasVoted}
                      className={`py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        hasVoted 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm'
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5 text-slate-600" />
                      <span>AGAINST</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Community Trust Score Calculator Widget (Light Theme Card with High Contrast) */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-rose-600" /> REPUTATION CALCULATOR
            </span>
            <h3 className="font-display font-extrabold text-xl text-slate-900">Community Trust Score Simulator</h3>
          </div>
          <div className="text-right">
            <span className="font-tech text-3xl font-extrabold text-emerald-600">{computedTrustScore}</span>
            <span className="block font-mono text-[10px] text-slate-500 font-semibold">TRUST SCORE (MAX 999)</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-800 font-bold flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-rose-600" /> Escorts Completed:
              </span>
              <span className="text-rose-600 font-extrabold text-sm">{escortsCount}</span>
            </div>
            <input 
              type="range" min="0" max="50" value={escortsCount} 
              onChange={(e) => setEscortsCount(Number(e.target.value))}
              className="w-full accent-rose-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-800 font-bold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Avg Response Time:
              </span>
              <span className="text-emerald-700 font-extrabold text-sm">{responseTimeSec}s</span>
            </div>
            <input 
              type="range" min="15" max="120" value={responseTimeSec} 
              onChange={(e) => setResponseTimeSec(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Modal for Submitting Proposal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-slate-900"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-display font-extrabold text-xl text-slate-900 flex items-center gap-2">
                  <Vote className="h-5 w-5 text-rose-600" /> Submit Protocol Proposal
                </h3>
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-mono text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProposal} className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-mono text-xs font-bold text-slate-800">Proposal Title:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Enable Sub-GHz Beacon Transceivers"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:border-rose-500 focus:bg-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-xs font-bold text-slate-800">Proposal Rationale &amp; Description:</label>
                  <textarea
                    rows={4}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe the proposed protocol adjustment..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:border-rose-500 focus:bg-white outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer uppercase flex items-center justify-center space-x-2"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>SUBMIT PROPOSAL TO COUNCIL</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Governance FAQ Modal */}
      <AnimatePresence>
        {showFaqModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl text-slate-900"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-rose-600" /> Council Voting Mechanics
                </h3>
                <button 
                  onClick={() => setShowFaqModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-sans text-slate-700 leading-relaxed">
                <p>
                  Proposals require a minimum threshold of 100 net votes to pass into active mesh firmware configuration. Votes are signed client-side with Ed25519 node keypairs to ensure 1-person 1-vote integrity without centralized identity tracking.
                </p>
              </div>

              <button
                onClick={() => setShowFaqModal(false)}
                className="w-full py-2.5 bg-rose-600 text-white font-mono text-xs font-bold rounded-xl cursor-pointer"
              >
                GOT IT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
