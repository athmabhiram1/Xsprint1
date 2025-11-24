"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = performanceMonitor;
/**
 * Performance monitoring middleware
 */
function performanceMonitor(req, res, next) {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
        const duration = Number(process.hrtime.bigint() - start) / 1000000;
        if (duration > 1000) {
            console.warn(`Slow request: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
        }
    });
    next();
}
