import { useState, useContext } from 'react';
import {
    Trophy,
    LayoutDashboard,
    Users,
    Activity,
    Calendar,
    ShieldCheck,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { TournamentContext, getInitials } from '../context/TournamentContext';
import DashboardOverview from '../views/DashboardOverview';
import RegistrationView from '../views/RegistrationView';
import FixtureView from '../views/FixtureView';
import ScheduleView from '../views/ScheduleView';
import UmpireView from '../views/UmpireView';
import LeaderboardView from '../views/LeaderboardView';

const NavButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium relative group
      ${active
                ? 'text-white bg-white/10 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
        <span className={`transition-transform duration-300 ${active ? 'scale-110 text-indigo-400' : 'group-hover:text-indigo-300'}`}>{icon}</span>
        <span>{label}</span>
        {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}
    </button>
);

export default function DashboardShell() {
    const [activeView, setActiveView] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useContext(TournamentContext)!;

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardOverview setActiveView={setActiveView} />;
            case 'register': return <RegistrationView />;
            case 'fixtures': return <FixtureView />;
            case 'schedule': return <ScheduleView />;
            case 'umpire': return <UmpireView />;
            case 'leaderboard': return <LeaderboardView />;
            default: return <DashboardOverview setActiveView={setActiveView} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative z-10">
            {/* Modern Top Navigation - Glassmorphism */}
            <nav className="sticky top-4 mx-4 md:mx-6 lg:mx-8 z-40 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-slate-900/20 text-white transition-all duration-300">
                <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Brand */}
                        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveView('dashboard')}>
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/30">
                                <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-lg leading-none tracking-tight text-white font-[Outfit]">XTHLETE</span>
                                <span className="text-[10px] text-indigo-200 font-semibold tracking-widest uppercase">Manager Pro</span>
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex space-x-1">
                            <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard size={18} />} label="Overview" />
                            <NavButton active={activeView === 'register'} onClick={() => setActiveView('register')} icon={<Users size={18} />} label="Athletes" />
                            <NavButton active={activeView === 'fixtures'} onClick={() => setActiveView('fixtures')} icon={<Activity size={18} />} label="Bracket" />
                            <NavButton active={activeView === 'schedule'} onClick={() => setActiveView('schedule')} icon={<Calendar size={18} />} label="Schedule" />
                            <NavButton active={activeView === 'umpire'} onClick={() => setActiveView('umpire')} icon={<ShieldCheck size={18} />} label="Umpire" />
                            <NavButton active={activeView === 'leaderboard'} onClick={() => setActiveView('leaderboard')} icon={<Trophy size={18} />} label="Results" />
                        </div>

                        {/* User Profile & Mobile Toggle */}
                        <div className="flex items-center space-x-4">
                            {/* User Menu */}
                            <div className="hidden md:flex items-center pl-4 border-l border-white/10">
                                <div className="text-right mr-3">
                                    <div className="text-sm font-bold leading-none">{user?.name}</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admin</div>
                                </div>
                                <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xs border border-white/20 shadow-inner">
                                    {getInitials(user?.name || 'Admin')}
                                </div>
                                <button onClick={logout} className="ml-3 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Sign Out">
                                    <LogOut size={18} />
                                </button>
                            </div>

                            {/* Mobile Toggle */}
                            <div className="md:hidden">
                                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300 hover:text-white transition-colors">
                                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-700/50 px-2 pt-2 pb-3 space-y-1">
                        {['dashboard', 'register', 'fixtures', 'schedule', 'umpire', 'leaderboard'].map((view) => (
                            <button
                                key={view}
                                onClick={() => { setActiveView(view); setIsMobileMenuOpen(false); }}
                                className={`block w-full text-left px-3 py-3 rounded-xl text-sm font-medium capitalize flex items-center transition-colors ${activeView === view ? 'bg-indigo-600/50 text-white' : 'text-slate-300 hover:bg-slate-800/50'}`}
                            >
                                {view}
                            </button>
                        ))}
                        <button onClick={logout} className="block w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-slate-800/50 flex items-center mt-2 border-t border-white/5">
                            <LogOut size={16} className="mr-2" /> Sign Out
                        </button>
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                {renderView()}
            </main>

            {/* Footer */}
            <footer className="mt-auto py-8 text-center text-xs text-slate-400 relative z-10">
                <p className="font-medium">© 2024 Xthlete Systems • Enterprise Edition v2.5</p>
            </footer>
        </div>
    );
}
