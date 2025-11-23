"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
/**
 * In-Memory Cache Service
 * Used for caching leaderboards and analytics
 */
class CacheService {
    constructor() {
        // TTL: 10 seconds, check period: 15 seconds
        this.cache = new node_cache_1.default({
            stdTTL: 10,
            checkperiod: 15,
            useClones: false,
        });
    }
    /**
     * Get value from cache
     */
    get(key) {
        return this.cache.get(key);
    }
    /**
     * Set value in cache
     */
    set(key, value, ttl) {
        return this.cache.set(key, value, ttl || 10);
    }
    /**
     * Delete key from cache
     */
    del(key) {
        return this.cache.del(key);
    }
    /**
     * Delete all keys matching pattern
     */
    delPattern(pattern) {
        const keys = this.cache.keys().filter((key) => key.includes(pattern));
        return this.cache.del(keys);
    }
    /**
     * Clear all cache
     */
    flush() {
        this.cache.flushAll();
    }
    /**
     * Get cache stats
     */
    getStats() {
        return this.cache.getStats();
    }
}
// Export singleton instance
exports.cacheService = new CacheService();
