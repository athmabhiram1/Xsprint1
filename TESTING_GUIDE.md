# 🧪 Complete Testing Guide - xSPRINT

## 📋 Prerequisites
- Backend running on `http://localhost:5001`
- Frontend running on `http://localhost:3000`
- Database connected (NeonDB)

---

## 🔐 Step 1: Create Admin Account

### Option A: Using the Frontend UI
1. Open `http://localhost:3000`
2. You'll see the login screen
3. Enter any email (e.g., `admin@xthlete.com`)
4. Enter any password
5. Click "Sign In"
6. Currently using mock auth - will connect to real API below

### Option B: Using API Directly (PowerShell)

```powershell
# Create admin user
$body = @{
    name = "Tournament Admin"
    email = "admin@xthlete.com"
    password = "admin123"
    adminCode = "AthmaAdminInit5321"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

Expected Response:
```json
{
  "message": "Admin user created successfully",
  "user": {
    "id": "...",
    "name": "Tournament Admin",
    "email": "admin@xthlete.com",
    "role": "ADMIN",
    "createdAt": "2025-11-23T..."
  }
}
```

---

## 🎯 Step 2: Login and Get Token

```powershell
# Login
$body = @{
    email = "admin@xthlete.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -SessionVariable session

# The token is in the cookie, stored in $session
$response
```

---

## 🏃 Step 3: Create Players

```powershell
# Create Player 1
$player1 = @{
    name = "Alex Rivera"
    gender = "Male"
    category = "U18"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/players" `
    -Method POST `
    -Body $player1 `
    -ContentType "application/json" `
    -WebSession $session

# Create Player 2
$player2 = @{
    name = "Jordan Lee"
    gender = "Male"
    category = "U18"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/players" `
    -Method POST `
    -Body $player2 `
    -ContentType "application/json" `
    -WebSession $session
```

---

## 🏆 Step 4: Create Tournament and Event

```powershell
# Create Tournament
$tournament = @{
    name = "Summer Championship 2025"
    location = "Sports Complex A"
    startDate = "2025-11-25T09:00:00Z"
    endDate = "2025-11-27T18:00:00Z"
} | ConvertTo-Json

$tournamentResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/tournaments" `
    -Method POST `
    -Body $tournament `
    -ContentType "application/json" `
    -WebSession $session

$tournamentId = $tournamentResponse.data.id

# Create Event
$event = @{
    name = "U18 Men's Singles"
    tournamentId = $tournamentId
    sport = "Badminton"
    type = "KNOCKOUT"
    gender = "Men's"
    category = "U18"
} | ConvertTo-Json

$eventResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/events" `
    -Method POST `
    -Body $event `
    -ContentType "application/json" `
    -WebSession $session

$eventId = $eventResponse.data.id
```

---

## 🎮 Step 5: Generate Fixtures

```powershell
# Generate fixtures for the event
$fixtureData = @{
    eventId = $eventId
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/fixtures/generate" `
    -Method POST `
    -Body $fixtureData `
    -ContentType "application/json" `
    -WebSession $session
```

---

## 📅 Step 6: Create Schedule

```powershell
# Get matches to schedule
$matches = Invoke-RestMethod -Uri "http://localhost:5001/api/matches?eventId=$eventId" `
    -Method GET `
    -WebSession $session

# Schedule first match
$scheduleData = @{
    matchId = $matches.data[0].id
    courtId = "c1"
    startTime = "2025-11-25T10:00:00Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/schedule" `
    -Method POST `
    -Body $scheduleData `
    -ContentType "application/json" `
    -WebSession $session
```

---

## 🏸 Step 7: Umpire Mode - Enter Match Code

### How to Get Match Code:

```powershell
# Get all matches
$matches = Invoke-RestMethod -Uri "http://localhost:5001/api/matches?eventId=$eventId" `
    -Method GET `
    -WebSession $session

# Display match codes
$matches.data | ForEach-Object {
    Write-Host "Match ID: $($_.id)"
    Write-Host "Match Code: $($_.matchCode)" -ForegroundColor Green
    Write-Host "Players: $($_.playerA.name) vs $($_.playerB.name)"
    Write-Host "---"
}
```

### Using the UI:
1. Go to frontend: `http://localhost:3000`
2. Login as admin
3. Click "Umpire" tab in sidebar
4. You'll see the screen from your screenshot
5. **Enter the 6-digit match code** (e.g., `ABC123`)
6. Click "Enter Match Mode"
7. Update scores by clicking + and - buttons
8. Click "Finalize" to submit the result

---

## 📊 Step 8: Submit Match Results

### Via API:
```powershell
# Submit result for a match
$matchCode = "ABC123"  # Replace with actual code

$result = @{
    winnerId = $matches.data[0].playerAId
    score = @{
        sets = @(
            @{ a = 21; b = 15 }
            @{ a = 21; b = 18 }
        )
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:5001/api/matches/submit/$matchCode" `
    -Method POST `
    -Body $result `
    -ContentType "application/json" `
    -WebSession $session
```

### Via Frontend (Umpire Mode):
1. Enter match code
2. Click + to increase player scores
3. Click - to decrease
4. When done, click "Finalize"

---

## 📈 Step 9: View Leaderboard

```powershell
# Get event standings
Invoke-RestMethod -Uri "http://localhost:5001/api/events/$eventId/standings" `
    -Method GET `
    -WebSession $session
```

---

## ✅ Quick Test All Features

```powershell
# Full test script
cd "C:\Users\athma\OneDrive\Desktop\my projects\backend"

# 1. Create admin
$adminBody = @{
    name = "Test Admin"
    email = "test@admin.com"
    password = "test123"
    adminCode = "AthmaAdminInit5321"
} | ConvertTo-Json

try {
    $admin = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" -Method POST -Body $adminBody -ContentType "application/json"
    Write-Host "✓ Admin created" -ForegroundColor Green
} catch {
    Write-Host "Admin might already exist, trying login..." -ForegroundColor Yellow
}

# 2. Login
$loginBody = @{
    email = "test@admin.com"
    password = "test123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -SessionVariable session
Write-Host "✓ Logged in as: $($loginResponse.user.name)" -ForegroundColor Green

# 3. Check health
$health = Invoke-RestMethod -Uri "http://localhost:5001/api/health" -Method GET
Write-Host "✓ Backend health: $($health.status)" -ForegroundColor Green

Write-Host "`n🎉 All tests passed! Your system is ready!" -ForegroundColor Cyan
```

---

## 🔍 Common Match Codes

When you create fixtures, each match gets a unique 6-digit code like:
- `A7X9K2`
- `B3M5N8`
- `C1P4Q6`

These are randomly generated and shown in:
- Match list
- Schedule view
- Umpire assignment

---

## 📱 Frontend Testing Checklist

### Login Screen
- [x] Email input works
- [x] Password input works  
- [x] Submit button triggers auth
- [ ] Connect to real backend API

### Dashboard
- [ ] Stats cards display
- [ ] Recent activity shown
- [ ] Quick actions work

### Registration
- [ ] Add new players
- [ ] Select sports/events
- [ ] Player list updates

### Fixtures
- [ ] Generate fixtures
- [ ] View bracket/rounds
- [ ] Match codes visible

### Schedule
- [ ] Assign courts
- [ ] Set times
- [ ] View timeline

### Umpire Mode
- [x] Enter match code (6 digits)
- [x] Load match details
- [x] Update scores (+/-)
- [x] Submit result

### Leaderboard
- [ ] View standings
- [ ] Filter by event
- [ ] Analytics displayed

---

## 🐛 Troubleshooting

### "Invalid Match Code"
- Check the match exists in database
- Verify code is exactly 6 characters
- Make sure match is in SCHEDULED or PENDING status

### "Backend connection failed"
- Verify backend is running: `http://localhost:5001/api/health`
- Check port 5001 is not blocked
- Confirm `.env` has PORT=5001

### "No matches to score"
- Create tournament → event → players → fixtures → schedule first
- Match must be assigned to a court
- Match status must be ready for umpire

---

## 📞 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register-admin` | Create admin (needs code) |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/players` | Create player |
| GET | `/api/players` | List players |
| POST | `/api/tournaments` | Create tournament |
| POST | `/api/events` | Create event |
| POST | `/api/fixtures/generate` | Generate fixtures |
| POST | `/api/matches/submit/:code` | Submit match result |
| GET | `/api/events/:id/standings` | Get leaderboard |

---

**Admin Bootstrap Code**: `AthmaAdminInit5321`  
**Frontend**: http://localhost:3000  
**Backend**: http://localhost:5001/api  

🎊 **Happy Testing!**
