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
const LeaderboardService_1 = require("../services/LeaderboardService");
const client_1 = require("@prisma/client");
const nanoid_1 = require("nanoid");
(0, vitest_1.describe)('Leaderboard Service', () => {
    let tournament;
    let event;
    let players;
    let leaderboardService;
    (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        leaderboardService = new LeaderboardService_1.LeaderboardService();
        yield db_1.prisma.scheduleBlock.deleteMany({});
        yield db_1.prisma.matchCodeUsage.deleteMany({});
        yield db_1.prisma.matchCode.deleteMany({});
        yield db_1.prisma.match.deleteMany({});
        yield db_1.prisma.registration.deleteMany({});
        yield db_1.prisma.event.deleteMany({});
        yield db_1.prisma.court.deleteMany({});
        yield db_1.prisma.tournament.deleteMany({});
        yield db_1.prisma.player.deleteMany({});
        const testId = (0, nanoid_1.nanoid)(8);
        tournament = yield db_1.prisma.tournament.create({
            data: {
                name: `Test Tournament ${testId}`,
                startDate: new Date(),
                endDate: new Date(),
            },
        });
        event = yield db_1.prisma.event.create({
            data: {
                name: `Test Event ${testId}`,
                tournamentId: tournament.id,
                type: 'ROUND_ROBIN',
            },
        });
        players = yield Promise.all([
            db_1.prisma.player.create({ data: { name: `Player 1 ${testId}`, playerId: `P1-${testId}` } }),
            db_1.prisma.player.create({ data: { name: `Player 2 ${testId}`, playerId: `P2-${testId}` } }),
        ]);
        for (const player of players) {
            yield db_1.prisma.registration.create({
                data: {
                    eventId: event.id,
                    playerId: player.id,
                },
            });
        }
    }));
    (0, vitest_1.it)('should generate event leaderboard for round robin', () => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.prisma.match.create({
            data: {
                eventId: event.id,
                round: 1,
                matchNumber: 1,
                playerAId: players[0].id,
                playerBId: players[1].id,
                winnerId: players[0].id,
                status: client_1.MatchStatus.COMPLETED,
                score: { sets: [{ a: 21, b: 19 }] },
            },
        });
        const leaderboard = yield leaderboardService.getEventLeaderboard(event.id);
        (0, vitest_1.expect)(leaderboard.format).toBe('ROUND_ROBIN');
        (0, vitest_1.expect)(leaderboard.roundRobin).toBeDefined();
        if (leaderboard.roundRobin) {
            (0, vitest_1.expect)(leaderboard.roundRobin.length).toBe(2);
            (0, vitest_1.expect)(leaderboard.roundRobin[0].wins).toBe(1);
        }
    }));
    (0, vitest_1.it)('should generate event analytics', () => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.prisma.match.create({
            data: {
                eventId: event.id,
                round: 1,
                matchNumber: 1,
                playerAId: players[0].id,
                playerBId: players[1].id,
                winnerId: players[0].id,
                status: client_1.MatchStatus.COMPLETED,
                score: { sets: [{ a: 21, b: 19 }, { a: 21, b: 15 }] },
            },
        });
        const analytics = yield leaderboardService.getEventAnalytics(event.id);
        (0, vitest_1.expect)(analytics).toBeDefined();
        (0, vitest_1.expect)(analytics.totalMatches).toBe(1);
        (0, vitest_1.expect)(analytics.completedMatches).toBe(1);
    }));
});
