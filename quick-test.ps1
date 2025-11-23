# Quick Test Script - xSPRINT
# Run this to test your complete application

Write-Host "`n🚀 xSPRINT Quick Test Script" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Test 1: Backend Health Check
Write-Host "`n[1/5] Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/api/health" -Method GET
    Write-Host "✓ Backend is running!" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend not responding. Make sure it is running on port 5001" -ForegroundColor Red
    exit 1
}

# Test 2: Create/Login Admin
Write-Host "`n[2/5] Setting up admin account..." -ForegroundColor Yellow
$adminBody = @{
    name = "Test Admin"
    email = "admin@xthlete.com"
    password = "admin123"
    adminCode = "AthmaAdminInit5321"
} | ConvertTo-Json

try {
    $admin = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" `
        -Method POST `
        -Body $adminBody `
        -ContentType "application/json"
    Write-Host "✓ Admin account created!" -ForegroundColor Green
} catch {
    Write-Host "  Admin already exists, logging in..." -ForegroundColor Yellow
}

# Login
$loginBody = @{
    email = "admin@xthlete.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $session = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable authSession
    Write-Host "✓ Logged in as: $($session.user.name)" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed" -ForegroundColor Red
    exit 1
}

# Test 3: Create Sample Players
Write-Host "`n[3/5] Creating sample players..." -ForegroundColor Yellow
$players = @(
    @{ name = "Alex Rivera"; gender = "Male"; category = "U18" },
    @{ name = "Jordan Lee"; gender = "Male"; category = "U18" },
    @{ name = "Casey Smith"; gender = "Female"; category = "U18" },
    @{ name = "Taylor Johnson"; gender = "Male"; category = "U18" }
)

$createdPlayers = @()
foreach ($p in $players) {
    try {
        $playerBody = $p | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "http://localhost:5001/api/players" `
            -Method POST `
            -Body $playerBody `
            -ContentType "application/json" `
            -WebSession $authSession
        $createdPlayers += $result.data
        Write-Host "  ✓ Created: $($p.name)" -ForegroundColor Gray
    } catch {
        Write-Host "  - Player might already exist: $($p.name)" -ForegroundColor Gray
    }
}

# Test 4: Create Tournament & Event
Write-Host "`n[4/5] Creating tournament and event..." -ForegroundColor Yellow

$tournamentBody = @{
    name = "Test Championship 2025"
    location = "Sports Complex"
    startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    endDate = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

try {
    $tournament = Invoke-RestMethod -Uri "http://localhost:5001/api/tournaments" `
        -Method POST `
        -Body $tournamentBody `
        -ContentType "application/json" `
        -WebSession $authSession
    Write-Host "  ✓ Tournament created: $($tournament.data.name)" -ForegroundColor Gray
    
    $eventBody = @{
        name = "U18 Men Singles"
        tournamentId = $tournament.data.id
        sport = "Badminton"
        type = "KNOCKOUT"
        gender = "Mens"
        category = "U18"
    } | ConvertTo-Json
    
    $event = Invoke-RestMethod -Uri "http://localhost:5001/api/events" `
        -Method POST `
        -Body $eventBody `
        -ContentType "application/json" `
        -WebSession $authSession
    Write-Host "  ✓ Event created: $($event.data.name)" -ForegroundColor Gray
    
} catch {
    Write-Host "  - Tournament/Event might already exist" -ForegroundColor Gray
}

# Test 5: Get Match Codes
Write-Host "`n[5/5] Fetching match codes..." -ForegroundColor Yellow
try {
    $matches = Invoke-RestMethod -Uri "http://localhost:5001/api/matches" `
        -Method GET `
        -WebSession $authSession
    
    if ($matches.data -and $matches.data.Count -gt 0) {
        Write-Host "`n📋 Available Match Codes:" -ForegroundColor Cyan
        $matches.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "  🏸 Code: " -NoNewline -ForegroundColor White
            Write-Host "$($_.matchCode)" -ForegroundColor Green -NoNewline
            Write-Host " | Players: $($_.playerA.name) vs $($_.playerB.name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  No matches found. Generate fixtures in the UI first." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Could not fetch matches" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "`n📍 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open frontend: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Blue
Write-Host "  2. Login with:" -ForegroundColor White
Write-Host "     Email: " -NoNewline; Write-Host "admin@xthlete.com" -ForegroundColor Yellow
Write-Host "     Password: " -NoNewline; Write-Host "admin123" -ForegroundColor Yellow
Write-Host "  3. Navigate to Umpire tab" -ForegroundColor White
Write-Host "  4. Enter a 6-digit match code from above" -ForegroundColor White
Write-Host "  5. Start scoring!" -ForegroundColor White
Write-Host "`n🎉 Happy Testing!`n" -ForegroundColor Cyan
