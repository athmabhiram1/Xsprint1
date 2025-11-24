import React, { useState, useContext } from 'react';
import { ShieldCheck, ChevronRight, Zap, CheckCircle } from 'lucide-react';
import { TournamentContext, COURTS } from '../context/TournamentContext';

export default function UmpireView() {
    const { matches, setMatches, addToast, addActivity } = useContext(TournamentContext)!;
    const [code, setCode] = useState('');
    const [activeMatch, setActiveMatch] = useState<any>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const match = matches.find(m => m.matchCode === code && !m.isBye);
        if (match) {
            setActiveMatch(match);
            addActivity(`Umpire logged into Match ${match.matchCode}`, 'system');
            addToast('Match access granted.');
        } else {
            addToast('Invalid Match Code.', 'error');
        }
    };

    const updateScore = (player: 'p1' | 'p2', delta: number) => {
        if (!activeMatch || activeMatch.status === 'completed') return;

        setMatches(prev => prev.map(m => {
            if (m.id === activeMatch.id) {
                const currentScores = m.scores || { p1: 0, p2: 0 };
                const newScores = {
                    ...currentScores,
                    [player]: Math.max(0, (currentScores[player] || 0) + delta)
                };
                // Ensure the object matches the Match interface
                const updated = { ...m, status: 'in_progress' as const, scores: newScores };
                setActiveMatch(updated);
                return updated;
            }
            return m;
        }));
    };

    const finishMatch = () => {
        if (activeMatch.scores.p1 === activeMatch.scores.p2) return addToast('Cannot end in a draw.', 'error');
        const winnerId = activeMatch.scores.p1 > activeMatch.scores.p2 ? activeMatch.p1.id : activeMatch.p2.id;
        const winnerName = activeMatch.scores.p1 > activeMatch.scores.p2 ? activeMatch.p1.name : activeMatch.p2.name;

        // @ts-ignore
        setMatches(prev => prev.map(m => m.id === activeMatch.id ? { ...m, status: 'completed', winner: winnerId } : m));
        addActivity(`Match ${activeMatch.matchCode} Completed. Winner: ${winnerName}`, 'match_end');
        setActiveMatch(null);
        setCode('');
        addToast('Match result submitted successfully!');
    };

    if (!activeMatch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <div className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl shadow-indigo-200/50 overflow-hidden relative border border-white">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner transform rotate-3">
                            <ShieldCheck className="h-10 w-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-[Outfit]">Umpire Access</h2>
                        <p className="text-slate-500 mb-8 text-sm mt-3 leading-relaxed">Enter the 6-digit match code to begin live scoring for your assigned court.</p>

                        <form onSubmit={handleLogin} className="relative">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-5 border-2 border-slate-100 rounded-2xl mb-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none uppercase transition-all bg-slate-50 focus:bg-white placeholder:text-slate-200"
                                placeholder="000000"
                                maxLength={6}
                            />
                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-300 active:scale-95 group">
                                Enter Match Mode <ChevronRight className="inline ml-1 group-hover:translate-x-1 transition-transform" size={16} />
                            </button>
                        </form>
                    </div>
                    <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center justify-center">
                            <Zap size={10} className="mr-1 text-amber-500" fill="currentColor" /> Secured Xthlete System
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto relative">
            {/* Phone Frame Effect */}
            <div className="absolute -inset-2 bg-slate-900 rounded-[40px] opacity-10 blur-xl"></div>
            <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl relative border-4 border-slate-900">

                {/* Header */}
                <div className="bg-slate-900 text-white p-6 pb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Live Scoring</span>
                            </div>
                            <div className="font-bold text-lg leading-tight">{COURTS.find(c => c.id === activeMatch.court)?.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Match ID</div>
                            <div className="font-mono font-bold text-xl">{activeMatch.matchCode}</div>
                        </div>
                    </div>
                </div>

                {/* Score Card Card - Floating Over Header */}
                <div className="relative px-6 -mt-8 pb-6 space-y-4">
                    {/* Player 1 */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                        <div className="flex justify-between items-center mb-6 pl-2">
                            <div>
                                <span className="font-black text-xl text-slate-900 block leading-none mb-1">{activeMatch.p1.name}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{activeMatch.p1.club}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <button onClick={() => updateScore('p1', -1)} className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 active:bg-slate-200 flex items-center justify-center text-xl font-bold transition-all active:scale-90">-</button>
                            <div className="text-6xl font-black text-slate-900 tabular-nums tracking-tighter">{activeMatch.scores.p1}</div>
                            <button onClick={() => updateScore('p1', 1)} className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 text-2xl font-bold transition-all active:scale-90 active:shadow-none">+</button>
                        </div>
                    </div>

                    {/* VS Badge */}
                    <div className="flex justify-center -my-6 relative z-10">
                        <span className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md border-2 border-white">VS</span>
                    </div>

                    {/* Player 2 */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500"></div>
                        <div className="flex justify-between items-center mb-6 pl-2">
                            <div>
                                <span className="font-black text-xl text-slate-900 block leading-none mb-1">{activeMatch.p2.name}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{activeMatch.p2.club}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <button onClick={() => updateScore('p2', -1)} className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 active:bg-slate-200 flex items-center justify-center text-xl font-bold transition-all active:scale-90">-</button>
                            <div className="text-6xl font-black text-slate-900 tabular-nums tracking-tighter">{activeMatch.scores.p2}</div>
                            <button onClick={() => updateScore('p2', 1)} className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200 hover:bg-purple-700 text-2xl font-bold transition-all active:scale-90 active:shadow-none">+</button>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-slate-50 p-6 grid grid-cols-2 gap-4 border-t border-slate-100">
                    <button onClick={() => setActiveMatch(null)} className="py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors bg-white border border-slate-200 rounded-2xl hover:border-slate-300">Suspend</button>
                    <button onClick={finishMatch} className="bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center">
                        Finalize <CheckCircle size={18} className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
}
