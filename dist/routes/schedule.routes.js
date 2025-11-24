"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ScheduleController_1 = require("../controllers/ScheduleController");
const auth_1 = require("../middlewares/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Auto-generate schedule for an event
router.post('/events/:id/generate', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), ScheduleController_1.generateSchedule);
// Reschedule a match
router.patch('/matches/:id/reschedule', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), ScheduleController_1.rescheduleMatch);
// Handle player withdrawal
router.post('/matches/:id/withdraw', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), ScheduleController_1.withdrawMatch);
exports.default = router;
