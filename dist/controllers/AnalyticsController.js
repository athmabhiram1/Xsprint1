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
exports.getEventAnalytics = void 0;
const db_1 = require("../lib/db");
const ScheduleEngine_1 = require("../services/ScheduleEngine");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const responseFormatter_1 = require("../utils/responseFormatter");
const client_1 = require("@prisma/client");
const scheduleEngine = new ScheduleEngine_1.ScheduleEngine();
exports.getEventAnalytics = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json((0, responseFormatter_1.fail)('Event ID is required'));
    }
    const event = yield db_1.prisma.event.findUnique({
        where: { id },
        include: {
            tournament: {
                include: { courts: true }
            },
            matches: {
                include: {
                    schedule: { include: { court: true } },
                    playerA: { include: { club: true } },
                    playerB: { include: { club: true } }
                }
            }
        }
    });
    if (!event) {
        return res.status(404).json((0, responseFormatter_1.fail)('Event not found'));
    }
    try {
        const metrics = yield scheduleEngine.getSchedulingMetrics(id);
        const totalMatches = event.matches.length;
        const completedMatches = event.matches.filter(m => m.status === client_1.MatchStatus.COMPLETED).length;
        const inProgressMatches = event.matches.filter(m => m.status === client_1.MatchStatus.ONGOING).length;
        const scheduledMatches = event.matches.filter(m => m.status === client_1.MatchStatus.SCHEDULED).length;
        const pendingMatches = event.matches.filter(m => m.status === client_1.MatchStatus.PENDING).length;
        return res.json((0, responseFormatter_1.ok)({
            eventId: id,
            eventName: event.name,
            totalMatches,
            completedMatches,
            inProgressMatches,
            scheduledMatches,
            pendingMatches,
            courtUtilization: metrics.courtUtilization,
            restTimeViolations: metrics.restTimeViolations,
            sameClubMatchCount: metrics.sameClubMatchCount,
            restTimeViolationCount: metrics.restTimeViolations.length
        }));
    }
    catch (error) {
        return res.status(500).json((0, responseFormatter_1.fail)('Failed to fetch analytics'));
    }
}));
