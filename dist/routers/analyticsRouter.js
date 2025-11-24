"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AnalyticsController_1 = require("../controllers/AnalyticsController");
const auth_1 = require("../middlewares/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/events/:id/analytics', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), AnalyticsController_1.getEventAnalytics);
exports.default = router;
