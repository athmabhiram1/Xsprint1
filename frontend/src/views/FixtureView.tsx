import { useContext, useState } from 'react';
import { Zap, Activity, Medal, Users, GitBranch, Grid3x3, Shuffle, Trophy, Loader2 } from 'lucide-react';
import { TournamentContext, COURTS, generateId, generateMatchCode } from '../context/TournamentContext';
import { apiClient } from '../api/client';

const TOURNAMENT_FORMATS = [
    { id: 'knockout', name: 'Knockout', icon: Trophy, description: 'Single elimination bracket' },
    { id: 'roundrobin', name: 'Round Robin', icon: Users, description: 'Everyone plays everyone' },
    { id: 'groups_then_playoff', name: 'Groups + Playoff', icon: Grid3x3, description: 'Group stage then knockout' },
    { id: 'swiss', name: 'Swiss System', icon: Shuffle, description: 'Opponents based on performance' },
    { id: 'double_elimination', name: 'Double Elimination', icon: GitBranch, description: 'Winners and losers bracket' }
];

export default function FixtureView() {
    const { players, matches, setMatches, addToast, addActivity } = useContext(TournamentContext)!;
    const [selectedFormat, setSelectedFormat] = useState('knockout');
    const [numGroups, setNumGroups] = useState(4);
    const [swissRounds, setSwissRounds] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateFixtures = () => {
        if (players.length < 2) return addToast('Need at least 2 players to generate fixtures.', 'error');
        
        setIsGenerating(true);
        
        // Use setTimeout to prevent UI blocking
        setTimeout(() => {
            try {
                generateFixturesLocal();
                const formatName = TOURNAMENT_FORMATS.find(f => f.id === selectedFormat)?.name || 'Tournament';
                addToast(`${formatName} fixtures generated successfully!`, 'success');
            } catch (error: any) {
                console.error('Fixture generation error:', error);
                addToast(error.message || 'Failed to generate fixtures', 'error');
            } finally {
                setIsGenerating(false);
            }
        }, 100);
    };

    const generateFixturesLocal = () => {

        let pool = [...players].sort(() => Math.random() - 0.5);

        // Club Avoidance Logic
        let attempts = 0;
        while (attempts < 5) {
            let conflicts = 0;
            for (let i = 0; i < pool.length - 1; i += 2) {
                if (pool[i].club === pool[i + 1].club) {
                    conflicts++;
                    const swapIdx = (i + 2) % pool.length;
                    [pool[i + 1], pool[swapIdx]] = [pool[swapIdx], pool[i + 1]];
                }
            }
            if (conflicts === 0) break;
            attempts++;
        }

        const newMatches = [];
        let currentTime = new Date();
        currentTime.setHours(9, 0, 0, 0);

        for (let i = 0; i < pool.length; i += 2) {
            const p1 = pool[i];
            const p2 = pool[i + 1];

            if (p2) {
                newMatches.push({
                    id: generateId('M'),
                    p1, p2,
                    winner: null,
                    court: COURTS[i % COURTS.length].id,
                    startTime: new Date(currentTime.getTime() + (i * 15 * 60000)), // Staggered starts
                    status: 'scheduled',
                    matchCode: generateMatchCode(),
                    scores: { p1: 0, p2: 0 },
                    isBye: false
                });
            } else {
                newMatches.push({
                    id: generateId('BYE'),
                    p1, p2: { name: 'BYE', id: 'bye', club: '-' },
                    winner: p1.id,
                    status: 'completed',
                    matchCode: '-',
                    isBye: true
                });
            }
        }
        // @ts-ignore
        setMatches(newMatches);
        addActivity('Generated fixtures for Round 1', 'system');
        addToast('Fixtures generated successfully!');
    };

    return (
        <div className="space-y-8">
            {/* Format Selection */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-slate-900 font-[Outfit] mb-2">Tournament Format</h2>
                    <p className="text-slate-500 text-sm mb-6">Select the competition structure for your event</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        {TOURNAMENT_FORMATS.map((format) => {
                            const Icon = format.icon;
                            return (
                                <button
                                    key={format.id}
                                    onClick={() => setSelectedFormat(format.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                                        selectedFormat === format.id
                                            ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className={`mb-2 ${selectedFormat === format.id ? 'text-indigo-600' : 'text-slate-400'}`} size={24} />
                                    <div className="font-bold text-sm text-slate-900">{format.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">{format.description}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Format-specific options */}
                    {selectedFormat === 'groups_then_playoff' && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Number of Groups</label>
                            <input
                                type="number"
                                min="2"
                                max="8"
                                value={numGroups}
                                onChange={(e) => setNumGroups(parseInt(e.target.value))}
                                className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    )}

                    {selectedFormat === 'swiss' && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Number of Rounds</label>
                            <input
                                type="number"
                                min="3"
                                max="10"
                                value={swissRounds}
                                onChange={(e) => setSwissRounds(parseInt(e.target.value))}
                                className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        {matches.length > 0 && (
                            <button 
                                onClick={() => setMatches([])} 
                                className="px-5 py-3 text-slate-500 font-bold text-sm hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                Reset Fixtures
                            </button>
                        )}
                        <button
                            onClick={generateFixtures}
                            disabled={isGenerating}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" size={18} />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 group-hover:text-yellow-300 transition-colors" size={18} fill="currentColor" /> 
                                    Generate {TOURNAMENT_FORMATS.find(f => f.id === selectedFormat)?.name} Fixtures
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {matches.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 bg-slate-50/50 pattern-grid-lg opacity-50 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 mx-auto transform rotate-3">
                            <Activity size={40} className="text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 font-[Outfit]">Ready to Generate</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
                            The engine is ready. Ensure all athletes are registered, then click the generate button to create the automatic draw.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {matches.map((m, idx) => (
                        <div key={m.id} className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 relative group ${m.isBye ? 'border-emerald-100' : 'border-slate-100'}`}>
                            {/* Decorative Top Bar */}
                            <div className={`h-2 w-full ${m.isBye ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}></div>

                            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                                    {m.isBye ? 'Bye Round' : `Match #${idx + 1}`}
                                </span>
                                {!m.isBye && <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-bold tracking-wider shadow-sm">{m.matchCode}</span>}
                            </div>

                            <div className="p-6 relative">
                                {/* Player 1 */}
                                <div className={`flex justify-between items-center mb-4 p-3 rounded-2xl transition-colors ${m.winner === m.p1.id ? 'bg-emerald-50 border border-emerald-100' : 'bg-transparent border border-transparent'} ${m.winner && m.winner !== m.p1.id ? 'opacity-40 grayscale' : ''}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${m.winner === m.p1.id ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-100 text-slate-600'}`}>
                                            {m.p1.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight">{m.p1.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{m.p1.club}</p>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-black text-xl ${m.winner === m.p1.id ? 'text-emerald-600' : 'text-slate-300'}`}>{!m.isBye && m.status !== 'scheduled' ? m.scores?.p1 : '-'}</div>
                                </div>

                                {/* VS Connector */}
                                <div className="absolute left-10 top-1/2 -translate-y-1/2 -ml-px w-0.5 h-8 bg-slate-100 z-0"></div>
                                <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white border border-slate-100 text-[8px] font-black text-slate-300 px-1.5 py-0.5 rounded-full z-10">VS</div>

                                {/* Player 2 */}
                                <div className={`flex justify-between items-center mt-4 p-3 rounded-2xl transition-colors ${m.winner === m.p2.id ? 'bg-emerald-50 border border-emerald-100' : 'bg-transparent border border-transparent'} ${m.winner && m.winner !== m.p2.id ? 'opacity-40 grayscale' : ''}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${m.p2.id === 'bye' ? 'bg-slate-50 text-slate-300' : m.winner === m.p2.id ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-100 text-slate-600'}`}>
                                            {m.p2.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm leading-tight ${m.p2.id === 'bye' ? 'text-slate-400 italic' : 'text-slate-800'}`}>{m.p2.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{m.p2.club}</p>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-black text-xl ${m.winner === m.p2.id ? 'text-emerald-600' : 'text-slate-300'}`}>{!m.isBye && m.status !== 'scheduled' ? m.scores?.p2 : '-'}</div>
                                </div>

                                {/* Winner Indicator Overlay */}
                                {m.winner && (
                                    <div className="absolute top-1/2 right-6 -translate-y-1/2 pointer-events-none">
                                        <Medal className="text-emerald-500 drop-shadow-sm opacity-20 rotate-12" size={64} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
