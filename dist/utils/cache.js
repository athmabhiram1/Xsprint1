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
exports.cache = void 0;
exports.getCacheKey = getCacheKey;
exports.getCached = getCached;
exports.invalidateCache = invalidateCache;
exports.clearCache = clearCache;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false
});
exports.cache = cache;
function getCacheKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
}
function getCached(key, fetcher, ttl) {
    return __awaiter(this, void 0, void 0, function* () {
        const cached = cache.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const data = yield fetcher();
        cache.set(key, data, ttl || 300);
        return data;
    });
}
function invalidateCache(pattern) {
    const keys = cache.keys();
    const regex = new RegExp(pattern);
    keys.forEach(key => {
        if (regex.test(key)) {
            cache.del(key);
        }
    });
}
function clearCache() {
    cache.flushAll();
}
