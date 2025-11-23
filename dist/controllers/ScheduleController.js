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
exports.withdrawMatch = exports.rescheduleMatch = exports.generateSchedule = void 0;
const db_1 = require("../lib/db");
const ScheduleEngine_1 = require("../services/ScheduleEngine");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const responseFormatter_1 = require("../utils/responseFormatter");
const validation_1 = require("../utils/validation");
const zod_1 = require("zod");
const cache_1 = require("../utils/cache");
const logger_1 = require("../utils/logger");
const scheduleEngine = new ScheduleEngine_1.ScheduleEngine();
const eventIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid event ID format'),
});
exports.generateSchedule = [
    (0, validation_1.validateParams)(eventIdParamSchema),
    (0, validation_1.validateBody)(validation_1.scheduleGenerationSchema),
    (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { startTime, matchDuration, restTime, changeover } = req.body;
        const event = yield db_1.prisma.event.findUnique({
            where: { id },
            include: {
                tournament: {
                    include: { courts: true }
                }
            }
        });
        if (!event) {
            return res.status(404).json((0, responseFormatter_1.fail)('Event not found'));
        }
        if (!event.tournament.courts || event.tournament.courts.length === 0) {
            return res.status(400).json((0, responseFormatter_1.fail)('No courts available for this tournament'));
        }
        const matchCount = yield db_1.prisma.match.count({ where: { eventId: id } });
        if (matchCount === 0) {
            return res.status(400).json((0, responseFormatter_1.fail)('No matches found. Generate fixtures first'));
        }
        try {
            const result = yield scheduleEngine.generateSchedule(id, {
                startTime: startTime ? new Date(startTime) : undefined,
                matchDuration,
                restTime,
                changeover
            });
            (0, cache_1.invalidateCache)(`event:${id}:*`);
            (0, cache_1.invalidateCache)(`schedule:*`);
            (0, logger_1.logInfo)('Schedule generated', { eventId: id, scheduled: result.scheduled });
            return res.json((0, responseFormatter_1.ok)(result));
        }
        catch (error) {
            (0, logger_1.logError)(error, { eventId: id });
            if (error.message.includes('not found')) {
                return res.status(404).json((0, responseFormatter_1.fail)(error.message));
            }
            throw error;
        }
    }))
];
exports.rescheduleMatch = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { startTime, courtId } = req.body;
    if (!id || !startTime || !courtId) {
        return res.status(400).json((0, responseFormatter_1.fail)('Match ID, startTime, and courtId are required'));
    }
    const result = yield scheduleEngine.rescheduleMatch(id, new Date(startTime), courtId);
    return res.json((0, responseFormatter_1.ok)(result));
}));
exports.withdrawMatch = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { playerId } = req.body;
    if (!id || !playerId) {
        return res.status(400).json((0, responseFormatter_1.fail)('Match ID and playerId are required'));
    }
    const result = yield scheduleEngine.handleWithdrawal(id, playerId);
    return res.json((0, responseFormatter_1.ok)(result));
}));
