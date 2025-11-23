"use strict";
/**
 * Rate Limiting Middleware
 *
 * Express middleware for rate limiting match code verification attempts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetRateLimit = exports.recordFailedAttempt = exports.rateLimitMatchCode = void 0;
const rate_limiter_1 = require("../lib/rate-limiter");
/**
 * Rate limit middleware for match code validation
 *
 * Limits failed attempts to prevent brute-force attacks on match codes.
 * Uses IP + matchId as the rate limit key.
 */
const rateLimitMatchCode = (req, res, next) => {
    const { matchId } = req.body;
    if (!matchId) {
        // If no matchId, let the request through (will fail validation anyway)
        return next();
    }
    // Create rate limit key from IP and matchId
    const key = `${req.ip}_${matchId}`;
    // Check if rate limit exceeded
    if (rate_limiter_1.matchCodeRateLimiter.checkLimit(key)) {
        const timeUntilReset = rate_limiter_1.matchCodeRateLimiter.getTimeUntilReset(key);
        const minutesUntilReset = Math.ceil(timeUntilReset / 1000 / 60);
        console.warn(`[SECURITY] Rate limit exceeded for IP ${req.ip} on match ${matchId}`);
        res.status(429).json({
            error: 'Too many attempts',
            message: `Too many failed validation attempts. Please try again in ${minutesUntilReset} minutes.`,
            retryAfter: minutesUntilReset,
            blockedUntil: new Date(Date.now() + timeUntilReset).toISOString(),
        });
        return;
    }
    // Allow request to proceed
    next();
};
exports.rateLimitMatchCode = rateLimitMatchCode;
/**
 * Record a failed match code validation attempt
 * Call this from the controller after a failed validation
 */
const recordFailedAttempt = (req, matchId) => {
    const key = `${req.ip}_${matchId}`;
    rate_limiter_1.matchCodeRateLimiter.recordFailure(key);
    const attemptCount = rate_limiter_1.matchCodeRateLimiter.getAttemptCount(key);
    console.warn(`[SECURITY] Failed match code attempt #${attemptCount} from IP ${req.ip} for match ${matchId}`);
};
exports.recordFailedAttempt = recordFailedAttempt;
/**
 * Reset rate limit for a key after successful validation
 * Call this from the controller after a successful validation
 */
const resetRateLimit = (req, matchId) => {
    const key = `${req.ip}_${matchId}`;
    rate_limiter_1.matchCodeRateLimiter.reset(key);
};
exports.resetRateLimit = resetRateLimit;
