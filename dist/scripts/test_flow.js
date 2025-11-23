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
const node_fetch_1 = __importDefault(require("node-fetch"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const API_URL = 'http://localhost:5000/api';
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Starting Backend Test Flow...');
        try {
            // 1. Create Tournament
            console.log('\n1. Creating Tournament...');
            const tournamentRes = yield (0, node_fetch_1.default)(`${API_URL}/tournaments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `Test Tournament ${Date.now()}`,
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                    location: 'Test Location',
                    courts: [{ name: 'Court 1' }, { name: 'Court 2' }]
                })
            });
            const tournamentData = yield tournamentRes.json();
            if (!tournamentData.success)
                throw new Error(`Failed to create tournament: ${JSON.stringify(tournamentData)}`);
            const tournamentId = tournamentData.tournament.id;
            console.log(`✅ Tournament Created: ${tournamentId}`);
            // 2. Create Event
            console.log('\n2. Creating Event...');
            const eventRes = yield (0, node_fetch_1.default)(`${API_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tournamentId,
                    name: 'Men Singles',
                    sport: 'BADMINTON',
                    type: 'KNOCKOUT',
                    gender: 'MALE',
                    category: 'OPEN'
                })
            });
            const eventData = yield eventRes.json();
            if (!eventData.success)
                throw new Error(`Failed to create event: ${JSON.stringify(eventData)}`);
            const eventId = eventData.event.id;
            console.log(`✅ Event Created: ${eventId}`);
            // 3. Create Players & Register
            console.log('\n3. Creating & Registering Players...');
            const playerIds = [];
            for (let i = 1; i <= 4; i++) {
                const playerRes = yield (0, node_fetch_1.default)(`${API_URL}/players`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: `Test Player ${i}`,
                        email: `player${i}_${Date.now()}@test.com`,
                        gender: 'MALE',
                        category: 'OPEN'
                    })
                });
                const playerData = yield playerRes.json();
                if (!playerData.success)
                    throw new Error(`Failed to create player ${i}: ${JSON.stringify(playerData)}`);
                const playerId = playerData.player.id;
                playerIds.push(playerId);
                const regRes = yield (0, node_fetch_1.default)(`${API_URL}/events/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventId,
                        playerId,
                        seed: i
                    })
                });
                const regData = yield regRes.json();
                if (!regData.success)
                    throw new Error(`Failed to register player ${i}: ${JSON.stringify(regData)}`);
            }
            console.log(`✅ 4 Players Registered`);
            // 4. Generate Fixtures
            console.log('\n4. Generating Fixtures...');
            const fixtureRes = yield (0, node_fetch_1.default)(`${API_URL}/fixtures/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId })
            });
            const fixtureData = yield fixtureRes.json();
            if (!fixtureData.success)
                throw new Error(`Failed to generate fixtures: ${JSON.stringify(fixtureData)}`);
            console.log(`✅ Fixtures Generated: ${fixtureData.matches.length} matches`);
            // 5. Schedule Matches
            console.log('\n5. Scheduling Matches...');
            const scheduleRes = yield (0, node_fetch_1.default)(`${API_URL}/fixtures/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                    matchDuration: 30
                })
            });
            const scheduleData = yield scheduleRes.json();
            if (!scheduleData.success)
                throw new Error(`Failed to schedule matches: ${JSON.stringify(scheduleData)}`);
            console.log(`✅ Matches Scheduled`);
            // 6. Get a Match and Validate Code
            console.log('\n6. Testing Match Code & Result...');
            // Get the first match
            const matchesRes = yield (0, node_fetch_1.default)(`${API_URL}/fixtures/event/${eventId}`);
            const matchesData = yield matchesRes.json();
            // Find a match in round 1
            const match = matchesData.flatMatches.find((m) => m.round === 1);
            if (!match)
                throw new Error('No match found in round 1');
            console.log(`Testing with Match ID: ${match.id}`);
            // Fetch the code from DB directly (cheating for test)
            const matchCode = yield prisma.matchCode.findUnique({
                where: { matchId: match.id }
            });
            if (!matchCode)
                throw new Error('Match code not found in DB');
            console.log('Attempting validation with invalid code...');
            const invalidValRes = yield (0, node_fetch_1.default)(`${API_URL}/matches/validate-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId: match.id, code: '000000' })
            });
            const invalidValData = yield invalidValRes.json();
            if (invalidValData.success)
                throw new Error('Validation should have failed!');
            console.log('✅ Invalid code rejected');
            headers: {
                'Content-Type';
                'application/json';
            }
            body: JSON.stringify({ matchId: match.id, code: '123456' });
        }
        finally { }
        ;
        const validValData = yield validValRes.json();
        if (!validValData.success)
            throw new Error(`Validation failed with correct code: ${JSON.stringify(validValData)}`);
        console.log('✅ Valid code accepted');
        // 7. Submit Result
        console.log('\n7. Submitting Result...');
        const resultRes = yield (0, node_fetch_1.default)(`${API_URL}/matches/result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matchId: match.id,
                code: '123456',
                winnerId: match.playerAId, // Player A wins
                score: { sets: [{ a: 21, b: 19 }, { a: 21, b: 15 }] }
            })
        });
        const resultData = yield resultRes.json();
        if (!resultData.success)
            throw new Error(`Failed to submit result: ${JSON.stringify(resultData)}`);
        console.log('✅ Result submitted successfully');
        // Verify match status
        const finalMatch = yield prisma.match.findUnique({
            where: { id: match.id }
        });
        if ((finalMatch === null || finalMatch === void 0 ? void 0 : finalMatch.status) !== 'COMPLETED')
            throw new Error('Match status not updated to COMPLETED');
        console.log('✅ Match status verified as COMPLETED');
        console.log('\n🎉 ALL TESTS PASSED!');
    });
}
try { }
catch (error) {
    console.error('\n❌ TEST FAILED:', error);
}
finally {
    await prisma.$disconnect();
}
runTest();
