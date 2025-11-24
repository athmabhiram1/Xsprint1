"use strict";
/**
 * User Management Utilities
 *
 * Helper functions for creating and managing users programmatically.
 * Useful for seeding, testing, and admin operations.
 */
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
exports.createUser = createUser;
exports.createUsers = createUsers;
exports.verifyPassword = verifyPassword;
exports.updatePassword = updatePassword;
exports.updateUserRole = updateUserRole;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;
exports.getUsersByRole = getUsersByRole;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../config/auth");
const client_1 = require("@prisma/client");
/**
 * Create a new user with hashed password
 */
function createUser(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, email, password, role = client_1.Role.VIEWER } = input;
        // Check if user already exists
        const existingUser = yield db_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new Error(`User with email ${email} already exists`);
        }
        // Hash password
        const passwordHash = yield bcryptjs_1.default.hash(password, auth_1.authConfig.bcryptSaltRounds);
        // Create user
        const user = yield db_1.default.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        return user;
    });
}
/**
 * Create multiple users at once
 */
function createUsers(users) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        for (const userData of users) {
            try {
                const user = yield createUser(userData);
                results.push({ success: true, user });
            }
            catch (error) {
                results.push({
                    success: false,
                    email: userData.email,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return results;
    });
}
/**
 * Verify a user's password
 */
function verifyPassword(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield db_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return false;
        }
        return bcryptjs_1.default.compare(password, user.passwordHash);
    });
}
/**
 * Update user's password
 */
function updatePassword(userId, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const passwordHash = yield bcryptjs_1.default.hash(newPassword, auth_1.authConfig.bcryptSaltRounds);
        return db_1.default.user.update({
            where: { id: userId },
            data: { passwordHash },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
    });
}
/**
 * Update user's role
 */
function updateUserRole(userId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.default.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
    });
}
/**
 * Delete a user
 */
function deleteUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.default.user.delete({
            where: { id: userId },
        });
    });
}
/**
 * Get all users (admin only)
 */
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    });
}
/**
 * Get users by role
 */
function getUsersByRole(role) {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.default.user.findMany({
            where: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    });
}
