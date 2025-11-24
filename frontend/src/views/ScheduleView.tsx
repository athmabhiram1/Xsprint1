import { useContext } from 'react';
import { Clock, Activity, Calendar } from 'lucide-react';
import { TournamentContext, COURTS } from '../context/TournamentContext';

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

export default function ScheduleView() {
    const { matches } = useContext(TournamentContext)!;

    const getRelaxationTime = (startDate: Date) => {
        if (!startDate) return { end: new Date(), relaxEnd: new Date() }; // Safety fallback
        const end = new Date(startDate);
        end.setMinutes(end.getMinutes() + 30); // 30 min match duration
        const relaxEnd = new Date(end);
        relaxEnd.setMinutes(relaxEnd.getMinutes() + 10); // 10 min rest
        return { end, relaxEnd };
    }

    const formatTime = (date: Date) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 font-[Outfit]">Court Schedule</h2>
                    <p className="text-slate-500 text-sm mt-1">Real-time allocation timeline</p>
                </div>
                <div className="flex space-x-4 text-xs font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm mr-2 shadow-sm"></span> Match Block</div>
                    <div className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-300 rounded-sm mr-2 shadow-sm"></span> Rest Period</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COURTS.map(court => {
                    const courtMatches = matches.filter(m => m.court === court.id && !m.isBye).sort((a, b) => (a.startTime && b.startTime) ? a.startTime.getTime() - b.startTime.getTime() : 0);

                    return (
                        <div key={court.id} className="flex flex-col h-full min-h-[600px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-black text-lg text-slate-800 block">{court.name}</span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{court.type} Court</span>
                                    </div>
                                    <Badge color={courtMatches.length > 0 ? 'indigo' : 'slate'}>{courtMatches.length} Matches</Badge>
                                </div>
                            </div>

                            <div className="p-6 space-y-0 flex-1 overflow-y-auto relative">
                                {/* Background Lines */}
                                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 60px' }}></div>

                                {courtMatches.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                                        <Calendar size={48} className="mb-3 stroke-1" />
                                        <span className="text-sm font-bold">No matches</span>
                                    </div>
                                ) : (
                                    courtMatches.map((m) => {
                                        const times = getRelaxationTime(m.startTime!);
                                        return (
                                            <div key={m.id} className="relative pl-8 pb-8 last:pb-0 group">
                                                {/* Timeline Line */}
                                                <div className="absolute left-[9px] top-3 bottom-0 w-[2px] bg-slate-100 group-last:bg-gradient-to-b group-last:from-slate-100 group-last:to-transparent"></div>
                                                {/* Timeline Dot */}
                                                <div className="absolute left-[4px] top-3 w-3 h-3 rounded-full bg-white border-[3px] border-indigo-500 z-10 shadow-sm"></div>

                                                <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                            <Clock size={10} className="mr-1.5 text-indigo-500" />
                                                            {formatTime(m.startTime!)}
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-slate-300">{m.matchCode}</span>
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-800 mb-1 leading-snug">
                                                        {m.p1.name} <span className="text-slate-300 font-light mx-1">vs</span> {m.p2.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium truncate">{m.p1.club} • {m.p2.club}</div>

                                                    {/* Relaxation Block */}
                                                    <div className="mt-3 flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg w-fit border border-amber-100/50">
                                                        <Activity size={10} className="mr-1.5" />
                                                        Rest until {formatTime(times.relaxEnd)}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
