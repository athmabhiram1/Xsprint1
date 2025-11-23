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
exports.DbOptimizer = void 0;
const client_1 = require("@prisma/client");
/**
 * Optimize Prisma queries to avoid N+1 problems
 */
class DbOptimizer {
    /**
     * Batch fetch players with clubs in a single query
     */
    static batchFetchPlayersWithClubs(playerIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (playerIds.length === 0)
                return [];
            return client_1.Prisma.validator()({
                where: { id: { in: playerIds } },
                include: { club: true }
            });
        });
    }
    /**
     * Optimize match queries with all necessary relations
     */
    static getMatchWithRelations() {
        return {
            include: {
                playerA: { include: { club: true } },
                playerB: { include: { club: true } },
                winner: true,
                schedule: { include: { court: true } },
                event: { select: { id: true, name: true, type: true } }
            }
        };
    }
    /**
     * Get optimized event query with counts
     */
    static getEventWithCounts() {
        return {
            include: {
                _count: {
                    select: {
                        registrations: true,
                        matches: true
                    }
                },
                tournament: {
                    select: {
                        name: true,
                        startDate: true,
                        endDate: true
                    }
                }
            }
        };
    }
}
exports.DbOptimizer = DbOptimizer;
