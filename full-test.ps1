# Complete Test - xSPRINT Fixture & Scheduler
# Uses correct API endpoints

Write-Host "`nxSPRINT - Complete Integration Test`n" -ForegroundColor Cyan

# 1. Health Check
Write-Host "[1] Backend Health..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5001/api/health"
Write-Host "  Backend: $($health.data.status)" -ForegroundColor Green

# 2. Register Admin
Write-Host "`n[2] Register Admin..." -ForegroundColor Yellow
$adminData = @{
    name = "Admin User"
    email = "admin@xsprint.com"
    password = "admin123"
    adminCode = "AthmaAdminInit5321"
} | ConvertTo-Json

try {
    $newAdmin = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" -Method POST -Body $adminData -ContentType "application/json"
    Write-Host "  Admin created: $($newAdmin.user.email)" -ForegroundColor Green
} catch {
    Write-Host "  Admin exists, continuing..." -ForegroundColor Gray
}

# 3. Login
Write-Host "`n[3] Login..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@xsprint.com"
    password = "admin123"
} | ConvertTo-Json

$auth = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SessionVariable session
Write-Host "  Logged in: $($auth.user.name)" -ForegroundColor Green
Write-Host "  Role: $($auth.user.role)" -ForegroundColor Gray

# 4. Create Event (using routers/eventRouter)
Write-Host "`n[4] Creating Event..." -ForegroundColor Yellow
$eventData = @{
    name = "Test Championship U18"
    sport = "Badminton"
    type = "KNOCKOUT"
    gender = "Mens"
    category = "U18"
} | ConvertTo-Json

try {
    $event = Invoke-RestMethod -Uri "http://localhost:5001/api/events" -Method POST -Body $eventData -ContentType "application/json" -WebSession $session
    Write-Host "  Event: $($event.data.name)" -ForegroundColor Green
    Write-Host "  ID: $($event.data.id)" -ForegroundColor Gray
    $eventId = $event.data.id
} catch {
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit
}

# 5. Register Players (mock data in frontend context)
Write-Host "`n[5] Note: Using frontend mock players..." -ForegroundColor Yellow
Write-Host "  In production, players would be created via /api/players" -ForegroundColor Gray

# 6. Generate Fixtures
Write-Host "`n[6] Generating Fixtures..." -ForegroundColor Yellow
try {
    $fixtures = Invoke-RestMethod -Uri "http://localhost:5001/api/events/$eventId/fixtures/generate" -Method POST -WebSession $session
    Write-Host "  Generated: $($fixtures.data.matches.Count) matches" -ForegroundColor Green
    Write-Host "  Rounds: $($fixtures.data.rounds)" -ForegroundColor Gray
    
    # Show sample matches
    if ($fixtures.data.matches.Count -gt 0) {
        Write-Host "`n  Sample Matches:" -ForegroundColor Cyan
        $fixtures.data.matches | Select-Object -First 3 | ForEach-Object {
            $pa = if ($_.playerA) { $_.playerA.name } else { "BYE" }
            $pb = if ($_.playerB) { $_.playerB.name } else { "BYE" }
            Write-Host "    Round $($_.round): $pa -vs- $pb" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  This is normal if no players registered" -ForegroundColor Yellow
}

# 7. Generate Schedule
Write-Host "`n[7] Generating Schedule..." -ForegroundColor Yellow
try {
    $schedule = Invoke-RestMethod -Uri "http://localhost:5001/api/schedule/events/$eventId/generate" -Method POST -WebSession $session
    Write-Host "  Schedule created!" -ForegroundColor Green
} catch {
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Get Matches with Codes
Write-Host "`n[8] Fetching Match Codes..." -ForegroundColor Yellow
try {
    $matches = Invoke-RestMethod -Uri "http://localhost:5001/api/matches?eventId=$eventId" -Method GET -WebSession $session
    
    if ($matches.data -and $matches.data.Count -gt 0) {
        Write-Host "`n  Match Codes (for Umpire Mode):" -ForegroundColor Cyan
        $matches.data | Where-Object { $_.matchCode } | Select-Object -First 5 | ForEach-Object {
            Write-Host "    $($_.matchCode)" -ForegroundColor Green
        }
    } else {
        Write-Host "  No matches found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Could not fetch matches" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Green
Write-Host "`nFrontend Testing:" -ForegroundColor Cyan
Write-Host "  1. Open: http://localhost:3000" -ForegroundColor White
Write-Host "  2. Login: admin@xsprint.com / admin123" -ForegroundColor Yellow
Write-Host "  3. Go to Registration tab" -ForegroundColor White
Write-Host "  4. Add 4-8 players" -ForegroundColor White
Write-Host "  5. Go to Fixtures tab" -ForegroundColor White
Write-Host "  6. Click 'Generate Fixtures'" -ForegroundColor White
Write-Host "  7. Go to Schedule tab" -ForegroundColor White
Write-Host "  8. Assign courts and times" -ForegroundColor White
Write-Host "  9. Go to Umpire tab" -ForegroundColor White
Write-Host "  10. Enter match code and start scoring!" -ForegroundColor White
Write-Host ""
