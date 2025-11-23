// API Client for xSPRINT Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        // Load token from localStorage if exists
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email: string, password: string) {
        const response = await this.request<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.data?.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async register(userData: any) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async logout() {
        this.setToken(null);
        return { success: true };
    }

    // Player endpoints
    async getPlayers() {
        return this.request('/players');
    }

    async createPlayer(playerData: any) {
        return this.request('/players', {
            method: 'POST',
            body: JSON.stringify(playerData),
        });
    }

    async deletePlayer(playerId: string) {
        return this.request(`/players/${playerId}`, {
            method: 'DELETE',
        });
    }

    // Tournament endpoints
    async getTournaments() {
        return this.request('/tournaments');
    }

    async createTournament(tournamentData: any) {
        return this.request('/tournaments', {
            method: 'POST',
            body: JSON.stringify(tournamentData),
        });
    }

    async getTournament(tournamentId: string) {
        return this.request(`/tournaments/${tournamentId}`);
    }

    // Event endpoints
    async getEvents() {
        return this.request('/events');
    }

    async createEvent(eventData: any) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData),
        });
    }

    async registerPlayerToEvent(eventId: string, playerId: string) {
        return this.request('/events/register', {
            method: 'POST',
            body: JSON.stringify({ eventId, playerId }),
        });
    }

    async getEventRegistrations(eventId: string) {
        return this.request(`/events/${eventId}/registrations`);
    }

    // Fixture endpoints
    async generateFixtures(eventId: string, format: string, options?: any) {
        return this.request(`/events/${eventId}/fixtures/generate`, {
            method: 'POST',
            body: JSON.stringify({ type: format, format, ...options }),
        });
    }

    // Match endpoints
    async getMatches(eventId?: string) {
        const query = eventId ? `?eventId=${eventId}` : '';
        return this.request(`/matches${query}`);
    }

    async createMatch(matchData: any) {
        return this.request('/matches', {
            method: 'POST',
            body: JSON.stringify(matchData),
        });
    }

    async updateMatchScore(matchId: string, scoreData: any) {
        return this.request(`/matches/${matchId}/score`, {
            method: 'PATCH',
            body: JSON.stringify(scoreData),
        });
    }

    async submitMatchResult(matchCode: string, resultData: any) {
        return this.request(`/matches/submit/${matchCode}`, {
            method: 'POST',
            body: JSON.stringify(resultData),
        });
    }

    // Schedule endpoints
    async getSchedule(eventId?: string) {
        const query = eventId ? `?eventId=${eventId}` : '';
        return this.request(`/schedule${query}`);
    }

    // Leaderboard endpoints
    async getLeaderboard(eventId: string) {
        return this.request(`/events/${eventId}/standings`);
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
