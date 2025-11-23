"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EventController_1 = require("../controllers/EventController");
const LeaderboardController_1 = require("../controllers/LeaderboardController");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public: View all events
router.get('/', EventController_1.getAllEvents);
// Public: View events and registrations
router.get('/tournament/:tournamentId', EventController_1.getEventsByTournament);
router.get('/:eventId/registrations', EventController_1.getEventRegistrations);
// Public: View leaderboard/standings
router.get('/:eventId/standings', LeaderboardController_1.getEventStandings);
// Protected: Analytics (Admin/Organizer only)
router.get('/:eventId/analytics', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), LeaderboardController_1.getEventAnalytics);
// Protected: Only ADMIN/ORGANIZER can create events and register players
router.post('/', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), EventController_1.createEvent);
router.post('/register', auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN, client_1.Role.ORGANIZER), EventController_1.registerPlayerToEvent);
exports.default = router;
