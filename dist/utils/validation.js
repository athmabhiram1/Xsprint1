"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchResultSchema = exports.scheduleGenerationSchema = exports.fixtureGenerationSchema = exports.registrationSchema = exports.eventSchema = void 0;
exports.validateBody = validateBody;
exports.validateParams = validateParams;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
const responseFormatter_1 = require("./responseFormatter");
exports.eventSchema = zod_1.z.object({
    tournamentId: zod_1.z.string().uuid('Invalid tournament ID format'),
    name: zod_1.z.string().min(1, 'Event name is required').max(200, 'Event name too long'),
    sport: zod_1.z.enum(['BADMINTON', 'TENNIS', 'TABLE_TENNIS', 'PICKLEBALL', 'SQUASH']).optional(),
    type: zod_1.z.enum(['KNOCKOUT', 'ROUND_ROBIN']).optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'MIXED']).optional(),
    category: zod_1.z.string().max(50).optional(),
});
exports.registrationSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid('Invalid event ID format'),
    playerId: zod_1.z.string().uuid('Invalid player ID format'),
    seed: zod_1.z.number().int().positive().optional().nullable(),
});
exports.fixtureGenerationSchema = zod_1.z.object({
    type: zod_1.z.enum(['knockout', 'roundrobin']).optional(),
    format: zod_1.z.enum(['knockout', 'roundrobin']).optional(),
});
exports.scheduleGenerationSchema = zod_1.z.object({
    startTime: zod_1.z.string().datetime().optional(),
    matchDuration: zod_1.z.number().int().min(15).max(180).optional(),
    restTime: zod_1.z.number().int().min(5).max(120).optional(),
    changeover: zod_1.z.number().int().min(0).max(30).optional(),
});
exports.matchResultSchema = zod_1.z.object({
    matchId: zod_1.z.string().uuid('Invalid match ID format'),
    code: zod_1.z.string().length(6, 'Match code must be 6 digits'),
    winnerId: zod_1.z.string().uuid('Invalid winner ID format'),
    score: zod_1.z.object({
        sets: zod_1.z.array(zod_1.z.object({
            a: zod_1.z.number().int().min(0),
            b: zod_1.z.number().int().min(0),
        })).optional(),
        note: zod_1.z.string().optional(),
    }).optional(),
});
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json((0, responseFormatter_1.fail)(error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')));
            }
            return res.status(400).json((0, responseFormatter_1.fail)('Invalid request body'));
        }
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json((0, responseFormatter_1.fail)(error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')));
            }
            return res.status(400).json((0, responseFormatter_1.fail)('Invalid request parameters'));
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json((0, responseFormatter_1.fail)(error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')));
            }
            return res.status(400).json((0, responseFormatter_1.fail)('Invalid query parameters'));
        }
    };
}
