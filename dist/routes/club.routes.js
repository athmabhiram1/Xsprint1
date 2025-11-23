"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClubController_1 = require("../controllers/ClubController");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public: View clubs
router.get('/', ClubController_1.getAllClubs);
// Protected: Only ADMIN/ORGANIZER can create clubs
router.post('/', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), ClubController_1.createClub);
exports.default = router;
