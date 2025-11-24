"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TournamentController_1 = require("../controllers/TournamentController");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public: View tournaments
router.get('/', TournamentController_1.getAllTournaments);
router.get('/:id', TournamentController_1.getTournamentById);
// Protected: Only ADMIN/ORGANIZER can create tournaments
router.post('/', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), TournamentController_1.createTournament);
exports.default = router;
