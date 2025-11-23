import React, { useState, useContext } from 'react';
import { Trophy, Mail, Lock, Loader2, ChevronRight } from 'lucide-react';
import { TournamentContext } from '../context/TournamentContext';

export default function LoginScreen() {
    const { login } = useContext(TournamentContext)!;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email || 'admin@xthlete.com', password || 'password');
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 p-8 md:p-12 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 transform rotate-3">
                        <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 font-[Outfit] tracking-tight text-center">XTHLETE OS</h1>
                    <p className="text-slate-500 text-sm font-medium tracking-widest uppercase mt-2">Tournament Manager Pro</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-300"
                                placeholder="admin@xthlete.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-300 active:scale-95 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="animate-spin mr-2" size={20} /> Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    Sign In <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" size={18} />
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Test Credentials</p>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-mono font-bold text-slate-700">admin@test.com</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Password:</span>
                            <span className="font-mono font-bold text-slate-700">Admin123!</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Protected by Enterprise Grade Security
                    </p>
                </div>
            </div>

            <div className="mt-8 text-slate-400 text-xs font-medium">
                © 2024 Xthlete Systems Inc.
            </div>
        </div>
    );
}
