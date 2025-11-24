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
exports.analyzeMatch = exports.chatWithAI = exports.getTournamentInsights = void 0;
const GeminiService_1 = require("../services/GeminiService");
const geminiService = new GeminiService_1.GeminiService();
const getTournamentInsights = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tournamentId } = req.params;
    if (!tournamentId) {
        return res.status(400).json({ success: false, error: 'Tournament ID is required' });
    }
    try {
        const insights = yield geminiService.generateTournamentInsights(tournamentId);
        res.json({
            success: true,
            data: insights
        });
    }
    catch (error) {
        console.error('Error generating AI insights:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate insights',
            details: error.message
        });
    }
});
exports.getTournamentInsights = getTournamentInsights;
const chatWithAI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, context } = req.body;
    if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
    }
    try {
        const response = yield geminiService.chat(message, context);
        res.json({
            success: true,
            data: response
        });
    }
    catch (error) {
        console.error('Error in AI chat:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat request',
            details: error.message
        });
    }
});
exports.chatWithAI = chatWithAI;
const analyzeMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { matchId } = req.body;
    if (!matchId) {
        return res.status(400).json({ success: false, error: 'Match ID is required' });
    }
    try {
        const analysis = yield geminiService.analyzeMatch(matchId);
        res.json({
            success: true,
            data: analysis
        });
    }
    catch (error) {
        console.error('Error analyzing match:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze match',
            details: error.message
        });
    }
});
exports.analyzeMatch = analyzeMatch;
