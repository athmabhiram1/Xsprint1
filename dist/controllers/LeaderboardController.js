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
exports.getEventAnalytics = exports.getEventStandings = exports.getDetailedLeaderboard = exports.getBasicLeaderboard = void 0;
const LeaderboardService_1 = require("../services/LeaderboardService");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const responseFormatter_1 = require("../utils/responseFormatter");
const leaderboardService = new LeaderboardService_1.LeaderboardService();
exports.getBasicLeaderboard = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json((0, responseFormatter_1.fail)('Event ID is required'));
    }
    try {
        const leaderboard = yield leaderboardService.getEventLeaderboard(id);
        return res.json((0, responseFormatter_1.ok)(leaderboard));
    }
    catch (error) {
        if (error.message === 'Event not found') {
            return res.status(404).json((0, responseFormatter_1.fail)('Event not found'));
        }
        return res.status(500).json((0, responseFormatter_1.fail)('Failed to fetch leaderboard'));
    }
}));
exports.getDetailedLeaderboard = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json((0, responseFormatter_1.fail)('Event ID is required'));
    }
    try {
        const leaderboard = yield leaderboardService.getEventLeaderboard(id);
        return res.json((0, responseFormatter_1.ok)(leaderboard));
    }
    catch (error) {
        if (error.message === 'Event not found') {
            return res.status(404).json((0, responseFormatter_1.fail)('Event not found'));
        }
        return res.status(500).json((0, responseFormatter_1.fail)('Failed to fetch detailed leaderboard'));
    }
}));
// Export analytics function
exports.getEventStandings = exports.getBasicLeaderboard;
exports.getEventAnalytics = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json((0, responseFormatter_1.fail)('Event ID is required'));
    }
    try {
        const analytics = yield leaderboardService.getEventAnalytics(id);
        return res.json((0, responseFormatter_1.ok)(analytics));
    }
    catch (error) {
        if (error.message === 'Event not found') {
            return res.status(404).json((0, responseFormatter_1.fail)('Event not found'));
        }
        return res.status(500).json((0, responseFormatter_1.fail)('Failed to fetch analytics'));
    }
}));
