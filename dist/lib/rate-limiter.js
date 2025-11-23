"use strict";
/**
 * In-Memory Rate Limiter
 *
 * Simple rate limiter for match code verification to prevent brute-force attacks.
 * Tracks failed attempts by key (IP + matchId or userId + matchId).
 *
 * Note: In-memory implementation - state resets on server restart.
 * For production multi-instance deployments, consider Redis-backed solution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchCodeRateLimiter = exports.RateLimiter = void 0;
class RateLimiter {
    constructor(windowMs = 10 * 60 * 1000, maxAttempts = 10) {
        this.attempts = new Map();
        this.windowMs = windowMs; // Default: 10 minutes
        this.maxAttempts = maxAttempts; // Default: 10 attempts
        // Cleanup expired entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
    /**
     * Check if key has exceeded rate limit
     * @returns true if limit exceeded, false otherwise
     */
    checkLimit(key) {
        const now = Date.now();
        const entry = this.attempts.get(key);
        if (!entry) {
            return false; // No attempts yet
        }
        // Check if window has expired
        if (now - entry.windowStart > this.windowMs) {
            this.attempts.delete(key);
            return false;
        }
        // Check if limit exceeded
        return entry.count >= this.maxAttempts;
    }
    /**
     * Record a failed attempt
     */
    recordFailure(key) {
        const now = Date.now();
        const entry = this.attempts.get(key);
        if (!entry || now - entry.windowStart > this.windowMs) {
            // Start new window
            this.attempts.set(key, {
                count: 1,
                windowStart: now,
            });
        }
        else {
            // Increment count in current window
            entry.count++;
        }
        // Log for security monitoring
        if (entry && entry.count >= this.maxAttempts) {
            console.warn(`[SECURITY] Rate limit exceeded for key: ${key.substring(0, 20)}... (${entry.count} attempts)`);
        }
    }
    /**
     * Reset attempts for a key (e.g., after successful validation)
     */
    reset(key) {
        this.attempts.delete(key);
    }
    /**
     * Get current attempt count for a key
     */
    getAttemptCount(key) {
        const entry = this.attempts.get(key);
        if (!entry)
            return 0;
        const now = Date.now();
        if (now - entry.windowStart > this.windowMs) {
            return 0;
        }
        return entry.count;
    }
    /**
     * Get time until rate limit resets (in ms)
     */
    getTimeUntilReset(key) {
        const entry = this.attempts.get(key);
        if (!entry)
            return 0;
        const now = Date.now();
        const elapsed = now - entry.windowStart;
        if (elapsed > this.windowMs) {
            return 0;
        }
        return this.windowMs - elapsed;
    }
    /**
     * Get all blocked keys (for security dashboard)
     */
    getBlockedKeys() {
        const now = Date.now();
        const blocked = [];
        this.attempts.forEach((entry, key) => {
            if (entry.count >= this.maxAttempts && now - entry.windowStart <= this.windowMs) {
                blocked.push({
                    key,
                    attempts: entry.count,
                    blockedUntil: new Date(entry.windowStart + this.windowMs),
                });
            }
        });
        return blocked;
    }
    /**
     * Get statistics (for security dashboard)
     */
    getStats() {
        const now = Date.now();
        let blockedCount = 0;
        let totalAttempts = 0;
        this.attempts.forEach((entry) => {
            if (now - entry.windowStart <= this.windowMs) {
                totalAttempts += entry.count;
                if (entry.count >= this.maxAttempts) {
                    blockedCount++;
                }
            }
        });
        return {
            totalKeys: this.attempts.size,
            blockedKeys: blockedCount,
            totalAttempts,
        };
    }
    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        this.attempts.forEach((entry, key) => {
            if (now - entry.windowStart > this.windowMs) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach((key) => this.attempts.delete(key));
        if (keysToDelete.length > 0) {
            console.log(`[RateLimiter] Cleaned up ${keysToDelete.length} expired entries`);
        }
    }
}
exports.RateLimiter = RateLimiter;
// Export singleton instance
exports.matchCodeRateLimiter = new RateLimiter();
