// const fetch = require('node-fetch'); // Use global fetch in Node 18+

const BASE_URL = 'http://127.0.0.1:5001/api';

async function registerAdmin() {
  console.log('\n[1/3] Registering admin...');
  const res = await fetch(`${BASE_URL}/auth/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'Admin123!',
      adminCode: 'AthmaAdminInit5321'
    })
  });
  
  if (!res.ok) {
    if (res.status === 403) {
      console.log('  ? Admin already exists, skipping...');
    } else {
      const error = await res.text();
      console.log('   Registration failed (' + res.status + '): ' + error);
    }
  } else {
    const data = await res.json();
    console.log('   Admin created: ' + (data.data?.user?.email || 'Success'));
  }
}

async function login() {
  console.log('\n[2/3] Logging in...');
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'Admin123!'
    })
  });
  
  if (!res.ok) {
    console.log('   Login failed: ' + res.status);
    return null;
  }
  
  const data = await res.json();
  const cookies = res.headers.get('set-cookie');
  console.log('   Logged in as: ' + data.data?.user?.email);
  return cookies;
}

async function createTournament(cookies) {
  console.log('\n[Setup] Creating Tournament...');
  const res = await fetch(`${BASE_URL}/tournaments`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({
      name: 'Test Tournament ' + Date.now(),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      location: 'Test Venue'
    })
  });

  if (!res.ok) {
    const error = await res.text();
    console.log('   Tournament creation failed (' + res.status + '): ' + error);
    return null;
  }

  const data = await res.json();
  console.log('   Tournament created: ' + data.tournament.name + ' (ID: ' + data.tournament.id + ')');
  return data.tournament.id;
}

async function createPlayers(cookies, count = 8) {
  console.log('\n[Setup] Creating ' + count + ' Players...');
  const playerIds = [];
  
  for (let i = 1; i <= count; i++) {
    const res = await fetch(`${BASE_URL}/players`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        name: 'Player ' + i,
        email: 'player' + i + '_' + Date.now() + '@test.com',
        gender: 'MALE'
      })
    });

    if (res.ok) {
      const data = await res.json();
      playerIds.push(data.player.id);
    } else {
      console.log('   Failed to create Player ' + i);
    }
  }
  
  console.log('   Created ' + playerIds.length + ' players');
  return playerIds;
}

async function testFormat(format, tournamentId, playerIds, cookies, options = {}) {
  console.log('\n[Test] ' + format.toUpperCase());
  
  // 1. Create Event
  const eventRes = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({
      tournamentId,
      name: format + ' Event',
      sport: 'BADMINTON',
      type: format === 'roundrobin' ? 'ROUND_ROBIN' : 'KNOCKOUT',
      gender: 'MALE',
      category: 'OPEN'
    })
  });
  
  if (!eventRes.ok) {
    const error = await eventRes.text();
    console.log('   Event creation failed (' + eventRes.status + '): ' + error);
    return;
  }
  
  const eventData = await eventRes.json();
  const eventId = eventData.data.id;
  console.log('   Event created: ' + eventData.data.name + ' (ID: ' + eventId + ')');
  
  // 2. Register Players
  let registeredCount = 0;
  for (const playerId of playerIds) {
    const regRes = await fetch(`${BASE_URL}/events/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        eventId,
        playerId
      })
    });
    if (regRes.ok) registeredCount++;
  }
  console.log('   Registered ' + registeredCount + ' players');
  
  // 3. Generate Fixtures
  const fixtureRes = await fetch(`${BASE_URL}/events/${eventId}/fixtures/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({
      type: format,
      format: format,
      ...options
    })
  });
  
  if (!fixtureRes.ok) {
    const error = await fixtureRes.text();
    console.log('   Fixture generation failed (' + fixtureRes.status + '): ' + error);
    return;
  }
  
  const fixtures = await fixtureRes.json();
  const fixtureCount = fixtures.data?.matches?.length || 0;
  console.log('   Generated ' + fixtureCount + ' fixtures');
  
  if (fixtureCount > 0) {
    console.log('   ✓ Format: ' + format + ' - WORKING!');
  } else {
    console.log('   ✗ Format: ' + format + ' - No fixtures generated');
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('TESTING ALL TOURNAMENT FORMATS');
  console.log('='.repeat(60));
  
  await registerAdmin();
  const cookies = await login();
  
  if (!cookies) {
    console.log('\n Authentication failed, cannot test formats');
    return;
  }
  
  const tournamentId = await createTournament(cookies);
  if (!tournamentId) return;

  const playerIds = await createPlayers(cookies, 8);
  if (playerIds.length < 4) {
    console.log('Not enough players created to test formats');
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TESTING FORMATS');
  console.log('='.repeat(60));
  
  await testFormat('knockout', tournamentId, playerIds, cookies);
  await new Promise(r => setTimeout(r, 2000));
  
  await testFormat('roundrobin', tournamentId, playerIds, cookies);
  await new Promise(r => setTimeout(r, 2000));
  
  await testFormat('groups_then_playoff', tournamentId, playerIds, cookies, { numGroups: 2 });
  await new Promise(r => setTimeout(r, 2000));
  
  await testFormat('swiss', tournamentId, playerIds, cookies, { swissRounds: 3 });
  await new Promise(r => setTimeout(r, 2000));
  
  await testFormat('double_elimination', tournamentId, playerIds, cookies);
  
  console.log('\n' + '='.repeat(60));
  console.log('ALL TESTS COMPLETE!');
  console.log('='.repeat(60));
}

main().catch(console.error);
