"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || "";
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
    }
    callGemini(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (!this.apiKey) {
                return "AI capabilities are currently unavailable (Missing API Key).";
            }
            try {
                const response = yield fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                if (!response.ok) {
                    throw new Error(`Gemini API Error: ${response.statusText}`);
                }
                const data = yield response.json();
                return ((_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || "No response from AI.";
            }
            catch (error) {
                console.error("Gemini API Call Failed:", error);
                return "Failed to connect to AI service.";
            }
        });
    }
    chat(message, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
            Context: ${context || "You are an assistant for a sports tournament management system."}
            User: ${message}
            Assistant:
        `;
            return this.callGemini(prompt);
        });
    }
    analyzeMatch(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const match = yield prisma.match.findUnique({
                where: { id: matchId },
                include: {
                    playerA: true,
                    playerB: true,
                    event: true
                }
            });
            if (!match)
                throw new Error("Match not found");
            const prompt = `
            Act as an excited sports commentator. 
            Analyze the upcoming match between ${((_a = match.playerA) === null || _a === void 0 ? void 0 : _a.name) || 'Player A'} and ${((_b = match.playerB) === null || _b === void 0 ? void 0 : _b.name) || 'Player B'} 
            in the ${((_c = match.event) === null || _c === void 0 ? void 0 : _c.name) || 'Tournament'} event.
            Write a short, 2-sentence hype prediction.
        `;
            return this.callGemini(prompt);
        });
    }
    /**
     * Generates AI insights for a specific tournament.
     */
    generateTournamentInsights(tournamentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Fetch Tournament Data
            const tournament = yield prisma.tournament.findUnique({
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
                const rawResponse = yield this.callGemini(prompt);
                // Clean up potential markdown code blocks
                const jsonString = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiData = JSON.parse(jsonString);
                return {
                    summary: aiData.summary || "Analysis unavailable.",
                    keyStats: aiData.keyStats || [`${totalPlayers} Participants`, `${totalEvents} Events`],
                    predictions: aiData.predictions || ["No predictions available."]
                };
            }
            catch (error) {
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
        });
    }
}
exports.GeminiService = GeminiService;
