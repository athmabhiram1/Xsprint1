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
exports.FixtureEngine = void 0;
exports.createFixtureEngine = createFixtureEngine;
exports.validateFixtureConstraints = validateFixtureConstraints;
exports.calculateExistingFixtureFairness = calculateExistingFixtureFairness;
const db_1 = require("../lib/db");
const client_1 = require("@prisma/client");
const events_1 = require("events");
// ============================================================================
// MAIN ENGINE CLASS
// ============================================================================
class FixtureEngine extends events_1.EventEmitter {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        super();
        this.auditLog = [];
        this.rollbackSnapshots = new Map();
        this.opts = {
            randomizeUnseeded: (_a = options === null || options === void 0 ? void 0 : options.randomizeUnseeded) !== null && _a !== void 0 ? _a : false,
            maxSwapIterations: (_b = options === null || options === void 0 ? void 0 : options.maxSwapIterations) !== null && _b !== void 0 ? _b : 5000,
            optimizationTimeout: (_c = options === null || options === void 0 ? void 0 : options.optimizationTimeout) !== null && _c !== void 0 ? _c : 30000,
            dryRun: (_d = options === null || options === void 0 ? void 0 : options.dryRun) !== null && _d !== void 0 ? _d : false,
            groups: (_e = options === null || options === void 0 ? void 0 : options.groups) !== null && _e !== void 0 ? _e : 0,
            swissRounds: (_f = options === null || options === void 0 ? void 0 : options.swissRounds) !== null && _f !== void 0 ? _f : 0,
            randomSeed: (_g = options === null || options === void 0 ? void 0 : options.randomSeed) !== null && _g !== void 0 ? _g : null,
            seedingStrategy: (_h = options === null || options === void 0 ? void 0 : options.seedingStrategy) !== null && _h !== void 0 ? _h : 'registration_order',
            useEloRatings: (_j = options === null || options === void 0 ? void 0 : options.useEloRatings) !== null && _j !== void 0 ? _j : false,
            constraintWeights: (_k = options === null || options === void 0 ? void 0 : options.constraintWeights) !== null && _k !== void 0 ? _k : {
                sameClubAvoidance: 0.8,
                balancedBrackets: 0.6,
                minimizeByes: 0.7,
                historicalPerformance: 0.5,
                geographicDistribution: 0.3
            },
            enableAuditLog: (_l = options === null || options === void 0 ? void 0 : options.enableAuditLog) !== null && _l !== void 0 ? _l : true,
            enableRollback: (_m = options === null || options === void 0 ? void 0 : options.enableRollback) !== null && _m !== void 0 ? _m : true,
            allowPartialRegeneration: (_o = options === null || options === void 0 ? void 0 : options.allowPartialRegeneration) !== null && _o !== void 0 ? _o : true,
            batchSize: (_p = options === null || options === void 0 ? void 0 : options.batchSize) !== null && _p !== void 0 ? _p : 100,
            parallelProcessing: (_q = options === null || options === void 0 ? void 0 : options.parallelProcessing) !== null && _q !== void 0 ? _q : false,
            onProgress: (_r = options === null || options === void 0 ? void 0 : options.onProgress) !== null && _r !== void 0 ? _r : (() => { }),
            onError: (_s = options === null || options === void 0 ? void 0 : options.onError) !== null && _s !== void 0 ? _s : (() => { })
        };
        this.performanceMetrics = {
            startTime: 0,
            endTime: 0,
            operationCount: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
    }
    // ============================================================================
    // PUBLIC API METHODS
    // ============================================================================
    /**
     * Main entry point: Generate fixtures for an event
     *
     * @param eventId - Event identifier
     * @param format - Tournament format
     * @param options - Optional configuration overrides
     * @returns Generated fixture preview or committed matches
     */
    generateFixtures(eventId_1) {
        return __awaiter(this, arguments, void 0, function* (eventId, format = 'knockout', options) {
            this.performanceMetrics.startTime = Date.now();
            this.logAudit('FIXTURE_GENERATION_START', { eventId, format });
            try {
                // Merge options
                Object.assign(this.opts, options !== null && options !== void 0 ? options : {});
                // Create rollback snapshot if enabled
                if (this.opts.enableRollback) {
                    yield this.createRollbackSnapshot(eventId);
                }
                // Validate event and fetch data
                this.emitProgress('validation', 0, 'Validating event...');
                const { event, players } = yield this.validateAndFetchEventData(eventId);
                // Validate constraints before generation
                this.emitProgress('validation', 20, 'Validating constraints...');
                const constraintValidation = yield this.validateConstraints(eventId, players, format);
                if (constraintValidation.hasErrors) {
                    throw new Error(`Constraint validation failed: ${constraintValidation.errors.map(e => e.message).join(', ')}`);
                }
                // Route to appropriate format handler
                this.emitProgress('generation', 40, `Generating ${format} fixtures...`);
                let result;
                switch (format) {
                    case 'knockout':
                        result = yield this._generateKnockoutWorkflow(eventId, players);
                        break;
                    case 'roundrobin':
                        result = yield this._generateRoundRobinWorkflow(eventId, players);
                        break;
                    case 'groups_then_playoff':
                        result = yield this._generateGroupsThenPlayoff(eventId, players);
                        break;
                    case 'swiss':
                        result = yield this._generateSwissWorkflow(eventId, players);
                        break;
                    case 'double_elimination':
                        result = yield this._generateDoubleEliminationWorkflow(eventId, players);
                        break;
                    default:
                        throw new Error(`Unsupported format: ${format}`);
                }
                // Add warnings and recommendations
                result.warnings = constraintValidation.warnings;
                result.recommendations = this.generateRecommendations(result);
                this.emitProgress('completion', 100, 'Fixtures generated successfully');
                this.logAudit('FIXTURE_GENERATION_COMPLETE', {
                    eventId,
                    format,
                    matchCount: result.matches.length
                });
                this.performanceMetrics.endTime = Date.now();
                return result;
            }
            catch (error) {
                this.logAudit('FIXTURE_GENERATION_ERROR', { eventId, error: error.message });
                this.emitError({
                    code: 'GENERATION_FAILED',
                    message: error.message,
                    details: error,
                    recoverable: false
                });
                throw error;
            }
        });
    }
    /**
     * Regenerate specific rounds only (partial regeneration)
     */
    regenerateRounds(eventId_1, roundsToRegenerate_1) {
        return __awaiter(this, arguments, void 0, function* (eventId, roundsToRegenerate, preserveCompleted = true) {
            if (!this.opts.allowPartialRegeneration) {
                throw new Error('Partial regeneration is disabled');
            }
            this.logAudit('PARTIAL_REGENERATION_START', { eventId, rounds: roundsToRegenerate });
            // Fetch existing matches
            const existingMatches = yield db_1.prisma.match.findMany({
                where: { eventId },
                orderBy: { round: 'asc' }
            });
            // Filter matches to preserve
            const matchesToPreserve = existingMatches.filter(m => {
                if (preserveCompleted && m.status === client_1.MatchStatus.COMPLETED) {
                    return true;
                }
                return !roundsToRegenerate.includes(m.round);
            });
            // Delete matches in rounds to regenerate
            yield db_1.prisma.match.deleteMany({
                where: {
                    eventId,
                    round: { in: roundsToRegenerate },
                    status: { not: preserveCompleted ? client_1.MatchStatus.COMPLETED : undefined }
                }
            });
            // Regenerate deleted rounds
            // (Implementation would depend on format and requires winner propagation logic)
            this.logAudit('PARTIAL_REGENERATION_COMPLETE', { eventId, rounds: roundsToRegenerate });
            // Return updated preview
            return this.previewFixtures(eventId, 'knockout', { dryRun: true });
        });
    }
    /**
     * Preview fixtures without committing to database
     */
    previewFixtures(eventId, format, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.generateFixtures(eventId, format, Object.assign(Object.assign({}, options), { dryRun: true }));
        });
    }
    /**
     * Rollback to previous fixture state
     */
    rollback(eventId, snapshotId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.opts.enableRollback) {
                throw new Error('Rollback is disabled');
            }
            const snapshot = snapshotId
                ? this.rollbackSnapshots.get(snapshotId)
                : Array.from(this.rollbackSnapshots.values())
                    .filter(s => s.eventId === eventId)
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
            if (!snapshot) {
                throw new Error('No rollback snapshot found');
            }
            this.logAudit('ROLLBACK_START', { eventId, snapshotId: snapshot.id });
            yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Delete current matches
                yield tx.match.deleteMany({ where: { eventId } });
                // Restore snapshot matches
                for (const match of snapshot.matches) {
                    yield tx.match.create({ data: match });
                }
            }));
            this.logAudit('ROLLBACK_COMPLETE', { eventId, snapshotId: snapshot.id });
            return true;
        });
    }
    /**
     * Calculate fairness score for generated fixtures
     */
    calculateFairnessScore(preview) {
        var _a;
        let score = 100;
        const weights = this.opts.constraintWeights;
        // Penalize same-club collisions
        const clubCollisionPenalty = (preview.metrics.sameClubCollisions / preview.metrics.totalPlayers) *
            weights.sameClubAvoidance * 40;
        score -= clubCollisionPenalty;
        // Penalize bracket imbalance
        if (preview.metrics.bracketSize) {
            const byeRatio = ((_a = preview.metrics.byes) !== null && _a !== void 0 ? _a : 0) / preview.metrics.bracketSize;
            const imbalancePenalty = byeRatio * weights.balancedBrackets * 20;
            score -= imbalancePenalty;
        }
        // Reward even distribution
        const distributionBonus = this.calculateDistributionScore(preview) * 10;
        score += distributionBonus;
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Export fixture template for reuse
     */
    exportTemplate(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const matches = yield db_1.prisma.match.findMany({
                where: { eventId },
                include: { playerA: true, playerB: true }
            });
            return {
                id: `template-${Date.now()}`,
                name: `Template for Event ${eventId}`,
                format: 'knockout', // This should be fetched from event metadata
                structure: this.analyzeFixtureStructure(matches),
                metadata: {
                    totalRounds: Math.max(...matches.map(m => m.round)),
                    totalMatches: matches.length,
                    createdAt: new Date()
                }
            };
        });
    }
    /**
     * Import and apply fixture template
     */
    importTemplate(eventId, template) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logAudit('TEMPLATE_IMPORT_START', { eventId, templateId: template.id });
            // Validate template compatibility
            const { players } = yield this.validateAndFetchEventData(eventId);
            if (players.length !== template.structure.expectedPlayerCount) {
                throw new Error(`Template expects ${template.structure.expectedPlayerCount} players, but event has ${players.length}`);
            }
            // Apply template structure (implementation depends on template format)
            // This would map template positions to actual players
            return this.previewFixtures(eventId, template.format);
        });
    }
    // ============================================================================
    // PRIVATE WORKFLOW METHODS - KNOCKOUT
    // ============================================================================
    _generateKnockoutWorkflow(eventId, players) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const rng = this.rng((_a = this.opts.randomSeed) !== null && _a !== void 0 ? _a : undefined);
            // Determine bracket parameters
            const totalPlayers = players.length;
            const bracketSize = Math.pow(2, Math.ceil(Math.log2(totalPlayers)));
            const byes = bracketSize - totalPlayers;
            const totalRounds = Math.log2(bracketSize);
            this.emitProgress('knockout', 45, 'Applying seeding strategy...');
            // Apply advanced seeding
            const seededPlayers = yield this.applyAdvancedSeeding(players, rng);
            // Distribute players across brackets with optimization
            this.emitProgress('knockout', 55, 'Optimizing bracket distribution...');
            const distributed = yield this.distributeWithAdvancedOptimization(seededPlayers, bracketSize);
            // Map to bracket slots using standard seeding order
            const seedOrder = this.getSeedingOrder(bracketSize);
            const bracketSlots = new Array(bracketSize).fill(null);
            for (let i = 0; i < seedOrder.length; i++) {
                const seedNum = seedOrder[i];
                if (seedNum <= distributed.length) {
                    bracketSlots[i] = distributed[seedNum - 1];
                }
            }
            // Multi-objective optimization
            this.emitProgress('knockout', 70, 'Running multi-objective optimization...');
            const optimizedSlots = yield this.multiObjectiveOptimization(bracketSlots, {
                maxIterations: this.opts.maxSwapIterations,
                timeout: this.opts.optimizationTimeout,
                rng
            });
            // Build match plans
            this.emitProgress('knockout', 85, 'Building match structure...');
            const planMatches = this.buildKnockoutMatchPlans(optimizedSlots, totalRounds);
            // Propagate BYE winners
            this.propagateByeWinners(planMatches);
            // Prepare database payloads
            const createPayloads = planMatches.map((pm, idx) => {
                var _a, _b, _c;
                return ({
                    eventId,
                    round: pm.round,
                    matchNumber: pm.matchNumber,
                    playerAId: (_a = pm.playerAId) !== null && _a !== void 0 ? _a : null,
                    playerBId: (_b = pm.playerBId) !== null && _b !== void 0 ? _b : null,
                    status: pm.status,
                    winnerId: (_c = pm.winnerId) !== null && _c !== void 0 ? _c : null,
                    __tempIndex: idx,
                    __nextTempIndex: pm.nextMatchIdx
                });
            });
            const metrics = {
                totalPlayers,
                bracketSize,
                byes,
                rounds: totalRounds,
                sameClubCollisions: this.countRoundOneSameClubCollisions(optimizedSlots),
                fairnessScore: 0,
                constraintViolations: [],
                optimizationIterations: this.performanceMetrics.operationCount
            };
            const preview = {
                format: 'knockout',
                matches: createPayloads.map(p => (Object.assign(Object.assign({}, p), { previewId: `ko-${p.__tempIndex}` }))),
                metrics,
                previewOnly: this.opts.dryRun
            };
            preview.fairnessScore = this.calculateFairnessScore(preview);
            if (this.opts.dryRun)
                return preview;
            // Commit to database
            this.emitProgress('knockout', 95, 'Committing to database...');
            const createdMatches = yield this.commitMatchesToDatabase(createPayloads, eventId);
            return Object.assign(Object.assign({}, preview), { previewOnly: false, matches: createdMatches.map(m => (Object.assign(Object.assign({}, m), { previewId: m.id }))) });
        });
    }
    // ============================================================================
    // PRIVATE WORKFLOW METHODS - ROUND ROBIN
    // ============================================================================
    _generateRoundRobinWorkflow(eventId, players) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const rng = this.rng((_a = this.opts.randomSeed) !== null && _a !== void 0 ? _a : undefined);
            this.emitProgress('roundrobin', 50, 'Spreading players by club...');
            const spread = this.spreadPlayersByClub(players, { rng });
            this.emitProgress('roundrobin', 70, 'Building round-robin schedule...');
            const { matchesPlan, metrics } = this.buildRoundRobinPlan(spread);
            const prismaMatches = matchesPlan.map((m, idx) => ({
                eventId,
                round: m.round,
                matchNumber: m.matchNumber,
                playerAId: m.playerAId,
                playerBId: m.playerBId,
                status: client_1.MatchStatus.PENDING,
                previewId: `rr-${m.round}-${m.matchNumber}-${idx}`
            }));
            const fixtureMetrics = {
                totalPlayers: players.length,
                sameClubCollisions: metrics.sameClubCollisions,
                rounds: Math.max(...matchesPlan.map(m => m.round)),
                fairnessScore: 0,
                constraintViolations: []
            };
            const preview = {
                format: 'roundrobin',
                matches: prismaMatches.map(m => (Object.assign(Object.assign({}, m), { previewId: m.previewId }))),
                metrics: fixtureMetrics,
                previewOnly: this.opts.dryRun
            };
            preview.fairnessScore = this.calculateFairnessScore(preview);
            if (this.opts.dryRun)
                return preview;
            this.emitProgress('roundrobin', 90, 'Committing matches...');
            const createdMatches = yield db_1.prisma.$transaction(prismaMatches.map(m => db_1.prisma.match.create({
                data: {
                    eventId: m.eventId,
                    round: m.round,
                    matchNumber: m.matchNumber,
                    playerAId: m.playerAId,
                    playerBId: m.playerBId,
                    status: m.status
                }
            })));
            return Object.assign(Object.assign({}, preview), { previewOnly: false, matches: createdMatches.map(m => (Object.assign(Object.assign({}, m), { previewId: m.id, score: m.score, metadata: m.metadata }))) });
        });
    }
    // ============================================================================
    // PRIVATE WORKFLOW METHODS - SWISS SYSTEM
    // ============================================================================
    _generateSwissWorkflow(eventId, players) {
        return __awaiter(this, void 0, void 0, function* () {
            const rounds = this.opts.swissRounds || this.calculateOptimalSwissRounds(players.length);
            this.emitProgress('swiss', 50, `Generating ${rounds} Swiss rounds...`);
            // Initialize player records
            const playerRecords = new Map();
            players.forEach(p => {
                playerRecords.set(p.id, {
                    playerId: p.id,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    opponentIds: []
                });
            });
            const allMatches = [];
            // Generate each round based on standings
            for (let round = 1; round <= rounds; round++) {
                this.emitProgress('swiss', 50 + (round / rounds) * 40, `Pairing round ${round}...`);
                const roundPairings = this.generateSwissPairings(players, playerRecords, round);
                allMatches.push(...roundPairings);
            }
            const prismaMatches = allMatches.map((m, idx) => ({
                eventId,
                round: m.round,
                matchNumber: m.matchNumber,
                playerAId: m.playerAId,
                playerBId: m.playerBId,
                status: client_1.MatchStatus.PENDING,
                previewId: `swiss-${m.round}-${m.matchNumber}-${idx}`
            }));
            const metrics = {
                totalPlayers: players.length,
                rounds,
                sameClubCollisions: this.countSameClubMatches(allMatches, players),
                fairnessScore: 0,
                constraintViolations: []
            };
            const preview = {
                format: 'swiss',
                matches: prismaMatches,
                metrics,
                previewOnly: this.opts.dryRun
            };
            preview.fairnessScore = this.calculateFairnessScore(preview);
            if (this.opts.dryRun)
                return preview;
            const createdMatches = yield this.commitMatchesToDatabase(prismaMatches, eventId);
            return Object.assign(Object.assign({}, preview), { previewOnly: false, matches: createdMatches.map(m => (Object.assign(Object.assign({}, m), { previewId: m.id }))) });
        });
    }
    // ============================================================================
    // PRIVATE WORKFLOW METHODS - DOUBLE ELIMINATION
    // ============================================================================
    _generateDoubleEliminationWorkflow(eventId, players) {
        return __awaiter(this, void 0, void 0, function* () {
            this.emitProgress('double_elimination', 50, 'Building double elimination brackets...');
            const totalPlayers = players.length;
            const bracketSize = Math.pow(2, Math.ceil(Math.log2(totalPlayers)));
            // Generate winners bracket (same as single elimination)
            const winnersPreview = yield this._generateKnockoutWorkflow(eventId, players);
            // Calculate losers bracket structure
            const losersBracketRounds = Math.log2(bracketSize) * 2 - 1;
            const losersBracket = [];
            // Build losers bracket matches
            // (Complex logic: alternate between matches from winners bracket losers and losers bracket progression)
            for (let round = 1; round <= losersBracketRounds; round++) {
                const matchesInRound = Math.pow(2, Math.floor(losersBracketRounds - round));
                for (let m = 0; m < matchesInRound; m++) {
                    losersBracket.push({
                        round,
                        matchNumber: m + 1,
                        playerAId: null,
                        playerBId: null,
                        isLosersBracket: true
                    });
                }
            }
            // Grand final (winner of winners bracket vs winner of losers bracket)
            const grandFinal = {
                round: Math.ceil(Math.log2(bracketSize)) + losersBracketRounds + 1,
                matchNumber: 1,
                playerAId: null,
                playerBId: null
            };
            const allMatches = [
                ...winnersPreview.matches,
                ...losersBracket.map(m => (Object.assign(Object.assign({ eventId }, m), { status: client_1.MatchStatus.PENDING, previewId: `de-losers-${m.round}-${m.matchNumber}` }))),
                Object.assign(Object.assign({ eventId }, grandFinal), { status: client_1.MatchStatus.PENDING, previewId: 'de-grand-final' })
            ];
            const metrics = Object.assign(Object.assign({}, winnersPreview.metrics), { rounds: grandFinal.round, fairnessScore: 0, constraintViolations: [] });
            const preview = {
                format: 'double_elimination',
                matches: allMatches,
                metrics,
                previewOnly: this.opts.dryRun
            };
            preview.fairnessScore = this.calculateFairnessScore(preview);
            if (this.opts.dryRun)
                return preview;
            const createdMatches = yield this.commitMatchesToDatabase(allMatches, eventId);
            return Object.assign(Object.assign({}, preview), { previewOnly: false, matches: createdMatches.map(m => (Object.assign(Object.assign({}, m), { previewId: m.id }))) });
        });
    }
    // ============================================================================
    // PRIVATE WORKFLOW METHODS - GROUPS THEN PLAYOFF
    // ============================================================================
    _generateGroupsThenPlayoff(eventId, players) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const groups = this.opts.groups > 1
                ? this.opts.groups
                : Math.max(2, Math.floor(players.length / 4));
            const rng = this.rng((_a = this.opts.randomSeed) !== null && _a !== void 0 ? _a : undefined);
            this.emitProgress('groups', 50, `Assigning players to ${groups} groups...`);
            const distributed = this.assignToGroups(players, groups, { rng });
            const groupPlans = {};
            let totalSameClubCollisions = 0;
            // Generate round robin for each group
            for (let g = 0; g < groups; g++) {
                this.emitProgress('groups', 50 + (g / groups) * 30, `Generating group ${g + 1} fixtures...`);
                const grpPlayers = distributed[g];
                const { matchesPlan, metrics } = this.buildRoundRobinPlan(grpPlayers);
                groupPlans[`G${g + 1}`] = matchesPlan.map(m => (Object.assign(Object.assign({}, m), { playerAId: m.playerAId, playerBId: m.playerBId })));
                totalSameClubCollisions += metrics.sameClubCollisions;
            }
            const allMatches = Object.entries(groupPlans).flatMap(([gid, matches]) => matches.map((m, idx) => ({
                eventId,
                round: m.round,
                matchNumber: idx + 1,
                playerAId: m.playerAId,
                playerBId: m.playerBId,
                status: client_1.MatchStatus.PENDING,
                previewId: `${gid}-${m.round}-${m.matchNumber}`,
                metadata: { groupId: gid }
            })));
            const fixtureMetrics = {
                totalPlayers: players.length,
                groups,
                sameClubCollisions: totalSameClubCollisions,
                rounds: Math.max(...Object.values(groupPlans).flat().map(m => m.round)),
                fairnessScore: 0,
                constraintViolations: []
            };
            const preview = {
                format: 'groups_then_playoff',
                matches: allMatches,
                metrics: fixtureMetrics,
                previewOnly: this.opts.dryRun
            };
            preview.fairnessScore = this.calculateFairnessScore(preview);
            if (this.opts.dryRun)
                return preview;
            this.emitProgress('groups', 90, 'Committing group matches...');
            const createdMatches = yield this.commitMatchesToDatabase(allMatches, eventId);
            return Object.assign(Object.assign({}, preview), { previewOnly: false, matches: createdMatches.map(m => (Object.assign(Object.assign({}, m), { previewId: m.id }))) });
        });
    }
    // ============================================================================
    // ADVANCED SEEDING METHODS
    // ============================================================================
    /**
     * Apply advanced seeding strategies based on configuration
     */
    applyAdvancedSeeding(players, rng) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.opts.seedingStrategy) {
                case 'elo_rating':
                    return this.seedByEloRating(players);
                case 'historical_performance':
                    return yield this.seedByHistoricalPerformance(players);
                case 'random':
                    return this.seedRandomly(players, rng);
                case 'manual':
                    return this.sortAndMaybeRandomizeSeeds(players, { rng });
                case 'registration_order':
                default:
                    return this.sortAndMaybeRandomizeSeeds(players, { rng });
            }
        });
    }
    /**
     * Seed players by ELO rating
     */
    seedByEloRating(players) {
        const withElo = players.filter(p => p.elo !== null && p.elo !== undefined);
        const withoutElo = players.filter(p => !p.elo);
        // Sort by ELO descending (higher ELO = better seed)
        withElo.sort((a, b) => (b.elo || 0) - (a.elo || 0));
        // Assign seeds to ELO-rated players
        withElo.forEach((p, idx) => {
            p.seed = idx + 1;
        });
        // Append unrated players
        return [...withElo, ...withoutElo];
    }
    /**
     * Seed players based on historical win rate
     */
    seedByHistoricalPerformance(players) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch historical match data for each player
            const playerStats = yield Promise.all(players.map((p) => __awaiter(this, void 0, void 0, function* () {
                const matches = yield db_1.prisma.match.findMany({
                    where: {
                        OR: [
                            { playerAId: p.id, status: client_1.MatchStatus.COMPLETED },
                            { playerBId: p.id, status: client_1.MatchStatus.COMPLETED }
                        ]
                    },
                    select: {
                        playerAId: true,
                        playerBId: true,
                        winnerId: true
                    }
                });
                const wins = matches.filter(m => m.winnerId === p.id).length;
                const total = matches.length;
                const winRate = total > 0 ? wins / total : 0;
                return Object.assign(Object.assign({}, p), { historicalWinRate: winRate, matchesPlayed: total });
            })));
            // Sort by win rate (with minimum matches threshold)
            const MIN_MATCHES = 5;
            const withHistory = playerStats.filter(p => p.matchesPlayed >= MIN_MATCHES);
            const withoutHistory = playerStats.filter(p => p.matchesPlayed < MIN_MATCHES);
            withHistory.sort((a, b) => (b.historicalWinRate || 0) - (a.historicalWinRate || 0));
            withHistory.forEach((p, idx) => {
                p.seed = idx + 1;
            });
            return [...withHistory, ...withoutHistory];
        });
    }
    /**
     * Completely random seeding
     */
    seedRandomly(players, rng) {
        const shuffled = [...players];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        shuffled.forEach((p, idx) => {
            p.seed = idx + 1;
        });
        return shuffled;
    }
    // ============================================================================
    // MULTI-OBJECTIVE OPTIMIZATION
    // ============================================================================
    /**
     * Advanced multi-objective optimization using simulated annealing
     */
    multiObjectiveOptimization(slots, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const current = slots.slice();
            let bestSolution = current.slice();
            let bestScore = this.evaluateMultiObjectiveScore(current);
            let temperature = 1.0;
            const coolingRate = 0.995;
            const minTemperature = 0.001;
            let iterations = 0;
            while (iterations < options.maxIterations &&
                Date.now() - startTime < options.timeout &&
                temperature > minTemperature) {
                iterations++;
                this.performanceMetrics.operationCount = iterations;
                // Generate neighbor solution by swapping two players
                const neighbor = this.generateNeighborSolution(current, options.rng);
                const neighborScore = this.evaluateMultiObjectiveScore(neighbor);
                // Accept neighbor if better, or with probability based on temperature
                const delta = neighborScore - bestScore;
                const acceptanceProbability = delta > 0 ? 1 : Math.exp(delta / temperature);
                if (options.rng() < acceptanceProbability) {
                    current.splice(0, current.length, ...neighbor);
                    if (neighborScore > bestScore) {
                        bestSolution = neighbor.slice();
                        bestScore = neighborScore;
                    }
                }
                temperature *= coolingRate;
                // Early termination if perfect score
                if (bestScore >= 99.9)
                    break;
            }
            return bestSolution;
        });
    }
    /**
     * Evaluate multiple objectives and return weighted score
     */
    evaluateMultiObjectiveScore(slots) {
        const weights = this.opts.constraintWeights;
        let totalScore = 0;
        // Objective 1: Minimize same-club matchups in round 1
        const clubScore = this.evaluateSameClubObjective(slots);
        totalScore += clubScore * weights.sameClubAvoidance * 40;
        // Objective 2: Balance bracket (minimize consecutive byes)
        const balanceScore = this.evaluateBracketBalance(slots);
        totalScore += balanceScore * weights.balancedBrackets * 30;
        // Objective 3: Geographic distribution (if region data available)
        const geoScore = this.evaluateGeographicDistribution(slots);
        totalScore += geoScore * weights.geographicDistribution * 20;
        // Objective 4: Historical performance balance
        const perfScore = this.evaluatePerformanceDistribution(slots);
        totalScore += perfScore * weights.historicalPerformance * 10;
        return totalScore;
    }
    evaluateSameClubObjective(slots) {
        const collisions = this.countRoundOneSameClubCollisions(slots);
        const maxPossibleCollisions = slots.length / 2;
        return (1 - collisions / maxPossibleCollisions) * 100;
    }
    evaluateBracketBalance(slots) {
        // Check for clusters of BYEs
        let maxConsecutiveByes = 0;
        let currentByes = 0;
        for (const slot of slots) {
            if (slot === null) {
                currentByes++;
                maxConsecutiveByes = Math.max(maxConsecutiveByes, currentByes);
            }
            else {
                currentByes = 0;
            }
        }
        // Lower consecutive BYEs = better balance
        const penalty = Math.min(maxConsecutiveByes / slots.length, 1);
        return (1 - penalty) * 100;
    }
    evaluateGeographicDistribution(slots) {
        // If no region data, return neutral score
        const withRegions = slots.filter(s => s && s.region);
        if (withRegions.length === 0)
            return 50;
        // Count same-region matchups in round 1
        let sameRegionCount = 0;
        for (let i = 0; i < slots.length; i += 2) {
            const a = slots[i];
            const b = slots[i + 1];
            if (a && b && a.region && b.region && a.region === b.region) {
                sameRegionCount++;
            }
        }
        const maxPossible = slots.length / 2;
        return (1 - sameRegionCount / maxPossible) * 100;
    }
    evaluatePerformanceDistribution(slots) {
        // Check if high-seed players are well-distributed
        const withSeeds = slots.filter(s => s && s.seed !== null);
        if (withSeeds.length === 0)
            return 50;
        // Top seeds should be in different quarters of the bracket
        const quarters = 4;
        const quarterSize = slots.length / quarters;
        const topSeedCount = Math.min(quarters, withSeeds.length);
        const quarterDistribution = new Array(quarters).fill(0);
        for (let i = 0; i < slots.length && i < topSeedCount; i++) {
            const slot = slots[i];
            if (slot && slot.seed && slot.seed <= topSeedCount) {
                const quarter = Math.floor(i / quarterSize);
                quarterDistribution[quarter]++;
            }
        }
        // Ideal: one top seed per quarter
        const idealPerQuarter = topSeedCount / quarters;
        const variance = quarterDistribution.reduce((sum, count) => sum + Math.pow(count - idealPerQuarter, 2), 0) / quarters;
        return Math.max(0, 100 - variance * 20);
    }
    /**
     * Generate neighbor solution by swapping two players
     */
    generateNeighborSolution(current, rng) {
        const neighbor = current.slice();
        // Select two random non-null positions
        const nonNullIndices = neighbor
            .map((slot, idx) => slot !== null ? idx : -1)
            .filter(idx => idx !== -1);
        if (nonNullIndices.length < 2)
            return neighbor;
        const idx1 = nonNullIndices[Math.floor(rng() * nonNullIndices.length)];
        const idx2 = nonNullIndices[Math.floor(rng() * nonNullIndices.length)];
        if (idx1 !== idx2) {
            [neighbor[idx1], neighbor[idx2]] = [neighbor[idx2], neighbor[idx1]];
        }
        return neighbor;
    }
    // ============================================================================
    // SWISS SYSTEM SPECIFIC METHODS
    // ============================================================================
    /**
     * Calculate optimal number of Swiss rounds
     */
    calculateOptimalSwissRounds(playerCount) {
        // Formula: log2(n) rounds typically sufficient
        return Math.ceil(Math.log2(playerCount));
    }
    /**
     * Generate Swiss pairings for a round
     */
    generateSwissPairings(players, records, round) {
        // Group players by score
        const scoreGroups = new Map();
        players.forEach(p => {
            const record = records.get(p.id);
            const score = record.wins * 3 + record.draws;
            if (!scoreGroups.has(score)) {
                scoreGroups.set(score, []);
            }
            scoreGroups.get(score).push(p);
        });
        // Sort score groups descending
        const sortedScores = Array.from(scoreGroups.keys()).sort((a, b) => b - a);
        const pairings = [];
        let matchNumber = 1;
        const paired = new Set();
        // Pair within each score group
        for (const score of sortedScores) {
            const group = scoreGroups.get(score).filter(p => !paired.has(p.id));
            // Try to pair players who haven't played each other
            while (group.length >= 2) {
                const player1 = group.shift();
                const record1 = records.get(player1.id);
                // Find best opponent (not played before, different club if possible)
                let bestOpponentIdx = -1;
                let bestScore = -1;
                for (let i = 0; i < group.length; i++) {
                    const player2 = group[i];
                    const record2 = records.get(player2.id);
                    // Skip if already played
                    if (record1.opponentIds.includes(player2.id))
                        continue;
                    let pairingScore = 10;
                    // Prefer different clubs
                    if (player1.clubId && player2.clubId && player1.clubId !== player2.clubId) {
                        pairingScore += 5;
                    }
                    if (pairingScore > bestScore) {
                        bestScore = pairingScore;
                        bestOpponentIdx = i;
                    }
                }
                if (bestOpponentIdx !== -1) {
                    const player2 = group.splice(bestOpponentIdx, 1)[0];
                    pairings.push({
                        round,
                        matchNumber: matchNumber++,
                        playerAId: player1.id,
                        playerBId: player2.id
                    });
                    paired.add(player1.id);
                    paired.add(player2.id);
                    // Update opponent lists
                    record1.opponentIds.push(player2.id);
                    records.get(player2.id).opponentIds.push(player1.id);
                }
                else {
                    // Can't find suitable opponent, carry to next group
                    break;
                }
            }
        }
        // Handle any remaining unpaired player (gets BYE)
        const unpaired = players.filter(p => !paired.has(p.id));
        if (unpaired.length === 1) {
            const byePlayer = unpaired[0];
            records.get(byePlayer.id).wins++; // Award win for BYE
        }
        return pairings;
    }
    // ============================================================================
    // CONSTRAINT VALIDATION
    // ============================================================================
    /**
     * Validate all constraints before fixture generation
     */
    validateConstraints(eventId, players, format) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            const warnings = [];
            // Constraint 1: Minimum player count
            if (players.length < 2) {
                errors.push({
                    code: 'INSUFFICIENT_PLAYERS',
                    message: `Minimum 2 players required, found ${players.length}`,
                    severity: 'high',
                    affectedEntities: [eventId]
                });
            }
            // Constraint 2: Power of 2 for knockout (warning only)
            if (format === 'knockout') {
                const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
                if (!isPowerOfTwo(players.length)) {
                    warnings.push({
                        code: 'NON_POWER_OF_TWO',
                        message: `Player count (${players.length}) is not a power of 2. BYEs will be added.`,
                        severity: 'low',
                        affectedEntities: [eventId]
                    });
                }
            }
            // Constraint 3: Club distribution analysis
            const clubCounts = new Map();
            players.forEach(p => {
                if (p.clubId) {
                    clubCounts.set(p.clubId, (clubCounts.get(p.clubId) || 0) + 1);
                }
            });
            const maxClubSize = Math.max(...Array.from(clubCounts.values()));
            if (maxClubSize > players.length / 2) {
                warnings.push({
                    code: 'CLUB_CONCENTRATION',
                    message: `One club has ${maxClubSize} players (>${players.length / 2}). Same-club matches unavoidable.`,
                    severity: 'medium',
                    affectedEntities: Array.from(clubCounts.entries())
                        .filter(([_, count]) => count === maxClubSize)
                        .map(([id, _]) => id)
                });
            }
            // Constraint 4: Seeding consistency
            const seededPlayers = players.filter(p => p.seed !== null);
            const seeds = seededPlayers.map(p => p.seed);
            const uniqueSeeds = new Set(seeds);
            if (seeds.length !== uniqueSeeds.size) {
                warnings.push({
                    code: 'DUPLICATE_SEEDS',
                    message: 'Duplicate seed values detected. Seeding may be inconsistent.',
                    severity: 'medium',
                    affectedEntities: seededPlayers.map(p => p.id)
                });
            }
            // Constraint 5: Format-specific validations
            if (format === 'swiss' && this.opts.swissRounds === 0) {
                warnings.push({
                    code: 'SWISS_ROUNDS_AUTO',
                    message: `Swiss rounds not specified. Auto-calculated: ${this.calculateOptimalSwissRounds(players.length)} rounds.`,
                    severity: 'low',
                    affectedEntities: [eventId]
                });
            }
            if (format === 'groups_then_playoff' && this.opts.groups === 0) {
                const autoGroups = Math.max(2, Math.floor(players.length / 4));
                warnings.push({
                    code: 'GROUPS_AUTO',
                    message: `Group count not specified. Auto-calculated: ${autoGroups} groups.`,
                    severity: 'low',
                    affectedEntities: [eventId]
                });
            }
            return {
                hasErrors: errors.length > 0,
                hasWarnings: warnings.length > 0,
                errors,
                warnings
            };
        });
    }
    // ============================================================================
    // DATABASE OPERATIONS
    // ============================================================================
    /**
     * Validate event and fetch all required data
     */
    validateAndFetchEventData(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield db_1.prisma.event.findUnique({
                where: { id: eventId },
                select: {
                    id: true,
                    type: true,
                    _count: { select: { matches: true } }
                }
            });
            if (!event) {
                throw new Error('Event not found');
            }
            // Check for active matches
            const matchCount = yield db_1.prisma.match.count({ where: { eventId } });
            if (matchCount > 0) {
                const active = yield db_1.prisma.match.findFirst({
                    where: {
                        eventId,
                        status: { in: [client_1.MatchStatus.SCHEDULED, client_1.MatchStatus.ONGOING] }
                    }
                });
                if (active && !this.opts.allowPartialRegeneration) {
                    throw new Error('Cannot regenerate fixtures: active matches exist for this event');
                }
            }
            // Fetch registrations with player data
            const registrations = yield db_1.prisma.registration.findMany({
                where: { eventId },
                include: {
                    player: {
                        select: {
                            id: true,
                            clubId: true,
                            // Assuming these fields exist in your schema
                            // elo: true,
                            // region: true
                        }
                    }
                },
                orderBy: { seed: 'asc' }
            });
            if (registrations.length < 2) {
                throw new Error('Not enough registrations to generate fixtures (minimum 2)');
            }
            const players = registrations.map((r, idx) => {
                var _a;
                return ({
                    id: r.player.id,
                    clubId: (_a = r.player.clubId) !== null && _a !== void 0 ? _a : null,
                    seed: typeof r.seed === 'number' ? r.seed : null,
                    originalIndex: idx,
                    // elo: r.player.elo ?? null,
                    // region: r.player.region ?? null
                });
            });
            return { event, players };
        });
    }
    /**
     * Commit matches to database with proper linking
     */
    commitMatchesToDatabase(payloads, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdMatches = [];
            yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // Create all matches first
                for (const payload of payloads) {
                    const created = yield tx.match.create({
                        data: {
                            eventId: payload.eventId || eventId,
                            round: payload.round,
                            matchNumber: payload.matchNumber,
                            playerAId: payload.playerAId,
                            playerBId: payload.playerBId,
                            status: payload.status || client_1.MatchStatus.PENDING,
                            winnerId: (_a = payload.winnerId) !== null && _a !== void 0 ? _a : undefined
                        }
                    });
                    createdMatches[payload.__tempIndex || createdMatches.length] = created;
                }
                // Update nextMatchId links
                for (const payload of payloads) {
                    if (payload.__nextTempIndex !== null && payload.__nextTempIndex !== undefined) {
                        const child = createdMatches[payload.__tempIndex];
                        const parent = createdMatches[payload.__nextTempIndex];
                        if (child && parent) {
                            yield tx.match.update({
                                where: { id: child.id },
                                data: { nextMatchId: parent.id }
                            });
                        }
                    }
                }
            }), {
                timeout: 30000, // 30 second timeout for large tournaments
                maxWait: 5000
            });
            return createdMatches;
        });
    }
    /**
     * Create rollback snapshot
     */
    createRollbackSnapshot(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingMatches = yield db_1.prisma.match.findMany({
                where: { eventId }
            });
            if (existingMatches.length > 0) {
                const snapshot = {
                    id: `snapshot-${eventId}-${Date.now()}`,
                    eventId,
                    timestamp: new Date(),
                    format: 'knockout', // This should be fetched from event metadata
                    matches: existingMatches,
                    metadata: {}
                };
                this.rollbackSnapshots.set(snapshot.id, snapshot);
            }
        });
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    /**
     * Build knockout match structure with linking
     */
    buildKnockoutMatchPlans(slots, totalRounds) {
        const planMatches = [];
        // Create all match placeholders
        for (let round = 1; round <= totalRounds; round++) {
            const matchesInRound = Math.pow(2, totalRounds - round);
            for (let m = 0; m < matchesInRound; m++) {
                planMatches.push({
                    round,
                    matchNumber: m + 1,
                    playerAId: null,
                    playerBId: null,
                    status: client_1.MatchStatus.PENDING,
                    winnerId: null,
                    nextMatchIdx: null
                });
            }
        }
        // Fill round 1 with players from slots
        const round1Count = Math.pow(2, totalRounds - 1);
        for (let m = 0; m < round1Count; m++) {
            const slotA = slots[m * 2];
            const slotB = slots[m * 2 + 1];
            const targetIdx = planMatches.findIndex(pm => pm.round === 1 && pm.matchNumber === m + 1);
            planMatches[targetIdx].playerAId = slotA ? slotA.id : null;
            planMatches[targetIdx].playerBId = slotB ? slotB.id : null;
            // Handle BYE scenarios
            if ((slotA && !slotB) || (!slotA && slotB)) {
                planMatches[targetIdx].status = client_1.MatchStatus.COMPLETED;
                planMatches[targetIdx].winnerId = slotA ? slotA.id : slotB ? slotB.id : null;
            }
            else if (!slotA && !slotB) {
                planMatches[targetIdx].status = client_1.MatchStatus.CANCELLED;
            }
        }
        // Link matches to next round
        const indexMap = new Map();
        planMatches.forEach((pm, idx) => {
            indexMap.set(`${pm.round}:${pm.matchNumber}`, idx);
        });
        for (let round = 1; round < totalRounds; round++) {
            const matchesInRound = Math.pow(2, totalRounds - round);
            for (let m = 0; m < matchesInRound; m++) {
                const currentIdx = indexMap.get(`${round}:${m + 1}`);
                const parentMatchNum = Math.floor(m / 2) + 1;
                const parentIdx = indexMap.get(`${round + 1}:${parentMatchNum}`);
                planMatches[currentIdx].nextMatchIdx = parentIdx;
            }
        }
        return planMatches;
    }
    /**
     * Propagate BYE winners through bracket
     */
    propagateByeWinners(planMatches) {
        for (let i = 0; i < planMatches.length; i++) {
            const pm = planMatches[i];
            if (pm.winnerId && pm.nextMatchIdx !== null) {
                const next = planMatches[pm.nextMatchIdx];
                const isTopFeeder = (pm.matchNumber % 2) === 1;
                if (isTopFeeder) {
                    next.playerAId = pm.winnerId;
                }
                else {
                    next.playerBId = pm.winnerId;
                }
                // Reset next match if both players filled
                if (next.playerAId && next.playerBId && next.status === client_1.MatchStatus.COMPLETED) {
                    next.status = client_1.MatchStatus.PENDING;
                    next.winnerId = null;
                }
            }
        }
    }
    /**
     * Round robin plan builder (Berger algorithm)
     */
    buildRoundRobinPlan(players) {
        let list = players.map(p => (Object.assign({}, p)));
        const isOdd = list.length % 2 !== 0;
        if (isOdd) {
            list.push({ id: 'BYE', clubId: null, seed: null });
        }
        const n = list.length;
        const rounds = n - 1;
        const half = n / 2;
        let rotation = [...list];
        const matchesPlan = [];
        let sameClubCollisions = 0;
        for (let r = 0; r < rounds; r++) {
            for (let i = 0; i < half; i++) {
                const p1 = rotation[i];
                const p2 = rotation[n - 1 - i];
                if (!p1 || !p2 || p1.id === 'BYE' || p2.id === 'BYE')
                    continue;
                matchesPlan.push({
                    round: r + 1,
                    matchNumber: matchesPlan.filter(m => m.round === r + 1).length + 1,
                    playerAId: p1.id,
                    playerBId: p2.id
                });
                if (p1.clubId && p2.clubId && p1.clubId === p2.clubId) {
                    sameClubCollisions++;
                }
            }
            // Rotate (keep first fixed)
            const fixed = rotation[0];
            const rotating = rotation.slice(1);
            rotating.unshift(rotating.pop());
            rotation = [fixed, ...rotating];
        }
        return { matchesPlan, metrics: { sameClubCollisions } };
    }
    /**
     * Spread players by club for round robin
     */
    spreadPlayersByClub(players, opts) {
        return this.distributeAcrossBuckets(players, Math.max(4, Math.ceil(players.length / 2)));
    }
    /**
     * Distribute players across buckets to minimize club clustering
     */
    distributeAcrossBuckets(players, bracketSize) {
        const numBuckets = Math.max(4, Math.ceil(bracketSize / 4));
        const buckets = Array.from({ length: numBuckets }, () => []);
        // Group by club
        const clubMap = new Map();
        players.forEach(p => {
            const key = p.clubId || 'UNATTACHED';
            if (!clubMap.has(key))
                clubMap.set(key, []);
            clubMap.get(key).push(p);
        });
        // Sort clubs by size (largest first)
        const clubs = Array.from(clubMap.entries()).sort((a, b) => b[1].length - a[1].length);
        // Round-robin distribution
        let bucketIdx = 0;
        for (const [_, members] of clubs) {
            for (const member of members) {
                buckets[bucketIdx % numBuckets].push(member);
                bucketIdx++;
            }
        }
        // Flatten buckets
        const distributed = [];
        let hasProgress = true;
        while (hasProgress) {
            hasProgress = false;
            for (const bucket of buckets) {
                if (bucket.length > 0) {
                    distributed.push(bucket.shift());
                    hasProgress = true;
                }
            }
        }
        return distributed.slice(0, players.length);
    }
    /**
     * Advanced distribution with optimization
     */
    distributeWithAdvancedOptimization(players, bracketSize) {
        return __awaiter(this, void 0, void 0, function* () {
            // Start with basic distribution
            let distributed = this.distributeAcrossBuckets(players, bracketSize);
            // Apply additional optimization passes
            distributed = this.optimizeForGeographicBalance(distributed);
            distributed = this.optimizeForPerformanceBalance(distributed);
            return distributed;
        });
    }
    /**
     * Optimize distribution for geographic balance
     */
    optimizeForGeographicBalance(players) {
        // If no region data, return as-is
        const withRegions = players.filter(p => p.region);
        if (withRegions.length === 0)
            return players;
        // Group by region
        const regionMap = new Map();
        players.forEach(p => {
            const region = p.region || 'UNKNOWN';
            if (!regionMap.has(region))
                regionMap.set(region, []);
            regionMap.get(region).push(p);
        });
        // Redistribute to spread regions
        const buckets = [[], [], [], []];
        let bucketIdx = 0;
        Array.from(regionMap.values()).forEach(regionPlayers => {
            regionPlayers.forEach(p => {
                buckets[bucketIdx % 4].push(p);
                bucketIdx++;
            });
        });
        // Flatten
        const result = [];
        let hasMore = true;
        while (hasMore) {
            hasMore = false;
            for (const bucket of buckets) {
                if (bucket.length > 0) {
                    result.push(bucket.shift());
                    hasMore = true;
                }
            }
        }
        return result;
    }
    /**
     * Optimize for performance/seed balance
     */
    optimizeForPerformanceBalance(players) {
        // Ensure top seeds are distributed across bracket quarters
        const topSeedCount = Math.min(4, players.filter(p => p.seed).length);
        if (topSeedCount === 0)
            return players;
        const result = [...players];
        const quarterSize = Math.ceil(result.length / 4);
        // Move top 4 seeds to different quarters
        const topSeeds = result
            .filter(p => p.seed && p.seed <= topSeedCount)
            .sort((a, b) => (a.seed || 0) - (b.seed || 0));
        topSeeds.forEach((seed, idx) => {
            const targetQuarter = idx;
            const targetPosition = targetQuarter * quarterSize;
            const currentPosition = result.indexOf(seed);
            if (currentPosition !== targetPosition) {
                result.splice(currentPosition, 1);
                result.splice(targetPosition, 0, seed);
            }
        });
        return result;
    }
    /**
     * Assign players to groups with club spreading
     */
    assignToGroups(players, groups, opts) {
        const buckets = Array.from({ length: groups }, () => []);
        // Group by club
        const clubMap = new Map();
        players.forEach(p => {
            const key = p.clubId || 'UNATTACHED';
            if (!clubMap.has(key))
                clubMap.set(key, []);
            clubMap.get(key).push(p);
        });
        // Sort clubs by size
        const clubsSorted = Array.from(clubMap.values()).sort((a, b) => b.length - a.length);
        // Round-robin assignment
        let groupIdx = 0;
        for (const clubPlayers of clubsSorted) {
            for (const player of clubPlayers) {
                buckets[groupIdx % groups].push(player);
                groupIdx++;
            }
        }
        return buckets;
    }
    /**
     * Sort players and optionally randomize unseeded
     */
    sortAndMaybeRandomizeSeeds(players, opts) {
        const seeded = players.filter(p => p.seed !== null).sort((a, b) => a.seed - b.seed);
        let unseeded = players.filter(p => p.seed === null);
        if (this.opts.randomizeUnseeded) {
            // Fisher-Yates shuffle
            for (let i = unseeded.length - 1; i > 0; i--) {
                const j = Math.floor(opts.rng() * (i + 1));
                [unseeded[i], unseeded[j]] = [unseeded[j], unseeded[i]];
            }
        }
        else {
            unseeded.sort((a, b) => (a.originalIndex || 0) - (b.originalIndex || 0));
        }
        return [...seeded, ...unseeded];
    }
    /**
     * Get standard seeding order for bracket
     */
    getSeedingOrder(size) {
        if (size === 1)
            return [1];
        if (size === 2)
            return [1, 2];
        const half = size / 2;
        const prev = this.getSeedingOrder(half);
        const result = [];
        for (const s of prev) {
            result.push(s);
            result.push(size + 1 - s);
        }
        return result;
    }
    /**
     * Count same-club collisions in round 1
     */
    countRoundOneSameClubCollisions(slots) {
        let collisions = 0;
        for (let i = 0; i < slots.length; i += 2) {
            const a = slots[i];
            const b = slots[i + 1];
            if (a && b && a.clubId && b.clubId && a.clubId === b.clubId) {
                collisions++;
            }
        }
        return collisions;
    }
    /**
     * Count same-club matches across all rounds
     */
    countSameClubMatches(matches, players) {
        const playerMap = new Map(players.map(p => [p.id, p]));
        let count = 0;
        for (const match of matches) {
            if (!match.playerAId || !match.playerBId)
                continue;
            const pA = playerMap.get(match.playerAId);
            const pB = playerMap.get(match.playerBId);
            if (pA && pB && pA.clubId && pB.clubId && pA.clubId === pB.clubId) {
                count++;
            }
        }
        return count;
    }
    /**
     * Calculate distribution score
     */
    calculateDistributionScore(preview) {
        // Analyze how evenly distributed matches are across rounds
        const roundCounts = new Map();
        preview.matches.forEach(m => {
            const round = m.round || 1;
            roundCounts.set(round, (roundCounts.get(round) || 0) + 1);
        });
        if (roundCounts.size === 0)
            return 0;
        const counts = Array.from(roundCounts.values());
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
        // Lower variance = better distribution
        return Math.max(0, 1 - variance / (avg * avg));
    }
    /**
     * Analyze fixture structure for template
     */
    analyzeFixtureStructure(matches) {
        const rounds = Math.max(...matches.map(m => m.round));
        const matchesPerRound = new Map();
        matches.forEach(m => {
            matchesPerRound.set(m.round, (matchesPerRound.get(m.round) || 0) + 1);
        });
        return {
            rounds,
            matchesPerRound: Object.fromEntries(matchesPerRound),
            expectedPlayerCount: this.inferPlayerCount(matches),
            bracketType: this.inferBracketType(matches)
        };
    }
    /**
     * Infer player count from matches
     */
    inferPlayerCount(matches) {
        const uniquePlayers = new Set();
        matches.forEach(m => {
            if (m.playerAId)
                uniquePlayers.add(m.playerAId);
            if (m.playerBId)
                uniquePlayers.add(m.playerBId);
        });
        return uniquePlayers.size;
    }
    /**
     * Infer bracket type from structure
     */
    inferBracketType(matches) {
        const rounds = Math.max(...matches.map(m => m.round));
        const firstRoundMatches = matches.filter(m => m.round === 1).length;
        // Check if power of 2 (knockout pattern)
        const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
        if (isPowerOfTwo(firstRoundMatches)) {
            return 'knockout';
        }
        // Check for round-robin pattern (all-vs-all)
        const playerCount = this.inferPlayerCount(matches);
        const expectedRRMatches = (playerCount * (playerCount - 1)) / 2;
        if (matches.length === expectedRRMatches) {
            return 'roundrobin';
        }
        return 'custom';
    }
    /**
     * Generate recommendations based on preview
     */
    generateRecommendations(preview) {
        const recommendations = [];
        // Recommendation 1: Same-club collisions
        if (preview.metrics.sameClubCollisions > 0) {
            recommendations.push(`Consider rerunning with higher maxSwapIterations (current: ${this.opts.maxSwapIterations}) to reduce same-club matches.`);
        }
        // Recommendation 2: Fairness score
        if (preview.fairnessScore && preview.fairnessScore < 70) {
            recommendations.push(`Fairness score is ${preview.fairnessScore.toFixed(1)}/100. Consider enabling advanced seeding or adjusting constraint weights.`);
        }
        // Recommendation 3: BYEs
        if (preview.metrics.byes && preview.metrics.byes > preview.metrics.totalPlayers * 0.25) {
            recommendations.push(`High number of BYEs (${preview.metrics.byes}). Consider using a different format like Swiss or Round Robin.`);
        }
        // Recommendation 4: Format-specific
        if (preview.format === 'knockout' && preview.metrics.totalPlayers > 64) {
            recommendations.push('Large tournament (64+ players). Consider Swiss format for better player experience and reduced BYEs.');
        }
        if (preview.format === 'roundrobin' && preview.metrics.totalPlayers > 16) {
            recommendations.push('Large round-robin (16+ players). Consider groups-then-playoff format to reduce total match count.');
        }
        return recommendations;
    }
    // ============================================================================
    // PSEUDO-RANDOM NUMBER GENERATOR
    // ============================================================================
    /**
     * Deterministic PRNG (Mulberry32)
     */
    rng(seed) {
        let t = seed !== null && seed !== void 0 ? seed : Date.now();
        return () => {
            t += 0x6D2B79F5;
            let r = Math.imul(t ^ (t >>> 15), 1 | t);
            r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
            return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
        };
    }
    // ============================================================================
    // AUDIT LOGGING
    // ============================================================================
    logAudit(action, details) {
        if (!this.opts.enableAuditLog)
            return;
        const entry = {
            timestamp: new Date(),
            action,
            details,
            userId: 'system' // This should be set from context
        };
        this.auditLog.push(entry);
        // Emit event for external logging
        this.emit('audit', entry);
    }
    /**
     * Get audit log
     */
    getAuditLog() {
        return [...this.auditLog];
    }
    /**
     * Clear audit log
     */
    clearAuditLog() {
        this.auditLog = [];
    }
    // ============================================================================
    // PROGRESS TRACKING
    // ============================================================================
    emitProgress(phase, progress, message) {
        const update = {
            phase,
            progress,
            message,
            estimatedTimeRemaining: this.estimateTimeRemaining(progress)
        };
        this.opts.onProgress(update);
        this.emit('progress', update);
    }
    emitError(error) {
        this.opts.onError(error);
        this.emit('error', error);
    }
    estimateTimeRemaining(currentProgress) {
        if (currentProgress === 0)
            return 0;
        const elapsed = Date.now() - this.performanceMetrics.startTime;
        const total = (elapsed / currentProgress) * 100;
        return Math.round((total - elapsed) / 1000);
    }
    // ============================================================================
    // PERFORMANCE METRICS
    // ============================================================================
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return Object.assign(Object.assign({}, this.performanceMetrics), { duration: this.performanceMetrics.endTime - this.performanceMetrics.startTime });
    }
    /**
     * Reset performance metrics
     */
    resetMetrics() {
        this.performanceMetrics = {
            startTime: 0,
            endTime: 0,
            operationCount: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
    }
    // ============================================================================
    // WINNER PROPAGATION (for match completion)
    // ============================================================================
    /**
     * Propagate winner to next match in bracket
     */
    propagateWinner(matchId, winnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = yield db_1.prisma.match.findUnique({
                where: { id: matchId },
                include: { nextMatch: true }
            });
            if (!match || !match.nextMatch)
                return;
            const nextMatch = match.nextMatch;
            const isTopFeeder = (match.matchNumber % 2) === 1;
            yield db_1.prisma.match.update({
                where: { id: nextMatch.id },
                data: {
                    [isTopFeeder ? 'playerAId' : 'playerBId']: winnerId
                }
            });
            this.logAudit('WINNER_PROPAGATED', {
                matchId,
                winnerId,
                nextMatchId: nextMatch.id,
                position: isTopFeeder ? 'A' : 'B'
            });
        });
    }
    // ============================================================================
    // BATCH OPERATIONS (for large tournaments)
    // ============================================================================
    /**
     * Process large tournaments in batches
     */
    processBatch(items, processor) {
        return __awaiter(this, void 0, void 0, function* () {
            const batchSize = this.opts.batchSize;
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);
                yield processor(batch);
                // Emit progress
                const progress = Math.round(((i + batch.length) / items.length) * 100);
                this.emitProgress('batch_processing', progress, `Processing batch ${Math.floor(i / batchSize) + 1}`);
            }
        });
    }
}
exports.FixtureEngine = FixtureEngine;
// ============================================================================
// EXPORT UTILITIES
// ============================================================================
/**
 * Factory function for creating FixtureEngine instances
 */
function createFixtureEngine(options) {
    return new FixtureEngine(options);
}
/**
 * Validate fixture constraints without generating
 */
function validateFixtureConstraints(eventId, format, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const engine = new FixtureEngine(options);
        const { players } = yield engine['validateAndFetchEventData'](eventId);
        return engine['validateConstraints'](eventId, players, format);
    });
}
/**
 * Calculate fairness score for existing fixtures
 */
function calculateExistingFixtureFairness(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        const matches = yield db_1.prisma.match.findMany({
            where: { eventId },
            include: {
                playerA: { select: { clubId: true } },
                playerB: { select: { clubId: true } }
            }
        });
        const totalPlayers = new Set([
            ...matches.map(m => m.playerAId),
            ...matches.map(m => m.playerBId)
        ].filter(Boolean)).size;
        let sameClubCollisions = 0;
        matches.forEach(m => {
            var _a, _b;
            if (((_a = m.playerA) === null || _a === void 0 ? void 0 : _a.clubId) &&
                ((_b = m.playerB) === null || _b === void 0 ? void 0 : _b.clubId) &&
                m.playerA.clubId === m.playerB.clubId) {
                sameClubCollisions++;
            }
        });
        const preview = {
            format: 'knockout',
            matches: [],
            metrics: {
                totalPlayers,
                sameClubCollisions,
                fairnessScore: 0,
                constraintViolations: []
            },
            previewOnly: true
        };
        const engine = new FixtureEngine();
        return engine.calculateFairnessScore(preview);
    });
}
/**
 * Export default instance
 */
