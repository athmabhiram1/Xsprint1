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
exports.getTournamentById = exports.getAllTournaments = exports.createTournament = void 0;
const db_1 = __importDefault(require("../lib/db"));
/**
 * Creates a new tournament with optional courts.
 */
const createTournament = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, startDate, endDate, location, courts } = req.body;
    // Validation
    if (!name || !startDate || !endDate) {
        return res.status(400).json({
            success: false,
            error: 'Name, start date, and end date are required'
        });
    }
    let startDateObj, endDateObj;
    try {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
        // Check if dates are valid
        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format. Use ISO string (e.g., 2023-10-27T10:00:00.000Z).'
            });
        }
        // Check if end date is after start date
        if (endDateObj <= startDateObj) {
            return res.status(400).json({
                success: false,
                error: 'End date must be after start date.'
            });
        }
    }
    catch (e) {
        return res.status(400).json({
            success: false,
            error: 'Invalid date format. Use ISO string (e.g., 2023-10-27T10:00:00.000Z).'
        });
    }
    // Validate courts array if provided
    if (courts && !Array.isArray(courts)) {
        return res.status(400).json({
            success: false,
            error: 'Courts must be an array.'
        });
    }
    try {
        const createData = {
            name: name.trim(),
            startDate: startDateObj,
            endDate: endDateObj
        };
        // Add location if provided
        if (location) {
            createData.location = location.trim();
        }
        // Map courts correctly: { name: "Court 1" } → { create: [{ name: "Court 1" }] }
        if (courts && courts.length > 0) {
            createData.courts = {
                create: courts.map((c) => ({
                    name: typeof c === 'string' ? c : c.name
                }))
            };
        }
        const tournament = yield db_1.default.tournament.create({
            data: createData,
            include: {
                courts: true,
                events: {
                    include: {
                        _count: { select: { registrations: true, matches: true } }
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Tournament created successfully',
            tournament
        });
    }
    catch (error) {
        console.error('Error creating tournament:', error);
        // Handle Prisma-specific errors
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: `A tournament with the name "${name}" already exists.`
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create tournament due to an internal server error.',
            details: error.message
        });
    }
});
exports.createTournament = createTournament;
/**
 * Retrieves all tournaments with optional includes.
 */
const getAllTournaments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { includeEvents, includeCourts } = req.query;
    try {
        // Determine what to include based on query parameters
        const includeEventsBool = includeEvents === 'true';
        const includeCourtsBool = includeCourts === 'true';
        const tournaments = yield db_1.default.tournament.findMany({
            include: {
                // Conditionally include events and their counts
                events: includeEventsBool ? {
                    include: {
                        _count: { select: { registrations: true, matches: true } }
                    }
                } : false,
                // Conditionally include courts
                courts: includeCourtsBool,
                // Always include a count of events
                _count: { select: { events: true } }
            },
            orderBy: { startDate: 'desc' } // Order by start date, newest first
        });
        res.json({
            success: true,
            count: tournaments.length,
            includeEvents: includeEventsBool,
            includeCourts: includeCourtsBool,
            tournaments
        });
    }
    catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tournaments due to an internal server error.',
            details: error.message
        });
    }
});
exports.getAllTournaments = getAllTournaments;
/**
 * Retrieves a specific tournament by its ID.
 */
const getTournamentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Tournament ID is required'
        });
    }
    try {
        const tournament = yield db_1.default.tournament.findUnique({
            where: { id },
            include: {
                events: {
                    include: {
                        _count: { select: { registrations: true, matches: true } },
                        // Include basic info about matches for status checks (e.g., for fixture generation checks)
                        // matches: { select: { status: true } } // Uncomment if needed for frontend details
                    }
                },
                courts: true // Include courts for this specific tournament
            }
        });
        if (!tournament) {
            return res.status(404).json({
                success: false,
                error: 'Tournament not found'
            });
        }
        res.json({
            success: true,
            tournament
        });
    }
    catch (error) {
        console.error('Error fetching tournament:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tournament due to an internal server error.',
            details: error.message
        });
    }
});
exports.getTournamentById = getTournamentById;
// Optional: Add a function to update tournament details (excluding dates if matches are scheduled)
// export const updateTournament = async (req: Request, res: Response) => { ... }
// Optional: Add a function to delete a tournament (with checks for associated data)
// export const deleteTournament = async (req: Request, res: Response) => { ... }
