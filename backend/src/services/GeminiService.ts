import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TournamentInsights {
    summary: string;
    keyStats: string[];
    predictions: string[];
}

export class GeminiService {
    private apiKey = process.env.GEMINI_API_KEY || "";
    private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

    private async callGemini(prompt: string): Promise<string> {
        if (!this.apiKey) {
            return "AI capabilities are currently unavailable (Missing API Key).";
        }

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
        } catch (error) {
            console.error("Gemini API Call Failed:", error);
            return "Failed to connect to AI service.";
        }
    }

    async chat(message: string, context?: string): Promise<string> {
        const prompt = `
            Context: ${context || "You are an assistant for a sports tournament management system."}
            User: ${message}
            Assistant:
        `;
        return this.callGemini(prompt);
    }

    async analyzeMatch(matchId: string): Promise<string> {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                playerA: true,
                playerB: true,
                event: true
            }
        });

        if (!match) throw new Error("Match not found");

        const prompt = `
            Act as an excited sports commentator. 
            Analyze the upcoming match between ${match.playerA?.name || 'Player A'} and ${match.playerB?.name || 'Player B'} 
            in the ${match.event?.name || 'Tournament'} event.
            Write a short, 2-sentence hype prediction.
        `;
        
        return this.callGemini(prompt);
    }

    /**
     * Generates AI insights for a specific tournament.
     */
    async generateTournamentInsights(tournamentId: string): Promise<TournamentInsights> {
        // 1. Fetch Tournament Data
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                events: {
                    include: {
                        _count: { select: { registrations: true } }
                    }
                }
            }
        });

        if (!tournament) {
            throw new Error("Tournament not found");
        }

        // 2. Calculate Basic Stats
        const totalEvents = tournament.events.length;
        const totalPlayers = tournament.events.reduce((sum, event) => sum + event._count.registrations, 0);

        // 3. Generate AI Insights
        const prompt = `
            Analyze the following tournament data and provide insights in JSON format.
            Tournament Name: ${tournament.name}
            Total Events: ${totalEvents}
            Total Players: ${totalPlayers}
            Events: ${tournament.events.map(e => `${e.name} (${e._count.registrations} players)`).join(', ')}

            Return a JSON object with the following structure (do not include markdown formatting):
            {
                "summary": "A brief 2-sentence summary of the tournament status.",
                "keyStats": ["Stat 1", "Stat 2", "Stat 3"],
                "predictions": ["Prediction 1", "Prediction 2", "Prediction 3"]
            }
        `;

        try {
            const rawResponse = await this.callGemini(prompt);
            // Clean up potential markdown code blocks
            const jsonString = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiData = JSON.parse(jsonString);
            
            return {
                summary: aiData.summary || "Analysis unavailable.",
                keyStats: aiData.keyStats || [`${totalPlayers} Participants`, `${totalEvents} Events`],
                predictions: aiData.predictions || ["No predictions available."]
            };
        } catch (error) {
            console.error("Failed to parse AI insights:", error);
            // Fallback to basic stats if AI fails
            return {
                summary: `Tournament ${tournament.name} has ${totalPlayers} players across ${totalEvents} events.`,
                keyStats: [
                    `${totalPlayers} Total Participants`,
                    `${totalEvents} Events Scheduled`
                ],
                predictions: [
                    "Competition is expected to be intense."
                ]
            };
        }
    }
}
