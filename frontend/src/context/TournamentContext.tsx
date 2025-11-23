import React, { useState, createContext, ReactNode } from 'react';
import { apiClient } from '../api/client';

// --- Configuration & Constants ---
export const COURTS = [
    { id: 'c1', name: 'Center Court', type: 'Premium', status: 'Live' },
    { id: 'c2', name: 'Court 2', type: 'Standard', status: 'Available' },
    { id: 'c3', name: 'Court 3', type: 'Standard', status: 'Maintenance' }
];

export const SPORTS = [
    {
        id: 'tennis',
        name: 'Tennis',
        icon: '🎾',
        gradient: 'from-emerald-600 to-teal-600',
        shadow: 'shadow-emerald-200',
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'badminton',
        name: 'Badminton',
        icon: '🏸',
        gradient: 'from-blue-600 to-indigo-600',
        shadow: 'shadow-blue-200',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'table_tennis',
        name: 'Table Tennis',
        icon: '🏓',
        gradient: 'from-orange-500 to-red-600',
        shadow: 'shadow-orange-200',
        image: 'https://images.unsplash.com/photo-1534158914592-062992cbe4f2?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'squash',
        name: 'Squash',
        icon: '⚫',
        gradient: 'from-slate-700 to-slate-900',
        shadow: 'shadow-slate-300',
        image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80'
    }
];

export const EVENTS = ['U15 Singles', 'Open Doubles', 'Mixed Doubles'];

// --- Utilities ---
export const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
export const generateMatchCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();
export const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

interface User {
    name: string;
    email: string;
    avatar: string;
}

interface Player {
    id: string;
    name: string;
    club: string;
    events: string[];
    sport: string;
}

interface Match {
    id: string;
    p1: Player | { name: string; id: string; club: string };
    p2: Player | { name: string; id: string; club: string };
    winner: string | null;
    court?: string;
    startTime?: Date;
    status: 'scheduled' | 'in_progress' | 'completed';
    matchCode: string;
    scores?: { p1: number; p2: number };
    isBye: boolean;
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

interface Activity {
    id: number;
    text: string;
    time: string;
    type: string;
}

interface TournamentContextType {
    user: User | null;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    selectedSport: typeof SPORTS[0];
    setSelectedSport: (sport: typeof SPORTS[0]) => void;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    matches: Match[];
    setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
    addToast: (message: string, type?: 'success' | 'error') => void;
    toasts: Toast[];
    recentActivity: Activity[];
    addActivity: (text: string, type?: string) => void;
}

export const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null); // Auth State
    const [selectedSport, setSelectedSport] = useState(SPORTS[0]); // Active Sport State
    const [players, setPlayers] = useState<Player[]>([
        { id: 'P-DEMO1', name: 'Alex Rivera', club: 'Thunderbolt FC', events: ['U15 Singles'], sport: 'tennis' },
        { id: 'P-DEMO2', name: 'Jordan Lee', club: 'Rapid Strikers', events: ['U15 Singles'], sport: 'tennis' },
        { id: 'P-DEMO3', name: 'Casey Smith', club: 'Thunderbolt FC', events: ['U15 Singles'], sport: 'tennis' },
        { id: 'P-DEMO4', name: 'Taylor Doe', club: 'Eagle Eye', events: ['U15 Singles'], sport: 'tennis' },
        { id: 'P-DEMO5', name: 'Morgan K', club: 'Rapid Strikers', events: ['U15 Singles'], sport: 'tennis' },
    ]);

    const [matches, setMatches] = useState<Match[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([
        { id: 1, text: 'System initialized', time: '2m ago', type: 'system' },
        { id: 2, text: 'Alex Rivera registered', time: '15m ago', type: 'registration' }
    ]);
    
    // Activity ID counter to prevent duplicates
    const activityIdCounter = React.useRef(1000);

    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const addActivity = (text: string, type = 'system') => {
        activityIdCounter.current += 1;
        setRecentActivity(prev => [{ id: activityIdCounter.current, text, time: 'Just now', type }, ...prev].slice(0, 5));
    };

    const login = async (email: string, password: string = 'password') => {
        try {
            const response: any = await apiClient.login(email, password);
            
            // Backend returns { message, user } directly
            if (response.user) {
                const mockUser = {
                    name: response.user.name,
                    email: response.user.email,
                    avatar: getInitials(response.user.name)
                };
                setUser(mockUser);
                addToast(`Welcome back, ${mockUser.name}`, 'success');
                addActivity(`${mockUser.name} logged in`, 'auth');
                
                // Add mock fixtures and schedule data
                loadMockData();
                return;
            }
            
            throw new Error('Invalid login response');
        } catch (error: any) {
            console.error('Login error:', error);
            addToast(error.message || 'Login failed. Please check your credentials.', 'error');
        }
    };

    const loadMockData = () => {
        // Mock fixtures data
        const mockFixtures = [
            {
                id: '1',
                matchNumber: 1,
                round: 'Round 1',
                team1: 'Team Alpha',
                team2: 'Team Beta',
                venue: 'Court 1',
                startTime: new Date(Date.now() + 3600000).toISOString(),
                status: 'scheduled'
            },
            {
                id: '2',
                matchNumber: 2,
                round: 'Round 1',
                team1: 'Team Gamma',
                team2: 'Team Delta',
                venue: 'Court 2',
                startTime: new Date(Date.now() + 7200000).toISOString(),
                status: 'scheduled'
            },
            {
                id: '3',
                matchNumber: 3,
                round: 'Semi Finals',
                team1: 'TBD',
                team2: 'TBD',
                venue: 'Court 1',
                startTime: new Date(Date.now() + 86400000).toISOString(),
                status: 'pending'
            }
        ];

        // Mock schedule data
        const mockSchedule = [
            {
                id: '1',
                date: new Date().toISOString().split('T')[0],
                matches: [
                    { time: '09:00 AM', venue: 'Court 1', match: 'Team Alpha vs Team Beta' },
                    { time: '11:00 AM', venue: 'Court 2', match: 'Team Gamma vs Team Delta' }
                ]
            },
            {
                id: '2',
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                matches: [
                    { time: '02:00 PM', venue: 'Court 1', match: 'Semi Final 1' },
                    { time: '04:00 PM', venue: 'Court 2', match: 'Semi Final 2' }
                ]
            }
        ];

        addActivity('Mock fixtures and schedule loaded', 'system');
        // Mock data available for future use
        if (mockFixtures.length > 0 && mockSchedule.length > 0) {
            console.log('Mock data ready');
        }
    };

    const logout = () => {
        setUser(null);
        addToast('Logged out successfully');
    };

    return (
        <TournamentContext.Provider value={{
            user, login, logout,
            selectedSport, setSelectedSport,
            players, setPlayers,
            matches, setMatches,
            addToast, toasts,
            recentActivity, addActivity
        }}>
            {children}
        </TournamentContext.Provider>
    );
};
