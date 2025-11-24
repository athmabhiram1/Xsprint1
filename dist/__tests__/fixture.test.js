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
const FixtureEngineEnhanced_1 = require("../services/FixtureEngineEnhanced");
const nanoid_1 = require("nanoid");
(0, vitest_1.describe)('Fixture Engine', () => {
    let tournament;
    let event;
    let players;
    (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.prisma.scheduleBlock.deleteMany({});
        yield db_1.prisma.matchCodeUsage.deleteMany({});
        yield db_1.prisma.matchCode.deleteMany({});
        yield db_1.prisma.match.deleteMany({});
        yield db_1.prisma.registration.deleteMany({});
        yield db_1.prisma.event.deleteMany({});
        yield db_1.prisma.court.deleteMany({});
        yield db_1.prisma.tournament.deleteMany({});
        yield db_1.prisma.player.deleteMany({});
        yield db_1.prisma.club.deleteMany({});
        const testId = (0, nanoid_1.nanoid)(8);
        const club1 = yield db_1.prisma.club.create({ data: { name: `Club A ${testId}` } });
        const club2 = yield db_1.prisma.club.create({ data: { name: `Club B ${testId}` } });
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
                type: 'KNOCKOUT',
            },
        });
        players = yield Promise.all([
            db_1.prisma.player.create({ data: { name: `Player 1 ${testId}`, playerId: `P1-${testId}` } }),
            db_1.prisma.player.create({ data: { name: `Player 2 ${testId}`, playerId: `P2-${testId}`, clubId: club1.id } }),
            db_1.prisma.player.create({ data: { name: `Player 3 ${testId}`, playerId: `P3-${testId}`, clubId: club2.id } }),
            db_1.prisma.player.create({ data: { name: `Player 4 ${testId}`, playerId: `P4-${testId}`, clubId: club2.id } }),
        ]);
        for (let i = 0; i < players.length; i++) {
            yield db_1.prisma.registration.create({
                data: {
                    eventId: event.id,
                    playerId: players[i].id,
                    seed: i + 1,
                },
            });
        }
    }));
    (0, vitest_1.it)('should generate knockout fixtures with correct match count', () => __awaiter(void 0, void 0, void 0, function* () {
        const engine = new FixtureEngineEnhanced_1.FixtureEngine();
        const result = yield engine.generateFixtures(event.id, 'knockout');
        (0, vitest_1.expect)(result.format).toBe('knockout');
        (0, vitest_1.expect)(result.matches.length).toBeGreaterThan(0);
        const matches = yield db_1.prisma.match.findMany({ where: { eventId: event.id } });
        (0, vitest_1.expect)(matches.length).toBe(3);
        const round1Matches = matches.filter(m => m.round === 1);
        (0, vitest_1.expect)(round1Matches.length).toBe(2);
    }));
    (0, vitest_1.it)('should minimize same-club matchups in round 1', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const engine = new FixtureEngineEnhanced_1.FixtureEngine();
        yield engine.generateFixtures(event.id, 'knockout');
        const round1Matches = yield db_1.prisma.match.findMany({
            where: { eventId: event.id, round: 1 },
            include: {
                playerA: { include: { club: true } },
                playerB: { include: { club: true } }
            }
        });
        let sameClubCount = 0;
        for (const match of round1Matches) {
            if (((_a = match.playerA) === null || _a === void 0 ? void 0 : _a.clubId) && ((_b = match.playerB) === null || _b === void 0 ? void 0 : _b.clubId) &&
                match.playerA.clubId === match.playerB.clubId) {
                sameClubCount++;
            }
        }
        (0, vitest_1.expect)(sameClubCount).toBeLessThanOrEqual(1);
    }));
    (0, vitest_1.it)('should generate round robin fixtures', () => __awaiter(void 0, void 0, void 0, function* () {
        const engine = new FixtureEngineEnhanced_1.FixtureEngine();
        const result = yield engine.generateFixtures(event.id, 'roundrobin');
        (0, vitest_1.expect)(result.format).toBe('roundrobin');
        (0, vitest_1.expect)(result.matches.length).toBeGreaterThan(0);
        const matches = yield db_1.prisma.match.findMany({ where: { eventId: event.id } });
        (0, vitest_1.expect)(matches.length).toBeGreaterThan(0);
    }));
    (0, vitest_1.it)('should handle BYE allocation correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const testId = (0, nanoid_1.nanoid)(8);
        const player5 = yield db_1.prisma.player.create({ data: { name: `Player 5 ${testId}`, playerId: `P5-${testId}` } });
        yield db_1.prisma.registration.create({
            data: {
                eventId: event.id,
                playerId: player5.id,
                seed: 5,
            },
        });
        const engine = new FixtureEngineEnhanced_1.FixtureEngine();
        const result = yield engine.generateFixtures(event.id, 'knockout');
        (0, vitest_1.expect)(result.metrics).toBeDefined();
        const matches = yield db_1.prisma.match.findMany({
            where: { eventId: event.id, round: 1 }
        });
        const byeMatches = matches.filter(m => !m.playerAId || !m.playerBId);
        (0, vitest_1.expect)(byeMatches.length).toBeGreaterThan(0);
    }));
    (0, vitest_1.it)('should propagate winners correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const engine = new FixtureEngineEnhanced_1.FixtureEngine();
        yield engine.generateFixtures(event.id, 'knockout');
        const round1Matches = yield db_1.prisma.match.findMany({
            where: { eventId: event.id, round: 1 },
        });
        const firstMatch = round1Matches[0];
        if (firstMatch.playerAId) {
            yield engine.propagateWinner(firstMatch.id, firstMatch.playerAId);
            const nextMatch = yield db_1.prisma.match.findUnique({
                where: { id: firstMatch.nextMatchId },
            });
            (0, vitest_1.expect)(nextMatch === null || nextMatch === void 0 ? void 0 : nextMatch.playerAId).toBe(firstMatch.playerAId);
        }
    }));
});
