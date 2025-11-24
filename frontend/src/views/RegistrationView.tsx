import React, { useState, useContext, useEffect } from 'react';
import { UserPlus, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { TournamentContext, SPORTS, EVENTS, generateId, getInitials } from '../context/TournamentContext';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden ${className}`}>
        {children}
    </div>
);

export default function RegistrationView() {
    const { players, setPlayers, addToast, addActivity, selectedSport } = useContext(TournamentContext)!;
    const [formData, setFormData] = useState({ name: '', club: '', event: 'U15 Singles', sport: selectedSport.id });
    const [searchTerm, setSearchTerm] = useState('');

    // Update local form sport when global context changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, sport: selectedSport.id }));
    }, [selectedSport]);

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.club) return addToast('Name and Club are required.', 'error');
        if (players.some(p => p.name.toLowerCase() === formData.name.toLowerCase())) return addToast('Player already registered.', 'error');

        const newPlayer = {
            id: generateId('P'),
            name: formData.name,
            club: formData.club,
            events: [formData.event],
            sport: formData.sport
        };

        setPlayers(prev => [newPlayer, ...prev]);
        addActivity(`Registered new athlete: ${newPlayer.name} (${newPlayer.sport})`, 'registration');
        setFormData({ name: '', club: '', event: 'U15 Singles', sport: selectedSport.id });
        addToast(`Registered ${newPlayer.name} successfully.`);
    };

    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
            {/* Registration Form */}
            <div className="lg:col-span-1">
                <Card className="sticky top-24 h-fit border-indigo-100 shadow-indigo-100/50 shadow-lg">
                    <div className="p-8 bg-gradient-to-b from-indigo-50/50 to-transparent">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 text-indigo-600">
                            <UserPlus size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 font-[Outfit]">
                            New Registration
                        </h2>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Add a new athlete to the tournament roster. They will be available for {selectedSport.name} fixtures.
                        </p>
                    </div>
                    <div className="p-8 pt-0">
                        <form onSubmit={handleAddPlayer} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sport</label>
                                <div className="relative">
                                    <select
                                        value={formData.sport}
                                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none appearance-none text-sm font-semibold text-slate-700 cursor-pointer"
                                    >
                                        {SPORTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-300"
                                    placeholder="e.g. Michael Jordan"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Club / Team</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-300"
                                    placeholder="e.g. Bulls"
                                    value={formData.club}
                                    onChange={e => setFormData({ ...formData, club: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Event Category</label>
                                <div className="relative">
                                    <select
                                        value={formData.event}
                                        onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none appearance-none text-sm font-semibold text-slate-700 cursor-pointer"
                                    >
                                        {EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 mt-6 flex justify-center items-center active:scale-95 group">
                                <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" /> Add to Roster
                            </button>
                        </form>
                    </div>
                </Card>
            </div>

            {/* Player List */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                <Card className="flex-1 flex flex-col h-full border-none shadow-none bg-transparent">
                    <div className="p-1 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 font-[Outfit]">Current Roster</h2>
                            <p className="text-sm text-slate-500">Managing {players.length} athletes</p>
                        </div>
                        <div className="relative w-full sm:w-auto group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search athletes..."
                                className="w-full sm:w-72 pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                        <div className="space-y-3">
                            {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
                                <div key={player.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all group">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm mr-4 border border-white shadow-inner">
                                            {getInitials(player.name)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-base">{player.name}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                                                {player.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="hidden sm:block text-right">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sport</div>
                                            <div className="font-semibold text-slate-700 text-sm bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                {SPORTS.find(s => s.id === player.sport)?.icon} {SPORTS.find(s => s.id === player.sport)?.name || 'Unknown'}
                                            </div>
                                        </div>
                                        <div className="hidden md:block text-right">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Event</div>
                                            <div className="font-medium text-slate-600 text-sm">{player.events[0]}</div>
                                        </div>
                                        <button onClick={() => {
                                            setPlayers(players.filter(p => p.id !== player.id));
                                            addToast('Player removed', 'error');
                                        }} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Search size={32} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">No athletes found</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm">Try adjusting your search terms or register a new athlete.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
