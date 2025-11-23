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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const nanoid_1 = require("nanoid");
(0, vitest_1.describe)('Auth System', () => {
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
    }));
    (0, vitest_1.it)('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const testId = (0, nanoid_1.nanoid)(8);
        const userData = {
            name: `Test User ${testId}`,
            email: `test-${testId}@example.com`,
            password: 'password123',
        };
        const user = yield db_1.prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                passwordHash: yield bcryptjs_1.default.hash(userData.password, 10),
                role: client_1.Role.VIEWER,
            },
            select: { id: true, name: true, email: true, role: true },
        });
        (0, vitest_1.expect)(user).toBeDefined();
        (0, vitest_1.expect)(user.email).toBe(userData.email);
        (0, vitest_1.expect)(user.role).toBe(client_1.Role.VIEWER);
    }));
    (0, vitest_1.it)('should hash passwords correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const password = 'password123';
        const hash = yield bcryptjs_1.default.hash(password, 10);
        (0, vitest_1.expect)(hash).not.toBe(password);
        (0, vitest_1.expect)(yield bcryptjs_1.default.compare(password, hash)).toBe(true);
        (0, vitest_1.expect)(yield bcryptjs_1.default.compare('wrongpassword', hash)).toBe(false);
    }));
    (0, vitest_1.it)('should prevent duplicate email registration', () => __awaiter(void 0, void 0, void 0, function* () {
        const testId = (0, nanoid_1.nanoid)(8);
        const email = `duplicate-${testId}@example.com`;
        yield db_1.prisma.user.create({
            data: {
                name: `User 1 ${testId}`,
                email,
                passwordHash: yield bcryptjs_1.default.hash('password', 10),
                role: client_1.Role.VIEWER,
            },
        });
        yield (0, vitest_1.expect)(db_1.prisma.user.create({
            data: {
                name: `User 2 ${testId}`,
                email,
                passwordHash: yield bcryptjs_1.default.hash('password', 10),
                role: client_1.Role.VIEWER,
            },
        })).rejects.toThrow();
    }));
});
