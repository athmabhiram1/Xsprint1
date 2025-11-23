import React, { useContext } from 'react';
import { Trophy } from 'lucide-react';
import { TournamentContext } from '../context/TournamentContext';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden ${className}`}>
        {children}
    </div>
);

const Badge = ({ children, color = 'slate', size = 'sm' }: any) => {
    const styles: any = {
        slate: 'bg-slate-100 text-slate-600 border-slate-200',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };
    const sizes: any = {
        sm: 'px-2.5 py-1 text-[10px]',
        md: 'px-3 py-1 text-xs'
    };
    return <span className={`inline-flex items-center border rounded-full font-bold uppercase tracking-wider shadow-sm ${sizes[size]} ${styles[color] || styles.slate}`}>{children}</span>;
};

export default function LeaderboardView() {
    const { matches } = useContext(TournamentContext)!;
    const completed = matches.filter(m => m.status === 'completed' || m.isBye);

    return (
        <div className="space-y-8">
            <div className="bg-slate-900 rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/80 to-transparent"></div>
                <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-105 transition-transform duration-1000">
                    <Trophy size={200} className="text-indigo-400" />
                </div>
                <div className="relative z-10 max-w-xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-200 border border-white/10">Official Records</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tight font-[Outfit]">Tournament Results</h2>
                    <p className="text-slate-400 text-base leading-relaxed">
                        Verified outcomes from all courts. Results are final once submitted by the designated umpire.
                    </p>
                </div>
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Winning Athlete</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Match Score</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Opponent</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {completed.length === 0 ? (
                                <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-medium">No matches completed yet. Check back later.</td></tr>
                            ) : (
                                completed.map(m => {
                                    const winnerName = m.winner === m.p1.id ? m.p1.name : m.p2.name;
                                    const loserName = m.winner === m.p1.id ? m.p2.name : m.p1.name;
                                    return (
                                        <tr key={m.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center">
                                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg mr-4 border border-amber-200 shadow-sm group-hover:scale-110 transition-transform">
                                                        <Trophy size={16} fill="currentColor" />
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-base">{winnerName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                                    {m.isBye ? 'W.O.' : `${m.scores?.p1} - ${m.scores?.p2}`}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-slate-500 font-medium">{loserName}</td>
                                            <td className="px-8 py-6 text-right">
                                                <Badge color={m.isBye ? 'slate' : 'green'}>
                                                    {m.isBye ? 'Walkover' : 'Official'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
