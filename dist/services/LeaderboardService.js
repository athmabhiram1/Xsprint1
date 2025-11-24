"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.LeaderboardService = void 0;
const db_1 = __importDefault(require("../lib/db"));
class LeaderboardService {
    /**
     * Get knockout tournament standings
     * Identifies champion, runner-up, and semi-finalists
     */
    getKnockoutStandings(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            // Fetch all completed matches for this event, ordered by round descending
            const matches = yield db_1.default.match.findMany({
                where: {
                    eventId,
                    status: 'COMPLETED',
                    winnerId: { not: null }
                },
                include: {
                    playerA: { include: { club: true } },
                    playerB: { include: { club: true } },
                    winner: { include: { club: true } }
                },
                orderBy: { round: 'desc' }
            });
            if (matches.length === 0) {
                return {
                    champion: null,
                    runnerUp: null,
                    semifinalists: []
                };
            }
            // Find the highest round (final)
            const maxRound = Math.max(...matches.map(m => m.round));
            const finalMatch = matches.find(m => m.round === maxRound);
            let champion = null;
            let runnerUp = null;
            const semifinalists = [];
            // Extract champion and runner-up from final
            if (finalMatch && finalMatch.winner) {
                champion = {
                    id: finalMatch.winner.id,
                    name: finalMatch.winner.name,
                    club: ((_a = finalMatch.winner.club) === null || _a === void 0 ? void 0 : _a.name) || null
                };
                // Runner-up is the loser of the final
                const loser = ((_b = finalMatch.playerA) === null || _b === void 0 ? void 0 : _b.id) === finalMatch.winner.id
                    ? finalMatch.playerB
                    : finalMatch.playerA;
                if (loser) {
                    runnerUp = {
                        id: loser.id,
                        name: loser.name,
                        club: ((_c = loser.club) === null || _c === void 0 ? void 0 : _c.name) || null
                    };
                }
            }
            // Find semi-finalists (losers of semi-final round)
            if (maxRound > 1) {
                const semiFinalRound = maxRound - 1;
                const semiFinalMatches = matches.filter(m => m.round === semiFinalRound);
                for (const match of semiFinalMatches) {
                    if (match.winner) {
                        // The loser of this semi-final is a semi-finalist
                        const loser = ((_d = match.playerA) === null || _d === void 0 ? void 0 : _d.id) === match.winner.id
                            ? match.playerB
                            : match.playerA;
                        if (loser && loser.id !== (runnerUp === null || runnerUp === void 0 ? void 0 : runnerUp.id)) {
                            semifinalists.push({
                                id: loser.id,
                                name: loser.name,
                                club: ((_e = loser.club) === null || _e === void 0 ? void 0 : _e.name) || null
                            });
                        }
                    }
                }
            }
            return {
                champion,
                runnerUp,
                semifinalists
            };
        });
    }
    /**
     * Get round-robin standings
     * Computes wins, losses, points, and applies tie-breakers
     */
    getRoundRobinStandings(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            // Fetch all matches for this event
            const matches = yield db_1.default.match.findMany({
                where: { eventId },
                include: {
                    playerA: { include: { club: true } },
                    playerB: { include: { club: true } },
                    winner: { include: { club: true } }
                }
            });
            // Get all registered players for this event
            const registrations = yield db_1.default.registration.findMany({
                where: { eventId },
                include: {
                    player: { include: { club: true } }
                }
            });
            // Build standings map
            const standingsMap = new Map();
            // Initialize all registered players
            for (const reg of registrations) {
                standingsMap.set(reg.player.id, {
                    player: {
                        id: reg.player.id,
                        name: reg.player.name,
                        club: ((_a = reg.player.club) === null || _a === void 0 ? void 0 : _a.name) || null
                    },
                    rank: 0,
                    wins: 0,
                    losses: 0,
                    matchesPlayed: 0,
                    pointsFor: 0,
                    pointsAgainst: 0,
                    pointDifferential: 0
                });
            }
            // Process completed matches
            for (const match of matches) {
                if (match.status !== 'COMPLETED' || !match.winnerId)
                    continue;
                const playerAId = (_b = match.playerA) === null || _b === void 0 ? void 0 : _b.id;
                const playerBId = (_c = match.playerB) === null || _c === void 0 ? void 0 : _c.id;
                if (!playerAId || !playerBId)
                    continue;
                const standingA = standingsMap.get(playerAId);
                const standingB = standingsMap.get(playerBId);
                if (!standingA || !standingB)
                    continue;
                // Update matches played
                standingA.matchesPlayed++;
                standingB.matchesPlayed++;
                // Determine winner and loser
                const isAWinner = match.winnerId === playerAId;
                const winner = isAWinner ? standingA : standingB;
                const loser = isAWinner ? standingB : standingA;
                winner.wins++;
                loser.losses++;
                // Extract points from score if available
                if (match.score && typeof match.score === 'object') {
                    const score = match.score;
                    // Try to extract points from various score formats
                    if (score.sets && Array.isArray(score.sets)) {
                        let playerAPoints = 0;
                        let playerBPoints = 0;
                        for (const set of score.sets) {
                            playerAPoints += set.a || 0;
                            playerBPoints += set.b || 0;
                        }
                        standingA.pointsFor += playerAPoints;
                        standingA.pointsAgainst += playerBPoints;
                        standingB.pointsFor += playerBPoints;
                        standingB.pointsAgainst += playerAPoints;
                    }
                    else if (score.playerA !== undefined && score.playerB !== undefined) {
                        standingA.pointsFor += score.playerA || 0;
                        standingA.pointsAgainst += score.playerB || 0;
                        standingB.pointsFor += score.playerB || 0;
                        standingB.pointsAgainst += score.playerA || 0;
                    }
                }
            }
            // Calculate point differentials
            for (const standing of standingsMap.values()) {
                standing.pointDifferential = standing.pointsFor - standing.pointsAgainst;
            }
            // Convert to array and sort
            const standings = Array.from(standingsMap.values());
            // Sort by: wins (desc), then point differential (desc), then points for (desc)
            standings.sort((a, b) => {
                if (b.wins !== a.wins)
                    return b.wins - a.wins;
                if (b.pointDifferential !== a.pointDifferential) {
                    return b.pointDifferential - a.pointDifferential;
                }
                return b.pointsFor - a.pointsFor;
            });
            // Assign ranks
            standings.forEach((standing, index) => {
                standing.rank = index + 1;
            });
            return standings;
        });
    }
    /**
     * Get event leaderboard (unified wrapper)
     * Detects format and returns appropriate standings
     * CACHED for 10 seconds
     */
    getEventLeaderboard(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Import cache service
            const { cacheService } = yield Promise.resolve().then(() => __importStar(require('./CacheService')));
            // Check cache first
            const cacheKey = `leaderboard:${eventId}`;
            const cached = cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
            // Fetch event to determine format
            const event = yield db_1.default.event.findUnique({
                where: { id: eventId },
                select: { id: true, type: true }
            });
            if (!event) {
                throw new Error('Event not found');
            }
            const format = event.type || 'KNOCKOUT';
            const result = {
                eventId,
                format
            };
            if (format === 'ROUND_ROBIN') {
                result.roundRobin = yield this.getRoundRobinStandings(eventId);
            }
            else {
                // Default to knockout
                result.knockout = yield this.getKnockoutStandings(eventId);
            }
            // Cache the result
            cacheService.set(cacheKey, result, 10);
            return result;
        });
    }
    /**
     * Get event analytics (for admin/organizer)
     */
    getEventAnalytics(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield db_1.default.event.findUnique({
                where: { id: eventId },
                include: {
                    matches: {
                        include: {
                            playerA: { include: { club: true } },
                            playerB: { include: { club: true } },
                            schedule: { include: { court: true } }
                        }
                    },
                    registrations: true
                }
            });
            if (!event) {
                throw new Error('Event not found');
            }
            const totalMatches = event.matches.length;
            const completedMatches = event.matches.filter(m => m.status === 'COMPLETED').length;
            const inProgressMatches = event.matches.filter(m => m.status === 'ONGOING').length;
            const scheduledMatches = event.matches.filter(m => m.status === 'SCHEDULED').length;
            // Count same-club matches
            const sameClubMatchCount = event.matches.filter(m => {
                var _a, _b;
                return ((_a = m.playerA) === null || _a === void 0 ? void 0 : _a.clubId) && ((_b = m.playerB) === null || _b === void 0 ? void 0 : _b.clubId) &&
                    m.playerA.clubId === m.playerB.clubId;
            }).length;
            // Court utilization
            const courtsUsed = new Set(event.matches
                .filter(m => { var _a; return (_a = m.schedule) === null || _a === void 0 ? void 0 : _a.courtId; })
                .map(m => m.schedule.courtId)).size;
            const scheduledSlotsUsed = event.matches.filter(m => m.schedule).length;
            // Average rest time (simplified - just check time between matches for each player)
            // This is a basic approximation
            const averageRestTimePerPlayer = this.calculateAverageRestTime(event.matches);
            return {
                eventId,
                eventName: event.name,
                format: event.type,
                totalMatches,
                completedMatches,
                inProgressMatches,
                scheduledMatches,
                pendingMatches: totalMatches - completedMatches - inProgressMatches - scheduledMatches,
                completionRate: totalMatches > 0 ? (completedMatches / totalMatches * 100).toFixed(2) + '%' : '0%',
                sameClubMatchCount,
                sameClubMatchPercentage: totalMatches > 0 ? (sameClubMatchCount / totalMatches * 100).toFixed(2) + '%' : '0%',
                courtUtilization: {
                    courtsUsed,
                    scheduledSlotsUsed,
                    utilizationRate: totalMatches > 0 ? (scheduledSlotsUsed / totalMatches * 100).toFixed(2) + '%' : '0%'
                },
                averageRestTimeMinutes: averageRestTimePerPlayer,
                totalRegistrations: event.registrations.length
            };
        });
    }
    /**
     * Calculate average rest time between matches for players
     * Returns average in minutes
     */
    calculateAverageRestTime(matches) {
        var _a, _b, _c, _d;
        const scheduledMatches = matches
            .filter(m => { var _a, _b; return ((_a = m.schedule) === null || _a === void 0 ? void 0 : _a.startTime) && ((_b = m.schedule) === null || _b === void 0 ? void 0 : _b.endTime); })
            .sort((a, b) => a.schedule.startTime.getTime() - b.schedule.startTime.getTime());
        if (scheduledMatches.length < 2) {
            return 0;
        }
        const playerRestTimes = new Map();
        // For each player, calculate rest times between consecutive matches
        for (let i = 0; i < scheduledMatches.length; i++) {
            const match = scheduledMatches[i];
            const playerIds = [(_a = match.playerA) === null || _a === void 0 ? void 0 : _a.id, (_b = match.playerB) === null || _b === void 0 ? void 0 : _b.id].filter(Boolean);
            for (const playerId of playerIds) {
                if (!playerId)
                    continue;
                // Find next match for this player
                for (let j = i + 1; j < scheduledMatches.length; j++) {
                    const nextMatch = scheduledMatches[j];
                    if (((_c = nextMatch.playerA) === null || _c === void 0 ? void 0 : _c.id) === playerId || ((_d = nextMatch.playerB) === null || _d === void 0 ? void 0 : _d.id) === playerId) {
                        // Calculate rest time
                        const restTime = nextMatch.schedule.startTime.getTime() - match.schedule.endTime.getTime();
                        const restMinutes = restTime / (1000 * 60);
                        if (!playerRestTimes.has(playerId)) {
                            playerRestTimes.set(playerId, []);
                        }
                        playerRestTimes.get(playerId).push(restMinutes);
                        break; // Only consider immediate next match
                    }
                }
            }
        }
        // Calculate overall average
        let totalRestTime = 0;
        let totalRestPeriods = 0;
        for (const restTimes of playerRestTimes.values()) {
            totalRestTime += restTimes.reduce((sum, time) => sum + time, 0);
            totalRestPeriods += restTimes.length;
        }
        return totalRestPeriods > 0 ? Math.round(totalRestTime / totalRestPeriods) : 0;
    }
}
exports.LeaderboardService = LeaderboardService;
