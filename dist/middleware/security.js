"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultSubmissionRateLimiter = exports.matchCodeRateLimiter = exports.authRateLimiter = exports.globalRateLimiter = exports.corsOptions = void 0;
exports.applySecurityMiddleware = applySecurityMiddleware;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Security Middleware Configuration
 * Helmet, CORS, Compression, Rate Limiting
 */
// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];
exports.corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};
// Rate Limiting Configuration
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict rate limiter for auth endpoints
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
console.log(`[SECURITY] Auth Rate Limit: ${isDev ? 'Relaxed (1000)' : 'Strict (5)'} (NODE_ENV=${process.env.NODE_ENV})`);
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 1000 : 5,
    message: {
        success: false,
        error: 'Too many login attempts, please try again in 15 minutes.',
        retryAfter: 15,
    },
    skipSuccessfulRequests: true,
});
// Rate limiter for match code validation
exports.matchCodeRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 attempts per 5 minutes
    message: {
        success: false,
        error: 'Too many code validation attempts, please try again in 5 minutes.',
        retryAfter: 5,
    },
});
// Rate limiter for result submission
exports.resultSubmissionRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 submissions per minute
    message: {
        success: false,
        error: 'Too many result submissions, please slow down.',
        retryAfter: 1,
    },
});
/**
 * Apply all security middleware to Express app
 */
function applySecurityMiddleware(app) {
    // Helmet - Security headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    // CORS
    app.use((0, cors_1.default)(exports.corsOptions));
    // Compression
    app.use((0, compression_1.default)());
    // Global rate limiting
    app.use(exports.globalRateLimiter);
    // Trust proxy (for rate limiting behind reverse proxy)
    app.set('trust proxy', 1);
}
