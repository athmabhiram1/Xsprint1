# Fixture Generator & Scheduler Test Script
# Complete end-to-end test for xSPRINT

Write-Host "`n🏸 xSPRINT - Fixture & Schedule Test`n" -ForegroundColor Cyan

# Step 1: Health Check
Write-Host "[1/8] Checking backend..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5001/api/health"
Write-Host "  ✓ Backend: $($health.data.status)" -ForegroundColor Green

# Step 2: Create Admin & Login
Write-Host "`n[2/8] Authentication..." -ForegroundColor Yellow
$adminBody = @{
    name = "Admin User"
    email = "admin@test.com"
    password = "test123"
    adminCode = "AthmaAdminInit5321"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" -Method POST -Body $adminBody -ContentType "application/json" | Out-Null
    Write-Host "  ✓ Admin created" -ForegroundColor Green
} catch {
    Write-Host "  - Admin exists, continuing..." -ForegroundColor Gray
}

$loginBody = @{
    email = "admin@test.com"
    password = "test123"
} | ConvertTo-Json

$auth = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -SessionVariable session
Write-Host "  ✓ Logged in: $($auth.user.name)" -ForegroundColor Green

# Step 3: Create Tournament
Write-Host "`n[3/8] Creating tournament..." -ForegroundColor Yellow
$tournamentBody = @{
    name = "Badminton Championship 2025"
    location = "Main Sports Hall"
    startDate = (Get-Date).AddDays(2).ToString("o")
    endDate = (Get-Date).AddDays(4).ToString("o")
} | ConvertTo-Json

$tournament = Invoke-RestMethod -Uri "http://localhost:5001/api/tournaments" -Method POST -Body $tournamentBody -ContentType "application/json" -WebSession $session
Write-Host "  ✓ Tournament: $($tournament.data.name)" -ForegroundColor Green
Write-Host "  ID: $($tournament.data.id)" -ForegroundColor Gray

# Step 4: Create Event
Write-Host "`n[4/8] Creating event..." -ForegroundColor Yellow
$eventBody = @{
    name = "U18 Mens Singles"
    tournamentId = $tournament.data.id
    sport = "Badminton"
    type = "KNOCKOUT"
    gender = "Mens"
    category = "U18"
} | ConvertTo-Json

$event = Invoke-RestMethod -Uri "http://localhost:5001/api/events" -Method POST -Body $eventBody -ContentType "application/json" -WebSession $session
Write-Host "  ✓ Event: $($event.data.name)" -ForegroundColor Green
Write-Host "  ID: $($event.data.id)" -ForegroundColor Gray
$eventId = $event.data.id

# Step 5: Create Players
Write-Host "`n[5/8] Creating players..." -ForegroundColor Yellow
$players = @(
    @{ name = "Alex Rivera"; gender = "Male"; category = "U18" },
    @{ name = "Jordan Lee"; gender = "Male"; category = "U18" },
    @{ name = "Casey Smith"; gender = "Male"; category = "U18" },
    @{ name = "Taylor Johnson"; gender = "Male"; category = "U18" },
    @{ name = "Morgan Wilson"; gender = "Male"; category = "U18" },
    @{ name = "Drew Martinez"; gender = "Male"; category = "U18" },
    @{ name = "Sam Anderson"; gender = "Male"; category = "U18" },
    @{ name = "Jamie Garcia"; gender = "Male"; category = "U18" }
)

$playerIds = @()
foreach ($p in $players) {
    $playerBody = $p | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:5001/api/players" -Method POST -Body $playerBody -ContentType "application/json" -WebSession $session
        $playerIds += $result.data.id
        Write-Host "  ✓ $($p.name)" -ForegroundColor Gray
    } catch {}
}
Write-Host "  Total: $($playerIds.Count) players" -ForegroundColor Green

# Step 6: Register Players to Event
Write-Host "`n[6/8] Registering players to event..." -ForegroundColor Yellow
foreach ($playerId in $playerIds) {
    $regBody = @{
        eventId = $eventId
        playerId = $playerId
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "http://localhost:5001/api/events/$eventId/register" -Method POST -Body $regBody -ContentType "application/json" -WebSession $session | Out-Null
    } catch {}
}
Write-Host "  ✓ Registered $($playerIds.Count) players" -ForegroundColor Green

# Step 7: Generate Fixtures
Write-Host "`n[7/8] Generating fixtures..." -ForegroundColor Yellow
try {
    $fixtures = Invoke-RestMethod -Uri "http://localhost:5001/api/fixtures/generate/$eventId" -Method POST -WebSession $session
    Write-Host "  ✓ Fixtures generated!" -ForegroundColor Green
    Write-Host "  Total matches: $($fixtures.data.matches.Count)" -ForegroundColor Gray
    Write-Host "  Total rounds: $($fixtures.data.rounds)" -ForegroundColor Gray
    
    # Display first few matches
    Write-Host "`n  📋 Sample Matches:" -ForegroundColor Cyan
    $fixtures.data.matches | Select-Object -First 4 | ForEach-Object {
        $playerA = if ($_.playerA) { $_.playerA.name } else { "TBD" }
        $playerB = if ($_.playerB) { $_.playerB.name } else { "TBD" }
        $code = if ($_.matchCode) { $_.matchCode } else { "------" }
        $matchup = "$playerA vs $playerB"
        Write-Host "    Round $($_.round) | Code: $code | $matchup" -ForegroundColor White
    }
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 8: Generate Schedule
Write-Host "`n[8/8] Generating schedule..." -ForegroundColor Yellow
try {
    $schedule = Invoke-RestMethod -Uri "http://localhost:5001/api/schedule/events/$eventId/generate" -Method POST -WebSession $session
    Write-Host "  ✓ Schedule created!" -ForegroundColor Green
    
    if ($schedule.data.blocks) {
        Write-Host "  Schedule blocks: $($schedule.data.blocks.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get Match Codes
Write-Host "`n📊 Final Match Codes (for Umpire testing):" -ForegroundColor Cyan
try {
    $matches = Invoke-RestMethod -Uri "http://localhost:5001/api/matches?eventId=$eventId" -Method GET -WebSession $session
    $matches.data | Where-Object { $_.matchCode } | Select-Object -First 5 | ForEach-Object {
        $playerA = if ($_.playerA) { $_.playerA.name } else { "TBD" }
        $playerB = if ($_.playerB) { $_.playerB.name } else { "TBD" }
        $matchup = "$playerA vs $playerB"
        Write-Host "  🎯 " -NoNewline
        Write-Host "$($_.matchCode)" -ForegroundColor Green -NoNewline
        Write-Host " | $matchup" -ForegroundColor White
    }
} catch {}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ TEST COMPLETE!" -ForegroundColor Green
Write-Host "`n📱 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open: http://localhost:3000" -ForegroundColor White
Write-Host "  2. Login: admin@test.com / test123" -ForegroundColor Yellow
Write-Host "  3. Go to Umpire tab" -ForegroundColor White
Write-Host "  4. Enter one of the match codes above" -ForegroundColor White
Write-Host "  5. Start live scoring!`n" -ForegroundColor White
