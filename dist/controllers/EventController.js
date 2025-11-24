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
exports.getEventRegistrations = exports.registerPlayerToEvent = exports.getEventsByTournament = exports.getAllEvents = exports.createEvent = void 0;
const db_1 = require("../lib/db");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const responseFormatter_1 = require("../utils/responseFormatter");
const validation_1 = require("../utils/validation");
const zod_1 = require("zod");
const cache_1 = require("../utils/cache");
const logger_1 = require("../utils/logger");
const eventIdSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid('Invalid event ID format'),
});
const tournamentIdSchema = zod_1.z.object({
    tournamentId: zod_1.z.string().uuid('Invalid tournament ID format'),
});
exports.createEvent = [
    (0, validation_1.validateBody)(validation_1.eventSchema),
    (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { tournamentId, name, sport, type, gender, category } = req.body;
        const tournament = yield db_1.prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { id: true }
        });
        if (!tournament) {
            return res.status(404).json((0, responseFormatter_1.fail)('Tournament not found'));
        }
        try {
            const event = yield db_1.prisma.event.create({
                data: {
                    tournamentId,
                    name: name.trim(),
                    sport: (sport === null || sport === void 0 ? void 0 : sport.toUpperCase()) || 'BADMINTON',
                    type: (type === null || type === void 0 ? void 0 : type.toUpperCase()) || 'KNOCKOUT',
                    gender: gender === null || gender === void 0 ? void 0 : gender.toUpperCase(),
                    category: category === null || category === void 0 ? void 0 : category.toUpperCase()
                },
                include: {
                    tournament: {
                        select: {
                            name: true,
                            startDate: true,
                            endDate: true
                        }
                    }
                }
            });
            (0, cache_1.invalidateCache)(`tournament:${tournamentId}:*`);
            (0, logger_1.logInfo)('Event created', { eventId: event.id, tournamentId, name });
            return res.status(201).json((0, responseFormatter_1.ok)(event));
        }
        catch (error) {
            (0, logger_1.logError)(error, { tournamentId, name });
            throw error;
        }
    }))
];
exports.getAllEvents = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = (0, cache_1.getCacheKey)('events', 'all');
    const events = yield (0, cache_1.getCached)(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
        return db_1.prisma.event.findMany({
            include: {
                _count: {
                    select: {
                        registrations: true,
                        matches: true
                    }
                },
                tournament: {
                    select: {
                        name: true,
                        startDate: true,
                        endDate: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }), 60);
    return res.json((0, responseFormatter_1.ok)(events));
}));
exports.getEventsByTournament = [
    (0, validation_1.validateParams)(tournamentIdSchema),
    (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { tournamentId } = req.params;
        const tournament = yield db_1.prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { id: true }
        });
        if (!tournament) {
            return res.status(404).json((0, responseFormatter_1.fail)('Tournament not found'));
        }
        const cacheKey = (0, cache_1.getCacheKey)('events', 'tournament', tournamentId);
        const events = yield (0, cache_1.getCached)(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
            return db_1.prisma.event.findMany({
                where: { tournamentId },
                include: {
                    _count: {
                        select: {
                            registrations: true,
                            matches: true
                        }
                    },
                    tournament: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            });
        }), 120);
        return res.json((0, responseFormatter_1.ok)(events));
    }))
];
exports.registerPlayerToEvent = [
    (0, validation_1.validateBody)(validation_1.registrationSchema),
    (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { eventId, playerId, seed } = req.body;
        const [event, player] = yield Promise.all([
            db_1.prisma.event.findUnique({
                where: { id: eventId },
                select: { id: true, type: true }
            }),
            db_1.prisma.player.findUnique({
                where: { id: playerId },
                select: { id: true }
            })
        ]);
        if (!event) {
            return res.status(404).json((0, responseFormatter_1.fail)('Event not found'));
        }
        if (!player) {
            return res.status(404).json((0, responseFormatter_1.fail)('Player not found'));
        }
        const existingRegistration = yield db_1.prisma.registration.findUnique({
            where: {
                eventId_playerId: { eventId, playerId }
            }
        });
        if (existingRegistration) {
            return res.status(409).json((0, responseFormatter_1.fail)('Player is already registered for this event'));
        }
        const matchExists = yield db_1.prisma.match.findFirst({
            where: {
                eventId,
                status: { in: ['SCHEDULED', 'ONGOING', 'COMPLETED'] }
            },
            select: { id: true }
        });
        if (matchExists) {
            return res.status(400).json((0, responseFormatter_1.fail)('Cannot register player: matches have already been scheduled'));
        }
        try {
            const registration = yield db_1.prisma.registration.create({
                data: {
                    eventId,
                    playerId,
                    seed: seed || null
                },
                include: {
                    player: {
                        include: {
                            club: true
                        }
                    },
                    event: {
                        select: {
                            name: true,
                            sport: true,
                            type: true
                        }
                    }
                }
            });
            (0, cache_1.invalidateCache)(`event:${eventId}:*`);
            (0, cache_1.invalidateCache)(`events:*`);
            (0, logger_1.logInfo)('Player registered to event', { eventId, playerId, seed });
            return res.status(201).json((0, responseFormatter_1.ok)(registration));
        }
        catch (error) {
            (0, logger_1.logError)(error, { eventId, playerId });
            throw error;
        }
    }))
];
exports.getEventRegistrations = [
    (0, validation_1.validateParams)(eventIdSchema),
    (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { eventId } = req.params;
        const event = yield db_1.prisma.event.findUnique({
            where: { id: eventId },
            select: { id: true }
        });
        if (!event) {
            return res.status(404).json((0, responseFormatter_1.fail)('Event not found'));
        }
        const cacheKey = (0, cache_1.getCacheKey)('registrations', 'event', eventId);
        const registrations = yield (0, cache_1.getCached)(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
            return db_1.prisma.registration.findMany({
                where: { eventId },
                include: {
                    player: {
                        include: {
                            club: true
                        }
                    },
                    event: {
                        select: {
                            name: true,
                            sport: true
                        }
                    }
                },
                orderBy: [
                    { seed: 'asc' },
                    { player: { name: 'asc' } }
                ]
            });
        }), 60);
        return res.json((0, responseFormatter_1.ok)(registrations));
    }))
];
