import React, { useContext } from 'react';
import {
    Users,
    Trophy,
    Calendar,
    Activity,
    ChevronRight,
    UserPlus,
    TrendingUp,
    MoreHorizontal,
    CheckCircle,
    Medal,
    Dumbbell
} from 'lucide-react';
import { TournamentContext, SPORTS, COURTS } from '../context/TournamentContext';

// --- Shared UI Components ---
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden ${className}`}>
        {children}
    </div>
);

const StatCard = ({ label, value, icon, onClick, trend, color = "indigo" }: any) => {
    const gradients: any = {
        indigo: "from-indigo-500 to-purple-600",
        blue: "from-blue-500 to-cyan-500",
        emerald: "from-emerald-500 to-teal-500",
        amber: "from-amber-500 to-orange-500"
    };

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[color]} opacity-[0.03] rounded-bl-[100px] -z-0 group-hover:opacity-[0.08] transition-opacity`}></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-3.5 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-white group-hover:bg-gradient-to-br ${gradients[color]} transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                        <TrendingUp size={12} className="mr-1.5" /> {trend}
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <div className="text-3xl font-black text-slate-900 mb-1 tracking-tight font-[Outfit]">{value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
};

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

export default function DashboardOverview({ setActiveView }: { setActiveView: (view: string) => void }) {
    const { players, matches, recentActivity, selectedSport, setSelectedSport } = useContext(TournamentContext)!;

    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const totalMatches = matches.length;
    const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute right-[-50px] top-[-50px] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">System Operational</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight font-[Outfit]">
                        Tournament Dashboard
                    </h1>
                    <p className="text-slate-300 text-lg mb-8 font-light max-w-lg">
                        Welcome back. You have <strong className="text-white">{matches.filter(m => m.status === 'scheduled').length} active matches</strong> scheduled for today.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => setActiveView('fixtures')} className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg flex items-center">
                            View Bracket <ChevronRight size={16} className="ml-2" />
                        </button>
                        <button onClick={() => setActiveView('register')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors flex items-center">
                            <UserPlus size={16} className="mr-2" /> New Entry
                        </button>
                    </div>
                </div>
            </div>

            {/* Sports Selector - NEW */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <Dumbbell className="mr-2 text-indigo-600" size={20} /> Browse by Sport
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SPORTS.map(sport => (
                        <div
                            key={sport.id}
                            onClick={() => setSelectedSport(sport)}
                            className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group ${selectedSport.id === sport.id ? 'ring-4 ring-offset-2 ring-indigo-500 scale-[1.02]' : 'hover:scale-[1.02] hover:shadow-lg'}`}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img src={sport.image} alt={sport.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${sport.gradient} opacity-80 group-hover:opacity-70 transition-opacity`}></div>

                            <div className="relative p-6 flex flex-col items-center justify-center h-full text-white">
                                <span className="text-4xl mb-2 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{sport.icon}</span>
                                <span className="font-bold text-lg tracking-tight drop-shadow-sm">{sport.name}</span>
                                {selectedSport.id === sport.id && (
                                    <div className="absolute top-3 right-3 bg-white text-indigo-600 p-1 rounded-full shadow-sm animate-in zoom-in">
                                        <CheckCircle size={12} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label={`Total ${selectedSport.name} Athletes`}
                    value={players.filter(p => p.sport === selectedSport.id).length}
                    icon={<Users size={22} />}
                    onClick={() => setActiveView('register')}
                    trend="+12%"
                    color="blue"
                />
                <StatCard
                    label="Scheduled Matches"
                    value={matches.filter(m => m.status === 'scheduled').length}
                    icon={<Calendar size={22} />}
                    onClick={() => setActiveView('schedule')}
                    color="amber"
                />
                <StatCard
                    label="Completed"
                    value={completedMatches}
                    icon={<Medal size={22} />}
                    onClick={() => setActiveView('leaderboard')}
                    trend={`${progress}% Done`}
                    color="indigo"
                />
                <StatCard
                    label="Active Courts"
                    value={COURTS.filter(c => c.status === 'Live').length}
                    icon={<Activity size={22} />}
                    onClick={() => setActiveView('schedule')}
                    color="emerald"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Progress Section */}
                    <Card className="p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <Trophy size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Tournament Progress</h3>
                                    <p className="text-sm text-slate-500">Live match completion tracking</p>
                                </div>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-black text-indigo-600 font-[Outfit]">{completedMatches}</span>
                                    <span className="text-slate-400 text-lg font-medium ml-1">/{totalMatches}</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Qualifiers</span>
                                <span>Quarter Finals</span>
                                <span>Finals</span>
                            </div>
                        </div>
                    </Card>

                    {/* Activity Feed in Dashboard */}
                    <Card className="p-0">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Recent Activity</h3>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {recentActivity.map(item => (
                                <div key={item.id} className="p-4 px-6 flex items-start space-x-4 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1.5 min-w-[8px] h-[8px] rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700 leading-snug">{item.text}</p>
                                        <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                                    </div>
                                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Feed */}
                <div className="space-y-6">
                    <Card className="p-0 h-fit">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-sm">Live Court Status</h3>
                            <MoreHorizontal size={16} className="text-slate-400 cursor-pointer hover:text-indigo-500" />
                        </div>
                        <div className="divide-y divide-slate-50">
                            {COURTS.map(court => (
                                <div key={court.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center">
                                        <div className={`relative w-3 h-3 rounded-full mr-4 flex-shrink-0 ${court.status === 'Live' ? 'bg-emerald-500' : court.status === 'Maintenance' ? 'bg-red-400' : 'bg-slate-300'}`}>
                                            {court.status === 'Live' && <span className="absolute top-0 left-0 w-full h-full rounded-full bg-emerald-500 animate-ping opacity-75"></span>}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{court.name}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{court.type}</div>
                                        </div>
                                    </div>
                                    <Badge color={court.status === 'Live' ? 'green' : court.status === 'Maintenance' ? 'red' : 'slate'}>
                                        {court.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                            <button onClick={() => setActiveView('schedule')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wide">Manage Courts</button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
