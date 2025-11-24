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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../config/auth");
const auth_2 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
/**
 * POST /api/auth/register-admin
 *
 * Bootstrap endpoint for creating the first admin user.
 * Requires ADMIN_BOOTSTRAP_CODE from environment variables.
 * Blocks creation of multiple admins unless ALLOW_MULTIPLE_ADMINS is true.
 */
router.post('/register-admin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, adminCode } = req.body;
        // Validate required fields
        if (!name || !email || !password || !adminCode) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'email', 'password', 'adminCode'],
            });
        }
        // Verify bootstrap code
        if (!auth_1.authConfig.adminBootstrapCode) {
            return res.status(500).json({
                error: 'Admin registration not configured',
                message: 'ADMIN_BOOTSTRAP_CODE environment variable is not set',
            });
        }
        if (adminCode !== auth_1.authConfig.adminBootstrapCode) {
            return res.status(403).json({
                error: 'Invalid admin code',
                message: 'The provided admin bootstrap code is incorrect',
            });
        }
        // Check if admin already exists
        const existingAdmin = yield db_1.default.user.findFirst({
            where: { role: client_1.Role.ADMIN },
        });
        if (existingAdmin && !auth_1.authConfig.allowMultipleAdmins) {
            return res.status(403).json({
                error: 'Admin already exists',
                message: 'An admin user already exists. Multiple admins are not allowed.',
            });
        }
        // Check if email is already taken
        const existingUser = yield db_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email already in use',
                message: 'A user with this email already exists',
            });
        }
        // Hash password
        const passwordHash = yield bcryptjs_1.default.hash(password, auth_1.authConfig.bcryptSaltRounds);
        // Create admin user
        const admin = yield db_1.default.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: client_1.Role.ADMIN,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({
            userId: admin.id,
            role: admin.role,
            email: admin.email,
        }, auth_1.authConfig.jwtSecret, { expiresIn: auth_1.authConfig.jwtExpiresIn });
        // Set cookie
        res.cookie(auth_1.authConfig.cookieName, token, auth_1.authConfig.cookieOptions);
        res.status(201).json({
            message: 'Admin user created successfully',
            user: admin,
        });
    }
    catch (error) {
        console.error('Error in register-admin:', error);
        res.status(500).json({
            error: 'Failed to create admin user',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}));
/**
 * POST /api/auth/register
 *
 * Register a new user (VIEWER role by default).
 */
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'email', 'password'],
            });
        }
        // Check if email is already taken
        const existingUser = yield db_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email already in use',
                message: 'A user with this email already exists',
            });
        }
        // Hash password
        const passwordHash = yield bcryptjs_1.default.hash(password, auth_1.authConfig.bcryptSaltRounds);
        // Create user
        const user = yield db_1.default.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: client_1.Role.VIEWER, // Default role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
            email: user.email,
        }, auth_1.authConfig.jwtSecret, { expiresIn: auth_1.authConfig.jwtExpiresIn });
        // Set cookie
        res.cookie(auth_1.authConfig.cookieName, token, auth_1.authConfig.cookieOptions);
        res.status(201).json({
            message: 'User registered successfully',
            user,
        });
    }
    catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({
            error: 'Failed to register user',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}));
/**
 * POST /api/auth/login
 *
 * Authenticate user with email and password.
 * Returns user info and sets httpOnly JWT cookie.
 */
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'password'],
            });
        }
        // Find user
        const user = yield db_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect',
            });
        }
        // Verify password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect',
            });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
            email: user.email,
        }, auth_1.authConfig.jwtSecret, { expiresIn: auth_1.authConfig.jwtExpiresIn });
        // Set cookie
        res.cookie(auth_1.authConfig.cookieName, token, auth_1.authConfig.cookieOptions);
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({
            error: 'Login failed',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}));
/**
 * POST /api/auth/logout
 *
 * Clear authentication cookie.
 */
router.post('/logout', (req, res) => {
    res.clearCookie(auth_1.authConfig.cookieName, {
        httpOnly: true,
        secure: auth_1.authConfig.cookieOptions.secure,
        sameSite: auth_1.authConfig.cookieOptions.sameSite,
    });
    res.json({
        message: 'Logout successful',
    });
});
/**
 * GET /api/auth/me
 *
 * Get current authenticated user's information.
 * Requires authentication.
 */
router.get('/me', auth_2.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // req.user is guaranteed to exist because of requireAuth middleware
        const user = yield db_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The authenticated user no longer exists',
            });
        }
        res.json({
            user,
        });
    }
    catch (error) {
        console.error('Error in /me:', error);
        res.status(500).json({
            error: 'Failed to fetch user data',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}));
exports.default = router;
