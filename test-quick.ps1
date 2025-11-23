# Quick Test - xSPRINT
Write-Host "`nTesting xSPRINT Application..." -ForegroundColor Cyan

# Test Backend Health
Write-Host "`n[1/3] Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/api/health" -Method GET
    Write-Host "Backend Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "Backend not responding!" -ForegroundColor Red
    exit 1
}

# Create Admin
Write-Host "`n[2/3] Creating admin account..." -ForegroundColor Yellow
$adminData = @{
    name = "Test Admin"
    email = "admin@xthlete.com"
    password = "admin123"
    adminCode = "AthmaAdminInit5321"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" -Method POST -Body $adminData -ContentType "application/json"
    Write-Host "Admin created: $($result.user.email)" -ForegroundColor Green
} catch {
    Write-Host "Admin might already exist" -ForegroundColor Yellow
}

# Login
Write-Host "`n[3/3] Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@xthlete.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $auth = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SessionVariable session
    Write-Host "Logged in as: $($auth.user.name)" -ForegroundColor Green
} catch {
    Write-Host "Login failed!" -ForegroundColor Red
}

Write-Host "`n===== TEST COMPLETE =====" -ForegroundColor Cyan
Write-Host "`nNext: Open http://localhost:3000" -ForegroundColor White
Write-Host "Login: admin@xthlete.com / admin123`n" -ForegroundColor Yellow
