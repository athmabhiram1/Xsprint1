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
exports.getAllClubs = exports.createClub = void 0;
const db_1 = __importDefault(require("../lib/db"));
const createClub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, location } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Club name is required' });
    }
    try {
        const club = yield db_1.default.club.create({
            data: { name, location }
        });
        res.status(201).json({ success: true, club });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Club name already exists' });
        }
        res.status(500).json({ error: 'Failed to create club', details: error.message });
    }
});
exports.createClub = createClub;
const getAllClubs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubs = yield db_1.default.club.findMany({
            include: {
                _count: { select: { players: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, clubs });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch clubs', details: error.message });
    }
});
exports.getAllClubs = getAllClubs;
