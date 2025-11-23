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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_1 = require("../lib/db");
const MatchCodeService_1 = require("../services/MatchCodeService");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nanoid_1 = require("nanoid");
(0, vitest_1.describe)('Match Code Service', () => {
    let tournament;
    let event;
    let match;
    let umpire;
    (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.prisma.matchCodeUsage.deleteMany({});
        yield db_1.prisma.matchCode.deleteMany({});
        yield db_1.prisma.scheduleBlock.deleteMany({});
        yield db_1.prisma.match.deleteMany({});
        yield db_1.prisma.registration.deleteMany({});
        yield db_1.prisma.event.deleteMany({});
        yield db_1.prisma.court.deleteMany({});
        yield db_1.prisma.tournament.deleteMany({});
        yield db_1.prisma.user.deleteMany({});
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
                type: 'KNOCKOUT',
            },
        });
        const player1 = yield db_1.prisma.player.create({ data: { name: `P1 ${testId}`, playerId: `P1-${testId}` } });
        const player2 = yield db_1.prisma.player.create({ data: { name: `P2 ${testId}`, playerId: `P2-${testId}` } });
        match = yield db_1.prisma.match.create({
            data: {
                eventId: event.id,
                round: 1,
                matchNumber: 1,
                playerAId: player1.id,
                playerBId: player2.id,
                status: client_1.MatchStatus.PENDING,
            },
        });
        umpire = yield db_1.prisma.user.create({
            data: {
                name: `Umpire ${testId}`,
                email: `umpire-${testId}@test.com`,
                passwordHash: yield bcryptjs_1.default.hash('password', 10),
                role: client_1.Role.UMPIRE,
            },
        });
    }));
    (0, vitest_1.it)('should generate 6-digit match code', () => __awaiter(void 0, void 0, void 0, function* () {
        const service = new MatchCodeService_1.MatchCodeService();
        const code = yield service.generateCodeForMatch(match.id, umpire.id);
        (0, vitest_1.expect)(code).toBeDefined();
        (0, vitest_1.expect)(code.length).toBe(6);
        (0, vitest_1.expect)(Number(code)).toBeGreaterThan(0);
        const matchCode = yield db_1.prisma.matchCode.findUnique({
            where: { matchId: match.id },
        });
        (0, vitest_1.expect)(matchCode).toBeDefined();
        (0, vitest_1.expect)(matchCode === null || matchCode === void 0 ? void 0 : matchCode.assignedUmpireId).toBe(umpire.id);
    }));
    (0, vitest_1.it)('should verify correct code', () => __awaiter(void 0, void 0, void 0, function* () {
        const service = new MatchCodeService_1.MatchCodeService();
        const code = yield service.generateCodeForMatch(match.id, umpire.id);
        const isValid = yield service.verifyCode(match.id, code, umpire.id);
        (0, vitest_1.expect)(isValid).toBe(true);
    }));
    (0, vitest_1.it)('should reject incorrect code', () => __awaiter(void 0, void 0, void 0, function* () {
        const service = new MatchCodeService_1.MatchCodeService();
        yield service.generateCodeForMatch(match.id, umpire.id);
        const isValid = yield service.verifyCode(match.id, '000000', umpire.id);
        (0, vitest_1.expect)(isValid).toBe(false);
    }));
    (0, vitest_1.it)('should reject code after match completion', () => __awaiter(void 0, void 0, void 0, function* () {
        const service = new MatchCodeService_1.MatchCodeService();
        const code = yield service.generateCodeForMatch(match.id, umpire.id);
        yield db_1.prisma.match.update({
            where: { id: match.id },
            data: { status: client_1.MatchStatus.COMPLETED },
        });
        yield (0, vitest_1.expect)(service.verifyCode(match.id, code, umpire.id)).rejects.toThrow();
    }));
    (0, vitest_1.it)('should only allow assigned umpire to verify', () => __awaiter(void 0, void 0, void 0, function* () {
        const testId = (0, nanoid_1.nanoid)(8);
        const otherUmpire = yield db_1.prisma.user.create({
            data: {
                name: `Other Umpire ${testId}`,
                email: `other-${testId}@test.com`,
                passwordHash: yield bcryptjs_1.default.hash('password', 10),
                role: client_1.Role.UMPIRE,
            },
        });
        const service = new MatchCodeService_1.MatchCodeService();
        const code = yield service.generateCodeForMatch(match.id, umpire.id);
        const isValid = yield service.verifyCode(match.id, code, otherUmpire.id);
        (0, vitest_1.expect)(isValid).toBe(false);
    }));
});
