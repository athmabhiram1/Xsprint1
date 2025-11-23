# Fixture & Schedule Test Script
Write-Host "Testing Fixture Generator & Scheduler" -ForegroundColor Cyan

# Test 1: Health
Write-Host "`n[1/8] Backend Health..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5001/api/health"
Write-Host "Status: $($health.data.status)" -ForegroundColor Green

# Test 2: Auth
Write-Host "`n[2/8] Authentication..." -ForegroundColor Yellow
$adminData = @{ name = "Admin"; email = "admin@test.com"; password = "test123"; adminCode = "AthmaAdminInit5321" } | ConvertTo-Json
try { Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" -Method POST -Body $adminData -ContentType "application/json" | Out-Null } catch {}

$loginData = @{ email = "admin@test.com"; password = "test123" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SessionVariable session
Write-Host "Logged in: $($auth.user.name)" -ForegroundColor Green

# Test 3: Tournament
Write-Host "`n[3/8] Creating tournament..." -ForegroundColor Yellow
$tournamentData = @{ name = "Test Tournament"; location = "Hall A"; startDate = (Get-Date).AddDays(2).ToString("o"); endDate = (Get-Date).AddDays(4).ToString("o") } | ConvertTo-Json
$tournament = Invoke-RestMethod -Uri "http://localhost:5001/api/tournaments" -Method POST -Body $tournamentData -ContentType "application/json" -WebSession $session
Write-Host "Created: $($tournament.data.name)" -ForegroundColor Green

# Test 4: Event
Write-Host "`n[4/8] Creating event..." -ForegroundColor Yellow
$eventData = @{ name = "U18 Singles"; tournamentId = $tournament.data.id; sport = "Badminton"; type = "KNOCKOUT"; gender = "Mens"; category = "U18" } | ConvertTo-Json
$event = Invoke-RestMethod -Uri "http://localhost:5001/api/events" -Method POST -Body $eventData -ContentType "application/json" -WebSession $session
Write-Host "Created: $($event.data.name)" -ForegroundColor Green
$eventId = $event.data.id

# Test 5: Players
Write-Host "`n[5/8] Creating players..." -ForegroundColor Yellow
$playerNames = @("Alex Rivera", "Jordan Lee", "Casey Smith", "Taylor Johnson", "Morgan Wilson", "Drew Martinez", "Sam Anderson", "Jamie Garcia")
$playerIds = @()
foreach ($name in $playerNames) {
    $playerData = @{ name = $name; gender = "Male"; category = "U18" } | ConvertTo-Json
    try {
        $p = Invoke-RestMethod -Uri "http://localhost:5001/api/players" -Method POST -Body $playerData -ContentType "application/json" -WebSession $session
        $playerIds += $p.data.id
    } catch {}
}
Write-Host "Created $($playerIds.Count) players" -ForegroundColor Green

# Test 6: Register
Write-Host "`n[6/8] Registering players..." -ForegroundColor Yellow
foreach ($pid in $playerIds) {
    $regData = @{ eventId = $eventId; playerId = $pid } | ConvertTo-Json
    try { Invoke-RestMethod -Uri "http://localhost:5001/api/events/$eventId/register" -Method POST -Body $regData -ContentType "application/json" -WebSession $session | Out-Null } catch {}
}
Write-Host "Registered $($playerIds.Count) players" -ForegroundColor Green

# Test 7: Fixtures
Write-Host "`n[7/8] Generating fixtures..." -ForegroundColor Yellow
try {
    $fixtures = Invoke-RestMethod -Uri "http://localhost:5001/api/fixtures/generate/$eventId" -Method POST -WebSession $session
    Write-Host "Generated $($fixtures.data.matches.Count) matches in $($fixtures.data.rounds) rounds" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Schedule
Write-Host "`n[8/8] Generating schedule..." -ForegroundColor Yellow
try {
    $schedule = Invoke-RestMethod -Uri "http://localhost:5001/api/schedule/events/$eventId/generate" -Method POST -WebSession $session
    Write-Host "Schedule created" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Show match codes
Write-Host "`nMatch Codes for Testing:" -ForegroundColor Cyan
try {
    $matches = Invoke-RestMethod -Uri "http://localhost:5001/api/matches?eventId=$eventId" -Method GET -WebSession $session
    $matches.data | Where-Object { $_.matchCode } | Select-Object -First 5 | ForEach-Object {
        Write-Host "  Code: $($_.matchCode)" -ForegroundColor Green
    }
} catch {}

Write-Host "`nTest Complete!" -ForegroundColor Green
Write-Host "Login at http://localhost:3000 with admin@test.com / test123" -ForegroundColor Yellow
