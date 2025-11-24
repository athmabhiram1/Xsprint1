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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const responseFormatter_1 = require("../utils/responseFormatter");
const AnalyticsService_1 = require("../services/AnalyticsService");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/events/:eventId/fixture-analysis
 * Get fixture fairness analysis
 * Access: ADMIN, ORGANIZER
 */
router.get('/:eventId/fixture-analysis', auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN', 'ORGANIZER'), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.params;
    const analysis = yield AnalyticsService_1.analyticsService.getFixtureAnalysis(eventId);
    res.json((0, responseFormatter_1.ok)(analysis));
})));
/**
 * GET /api/events/:eventId/schedule-quality
 * Get schedule quality metrics
 * Access: ADMIN, ORGANIZER
 */
router.get('/:eventId/schedule-quality', auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN', 'ORGANIZER'), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.params;
    const quality = yield AnalyticsService_1.analyticsService.getScheduleQuality(eventId);
    res.json((0, responseFormatter_1.ok)(quality));
})));
exports.default = router;
