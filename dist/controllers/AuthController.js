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
exports.logout = exports.me = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../lib/db");
const auth_1 = require("../config/auth");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const responseFormatter_1 = require("../utils/responseFormatter");
const client_1 = require("@prisma/client");
const signToken = (user) => jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, email: user.email, name: user.name }, auth_1.authConfig.jwtSecret, { expiresIn: auth_1.authConfig.jwtExpiresIn });
exports.register = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
        return res.status(400).json((0, responseFormatter_1.fail)('Missing required fields: name, email, password'));
    }
    if (password.length < 6) {
        return res.status(400).json((0, responseFormatter_1.fail)('Password must be at least 6 characters'));
    }
    const existing = yield db_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(400).json((0, responseFormatter_1.fail)('Email already in use'));
    }
    const passwordHash = yield bcryptjs_1.default.hash(password, auth_1.authConfig.bcryptSaltRounds);
    const user = yield db_1.prisma.user.create({
        data: { name, email, passwordHash, role: client_1.Role.VIEWER },
        select: { id: true, name: true, email: true, role: true }
    });
    const token = signToken(user);
    res.cookie(auth_1.authConfig.cookieName, token, auth_1.authConfig.cookieOptions);
    return res.status(201).json((0, responseFormatter_1.ok)(user));
}));
exports.login = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json((0, responseFormatter_1.fail)('Missing required fields: email, password'));
    }
    const userRecord = yield db_1.prisma.user.findUnique({ where: { email } });
    if (!userRecord) {
        return res.status(401).json((0, responseFormatter_1.fail)('Invalid credentials'));
    }
    const valid = yield bcryptjs_1.default.compare(password, userRecord.passwordHash);
    if (!valid) {
        return res.status(401).json((0, responseFormatter_1.fail)('Invalid credentials'));
    }
    const user = {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role
    };
    const token = signToken(user);
    res.cookie(auth_1.authConfig.cookieName, token, auth_1.authConfig.cookieOptions);
    return res.json((0, responseFormatter_1.ok)(user));
}));
exports.me = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json((0, responseFormatter_1.fail)('Authentication required'));
    }
    const user = yield db_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true }
    });
    if (!user) {
        return res.status(404).json((0, responseFormatter_1.fail)('User not found'));
    }
    return res.json((0, responseFormatter_1.ok)(user));
}));
exports.logout = (0, asyncHandler_1.asyncHandler)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie(auth_1.authConfig.cookieName, {
        httpOnly: true,
        secure: auth_1.authConfig.cookieOptions.secure,
        sameSite: auth_1.authConfig.cookieOptions.sameSite,
    });
    return res.json((0, responseFormatter_1.ok)(true));
}));
