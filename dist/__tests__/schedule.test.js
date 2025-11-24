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
const vitest_1 = require("vitest");
const db_1 = require("../lib/db");
const ScheduleEngine_1 = require("../services/ScheduleEngine");
const client_1 = require("@prisma/client");
const nanoid_1 = require("nanoid");
(0, vitest_1.describe)('Schedule Engine', () => {
    let tournament;
    let event;
    let courts;
    (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.prisma.scheduleBlock.deleteMany({});
        yield db_1.prisma.matchCodeUsage.deleteMany({});
        yield db_1.prisma.matchCode.deleteMany({});
        yield db_1.prisma.match.deleteMany({});
        yield db_1.prisma.registration.deleteMany({});
        yield db_1.prisma.event.deleteMany({});
        yield db_1.prisma.court.deleteMany({});
        yield db_1.prisma.tournament.deleteMany({});
        const testId = (0, nanoid_1.nanoid)(8);
        tournament = yield db_1.prisma.tournament.create({
            data: {
                name: `Test Tournament ${testId}`,
                startDate: new Date(),
                endDate: new Date(),
            },
        });
        courts = yield Promise.all([
            db_1.prisma.court.create({
                data: { name: `Court 1 ${testId}`, tournamentId: tournament.id },
            }),
            db_1.prisma.court.create({
                data: { name: `Court 2 ${testId}`, tournamentId: tournament.id },
            }),
        ]);
        event = yield db_1.prisma.event.create({
            data: {
                name: `Test Event ${testId}`,
                tournamentId: tournament.id,
                type: 'KNOCKOUT',
            },
        });
    }));
    (0, vitest_1.it)('should generate schedule without overlaps', () => __awaiter(void 0, void 0, void 0, function* () {
        const testId = (0, nanoid_1.nanoid)(8);
        const player1 = yield db_1.prisma.player.create({ data: { name: `P1 ${testId}`, playerId: `P1-${testId}` } });
        const player2 = yield db_1.prisma.player.create({ data: { name: `P2 ${testId}`, playerId: `P2-${testId}` } });
        const player3 = yield db_1.prisma.player.create({ data: { name: `P3 ${testId}`, playerId: `P3-${testId}` } });
        const match1 = yield db_1.prisma.match.create({
            data: {
                eventId: event.id,
                round: 1,
                matchNumber: 1,
                playerAId: player1.id,
                playerBId: player2.id,
                status: client_1.MatchStatus.PENDING,
            },
        });
        const match2 = yield db_1.prisma.match.create({
            data: {
                eventId: event.id,
                round: 2,
                matchNumber: 1,
                playerAId: player1.id,
                playerBId: player3.id,
                status: client_1.MatchStatus.PENDING,
            },
        });
        const engine = new ScheduleEngine_1.ScheduleEngine();
        yield engine.generateSchedule(event.id, {
            startTime: new Date(),
            matchDuration: 45,
            restTime: 20,
        });
        const schedule1 = yield db_1.prisma.scheduleBlock.findUnique({
            where: { matchId: match1.id },
        });
        const schedule2 = yield db_1.prisma.scheduleBlock.findUnique({
            where: { matchId: match2.id },
        });
        if (schedule1 && schedule2) {
            const timeDiff = schedule2.startTime.getTime() - schedule1.endTime.getTime();
            (0, vitest_1.expect)(timeDiff).toBeGreaterThanOrEqual(20 * 60 * 1000);
        }
    }));
    (0, vitest_1.it)('should enforce rest time between matches', () => __awaiter(void 0, void 0, void 0, function* () {
        const testId = (0, nanoid_1.nanoid)(8);
        const player1 = yield db_1.prisma.player.create({ data: { name: `P1 ${testId}`, playerId: `P1-${testId}` } });
        const player2 = yield db_1.prisma.player.create({ data: { name: `P2 ${testId}`, playerId: `P2-${testId}` } });
        const player3 = yield db_1.prisma.player.create({ data: { name: `P3 ${testId}`, playerId: `P3-${testId}` } });
        const match1 = yield db_1.prisma.match.create({
            data: {
                eventId: event.id,
                round: 1,
                matchNumber: 1,
                playerAId: player1.id,
                playerBId: player2.id,
                status: client_1.MatchStatus.PENDING,
            },
        });
        const match2 = yield db_1.prisma.match.create({
            data: {
                eventId: event.id,
                round: 2,
                matchNumber: 1,
                playerAId: player1.id,
                playerBId: player3.id,
                status: client_1.MatchStatus.PENDING,
            },
        });
        const engine = new ScheduleEngine_1.ScheduleEngine();
        yield engine.generateSchedule(event.id, {
            startTime: new Date(),
            matchDuration: 45,
            restTime: 20,
        });
        const schedule1 = yield db_1.prisma.scheduleBlock.findUnique({
            where: { matchId: match1.id },
        });
        const schedule2 = yield db_1.prisma.scheduleBlock.findUnique({
            where: { matchId: match2.id },
        });
        if (schedule1 && schedule2) {
            const restTime = (schedule2.startTime.getTime() - schedule1.endTime.getTime()) / 60000;
            (0, vitest_1.expect)(restTime).toBeGreaterThanOrEqual(20);
        }
    }));
    (0, vitest_1.it)('should allocate matches across multiple courts', () => __awaiter(void 0, void 0, void 0, function* () {
        const testId = (0, nanoid_1.nanoid)(8);
        const players = yield Promise.all([
            db_1.prisma.player.create({ data: { name: `P1 ${testId}`, playerId: `P1-${testId}` } }),
            db_1.prisma.player.create({ data: { name: `P2 ${testId}`, playerId: `P2-${testId}` } }),
            db_1.prisma.player.create({ data: { name: `P3 ${testId}`, playerId: `P3-${testId}` } }),
            db_1.prisma.player.create({ data: { name: `P4 ${testId}`, playerId: `P4-${testId}` } }),
        ]);
        yield Promise.all([
            db_1.prisma.match.create({
                data: {
                    eventId: event.id,
                    round: 1,
                    matchNumber: 1,
                    playerAId: players[0].id,
                    playerBId: players[1].id,
                    status: client_1.MatchStatus.PENDING,
                },
            }),
            db_1.prisma.match.create({
                data: {
                    eventId: event.id,
                    round: 1,
                    matchNumber: 2,
                    playerAId: players[2].id,
                    playerBId: players[3].id,
                    status: client_1.MatchStatus.PENDING,
                },
            }),
        ]);
        const engine = new ScheduleEngine_1.ScheduleEngine();
        yield engine.generateSchedule(event.id, {
            startTime: new Date(),
            matchDuration: 45,
            restTime: 20,
        });
        const schedules = yield db_1.prisma.scheduleBlock.findMany({
            where: { match: { eventId: event.id } },
            include: { court: true }
        });
        const courtIds = new Set(schedules.map(s => s.courtId));
        (0, vitest_1.expect)(courtIds.size).toBeGreaterThan(0);
    }));
});
