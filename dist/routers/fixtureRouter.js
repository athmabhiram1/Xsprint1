"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FixtureController_1 = require("../controllers/FixtureController");
const auth_1 = require("../middlewares/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post('/events/:id/fixtures/generate', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), FixtureController_1.generateFixtures);
exports.default = router;
