
const API_URL = 'http://localhost:5001/api';
const ADMIN_CODE = 'AthmaAdminInit5321';

async function runTest() {
    try {
        const uniqueId = Date.now();
        const email = `admin_${uniqueId}@xsprint.com`;
        const password = 'admin123';

        // 0. Register Admin
        console.log(`Registering Admin (${email})...`);
        const regRes = await fetch(`${API_URL}/auth/register-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Admin',
                email: email,
                password: password,
                adminCode: ADMIN_CODE
            })
        });

        if (!regRes.ok) {
            const err = await regRes.json();
            console.log('Registration failed (might exist):', err);
            // If failed, try to login with DEFAULT admin
            console.log('Trying default admin login...');
            await login('admin@xsprint.com', 'admin123');
        } else {
            console.log('Admin registered successfully.');
            await login(email, password);
        }

    } catch (error: any) {
        console.error('Test Failed:', error.message);
    }
}

async function login(email: string, password: string) {
    console.log(`Logging in as ${email}...`);
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(err)}`);
    }

    const cookie = loginRes.headers.get('set-cookie');
    const headers = {
        'Content-Type': 'application/json',
        'Cookie': cookie || ''
    };
    console.log('Logged in.');

    await runFixtureTests(headers);
}

async function runFixtureTests(headers: any) {
    // 2. Create Event
    console.log('Creating Event...');
    const eventRes = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Fixture Test Event ' + Date.now(),
            sport: 'Tennis',
            type: 'KNOCKOUT',
            gender: 'Mixed',
            category: 'Open'
        })
    });

    if (!eventRes.ok) {
        const err = await eventRes.json();
        throw new Error(`Create Event failed: ${JSON.stringify(err)}`);
    }

    const eventData: any = await eventRes.json();
    const eventId = eventData.data.id;
    console.log(`Event created: ${eventId}`);

    // 3. Register Players
    console.log('Creating and Registering Players...');
    for (let i = 1; i <= 4; i++) {
        const playerRes = await fetch(`${API_URL}/players`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: `Test Player ${i}`,
                email: `p${i}_${Date.now()}@test.com`,
                gender: 'Male',
                dateOfBirth: '2000-01-01'
            })
        });

        if (playerRes.ok) {
            const pData: any = await playerRes.json();
            await fetch(`${API_URL}/events/${eventId}/register`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ playerId: pData.data.id })
            });
        }
    }

    // 4. Generate KNOCKOUT
    console.log('Generating KNOCKOUT fixtures...');
    const knockoutRes = await fetch(`${API_URL}/events/${eventId}/fixtures/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: 'KNOCKOUT' })
    });

    if (knockoutRes.ok) {
        const kData = await knockoutRes.json();
        console.log('Knockout Fixtures Generated:', kData.message, kData.totalMatches);
    } else {
        const kErr = await knockoutRes.json();
        console.log('Knockout Generation Failed:', kErr);
    }

    // 5. Generate ROUND_ROBIN
    console.log('Generating ROUND_ROBIN fixtures...');
    const rrRes = await fetch(`${API_URL}/events/${eventId}/fixtures/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: 'ROUND_ROBIN' })
    });

    if (rrRes.ok) {
        const rrData = await rrRes.json();
        console.log('Round Robin Fixtures Generated:', rrData.message, rrData.totalMatches);
    } else {
        const rrErr = await rrRes.json();
        console.log('Round Robin Generation Failed:', rrErr);
    }
}

runTest();
