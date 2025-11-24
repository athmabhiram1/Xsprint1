"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GeminiController_1 = require("../controllers/GeminiController");
const router = (0, express_1.Router)();
// GET /api/ai/insights/:tournamentId
router.get('/insights/:tournamentId', GeminiController_1.getTournamentInsights);
// POST /api/ai/chat
router.post('/chat', GeminiController_1.chatWithAI);
// POST /api/ai/analyze-match
router.post('/analyze-match', GeminiController_1.analyzeMatch);
exports.default = router;
