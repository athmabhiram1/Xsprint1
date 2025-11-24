"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawMatchSchema = exports.registerAdminSchema = exports.loginSchema = exports.generateFixturesSchema = exports.generateScheduleSchema = exports.submitResultSchema = exports.generateMatchCodeSchema = exports.validateMatchCodeSchema = exports.eventConfigSchema = exports.createEventSchema = exports.createTournamentSchema = exports.createClubSchema = exports.registerPlayerSchema = exports.createPlayerSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation Schemas using Zod
 * Centralized validation for all API endpoints
 */
// Player Schemas
exports.createPlayerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: zod_1.z.string().email('Invalid email format').optional(),
    phone: zod_1.z.string().optional(),
    clubId: zod_1.z.string().cuid('Invalid club ID').optional(),
});
exports.registerPlayerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(100),
    clubId: zod_1.z.string().cuid().optional(),
    eventId: zod_1.z.string().cuid('Invalid event ID'),
});
// Club Schemas
exports.createClubSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Club name must be at least 2 characters').max(100),
    location: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email().optional(),
});
// Tournament Schemas
exports.createTournamentSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Tournament name must be at least 3 characters').max(200),
    location: zod_1.z.string().min(2).max(200),
    startDate: zod_1.z.string().datetime('Invalid start date format'),
    endDate: zod_1.z.string().datetime('Invalid end date format'),
    courts: zod_1.z.array(zod_1.z.string()).min(1, 'At least one court is required'),
});
// Event Schemas
exports.createEventSchema = zod_1.z.object({
    tournamentId: zod_1.z.string().cuid('Invalid tournament ID'),
    name: zod_1.z.string().min(3).max(200),
    sport: zod_1.z.string().min(2).max(50),
    type: zod_1.z.enum(['KNOCKOUT', 'ROUND_ROBIN']),
    category: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'MIXED']).optional(),
    format: zod_1.z.enum(['KNOCKOUT', 'ROUND_ROBIN']),
    maxPlayers: zod_1.z.number().int().positive().optional(),
});
// Event Config Schema
exports.eventConfigSchema = zod_1.z.object({
    eventId: zod_1.z.string().cuid(),
    restTimeMinutes: zod_1.z.number().int().min(0).max(120).default(30),
    matchDurationMinutes: zod_1.z.number().int().min(15).max(180).default(45),
    finalsDuration: zod_1.z.number().int().min(30).max(240).default(60),
    changeoverMinutes: zod_1.z.number().int().min(0).max(30).default(5),
    maxParallelMatches: zod_1.z.number().int().min(1).max(20).default(4),
});
// Match Code Schemas
exports.validateMatchCodeSchema = zod_1.z.object({
    matchId: zod_1.z.string().cuid('Invalid match ID'),
    matchCode: zod_1.z.string().length(8, 'Match code must be 8 characters'),
});
exports.generateMatchCodeSchema = zod_1.z.object({
    matchId: zod_1.z.string().cuid('Invalid match ID'),
    assignedUmpire: zod_1.z.string().email('Invalid umpire email'),
});
// Match Result Schemas
exports.submitResultSchema = zod_1.z.object({
    matchId: zod_1.z.string().cuid('Invalid match ID'),
    matchCode: zod_1.z.string().length(8, 'Match code must be 8 characters'),
    winnerId: zod_1.z.string().cuid('Invalid winner ID').optional(),
    score: zod_1.z.union([
        zod_1.z.string(),
        zod_1.z.array(zod_1.z.object({
            playerA: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
            playerB: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
        })),
    ]).optional(),
});
// Schedule Schemas
exports.generateScheduleSchema = zod_1.z.object({
    tournamentId: zod_1.z.string().cuid('Invalid tournament ID'),
    eventId: zod_1.z.string().cuid('Invalid event ID'),
    startTime: zod_1.z.string().datetime().optional(),
    matchDuration: zod_1.z.number().int().min(15).max(180).optional(),
});
// Fixture Schemas
exports.generateFixturesSchema = zod_1.z.object({
    eventId: zod_1.z.string().cuid('Invalid event ID'),
    seedingStrategy: zod_1.z.enum(['RANDOM', 'RANKED', 'MANUAL']).optional(),
});
// Auth Schemas
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.registerAdminSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    role: zod_1.z.enum(['ADMIN', 'ORGANIZER', 'UMPIRE', 'VIEWER']).default('ADMIN'),
});
// Withdrawal Schema
exports.withdrawMatchSchema = zod_1.z.object({
    matchId: zod_1.z.string().cuid('Invalid match ID'),
    reason: zod_1.z.string().min(5).max(500).optional(),
    withdrawingPlayerId: zod_1.z.string().cuid('Invalid player ID'),
});
