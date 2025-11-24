import { useContext } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { TournamentProvider, TournamentContext } from './context/TournamentContext';
import DashboardShell from './components/DashboardShell';
import LoginScreen from './components/LoginScreen';

// Wrapper to handle conditional rendering based on Auth
function MainLayout() {
    const { user, toasts } = useContext(TournamentContext)!;

    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Global Background Decor */}
            <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
            <div className="fixed top-[20%] left-[-5%] w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

            {/* Toast Notifications Global */}
            <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className={`pointer-events-auto flex items-center px-4 py-3 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md transform transition-all animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-white/90 text-red-700' : 'bg-white/90 text-slate-800'}`}>
                        {toast.type === 'error' ? <AlertCircle size={20} className="mr-3 text-red-500" /> : <CheckCircle size={20} className="text-emerald-500 mr-3" />}
                        <span className="font-medium text-sm">{toast.message}</span>
                    </div>
                ))}
            </div>

            {user ? <DashboardShell /> : <LoginScreen />}
        </div>
    );
}

export default function App() {
    return (
        <TournamentProvider>
            <MainLayout />
        </TournamentProvider>
    );
}
