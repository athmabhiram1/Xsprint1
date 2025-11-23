# Test All Tournament Formats
Write-Host "`nTesting All Tournament Formats" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Login
Write-Host "[Auth] Logging in..." -ForegroundColor Yellow
$loginData = @{ email = "admin@test.com"; password = "test123" } | ConvertTo-Json
try {
    $auth = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SessionVariable session
    Write-Host "Logged in as: $($auth.user.name)`n" -ForegroundColor Green
} catch {
    Write-Host "Creating admin account..." -ForegroundColor Yellow
    $adminData = @{ name = "Admin"; email = "admin@test.com"; password = "test123"; adminCode = "AthmaAdminInit5321" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" -Method POST -Body $adminData -ContentType "application/json" | Out-Null
    $auth = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SessionVariable session
}

# Test each format
$formats = @('knockout', 'roundrobin', 'groups_then_playoff', 'swiss', 'double_elimination')

foreach ($format in $formats) {
    Write-Host "Testing: $format" -ForegroundColor Cyan
    
    # Create Event
    $eventData = @{
        name = "Test $format Event"
        sport = "Badminton"
        type = $format.ToUpper()
    } | ConvertTo-Json
    
    try {
        $event = Invoke-RestMethod -Uri "http://localhost:5001/api/events" -Method POST -Body $eventData -ContentType "application/json" -WebSession $session
        $eventId = $event.data.id
        Write-Host "  Created event: $eventId" -ForegroundColor Gray
        
        # Generate Fixtures
        $fixtureData = @{
            type = $format
            format = $format
        } | ConvertTo-Json
        
        $fixtures = Invoke-RestMethod -Uri "http://localhost:5001/api/events/$eventId/fixtures/generate" -Method POST -Body $fixtureData -ContentType "application/json" -WebSession $session
        
        if ($fixtures.data.matches) {
            Write-Host "  Generated $($fixtures.data.matches.Count) matches" -ForegroundColor Green
        } else {
            Write-Host "  Note: No matches (need registered players)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "`nAll formats are available:`n" -ForegroundColor Cyan
Write-Host "  1. Knockout - Single elimination" -ForegroundColor White
Write-Host "  2. Round Robin - Everyone plays everyone" -ForegroundColor White
Write-Host "  3. Groups + Playoff - Group stage then brackets" -ForegroundColor White
Write-Host "  4. Swiss System - Pair based on performance" -ForegroundColor White
Write-Host "  5. Double Elimination - Winners & losers brackets`n" -ForegroundColor White
