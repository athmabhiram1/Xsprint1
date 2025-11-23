# 🎯 HOW TO TEST FIXTURE GENERATOR & SCHEDULER

## 📝 Quick Summary

Your backend is running on **http://localhost:5001**  
Your frontend is running on **http://localhost:3000**

---

## ✅ STEP-BY-STEP TESTING GUIDE

### 1️⃣ **Open Frontend**
Open your browser: `http://localhost:3000`

### 2️⃣ **Login**
- Email: `admin@test.com` (or any email)
- Password: `test123` (or any password)  
- Click "Sign In"

*Note: Currently using mock auth. Backend integration is ready.*

### 3️⃣ **Add Players** (Registration Tab)
1. Click **"Registration"** in the sidebar
2. Fill in player details:
   - Name: Alex Rivera
   - Club: Thunder FC
   - Select a sport/event
3. Click **"Register Player"**
4. Repeat to add at least 4-8 players

### 4️⃣ **Generate Fixtures** (Fixtures Tab)
1. Click **"Fixtures"** in the sidebar
2. Select format: **"Knockout"** or **"Round Robin"**
3. Click **"Generate Fixtures"**
4. You'll see:
   - Match brackets
   - **6-digit match codes** (e.g., `A7X9K2`)
   - Player matchups

### 5️⃣ **Schedule Matches** (Schedule Tab)
1. Click **"Schedule"** in the sidebar
2. For each match:
   - Assign a **court** (dropdown)
   - Set **time** and **date**
3. Matches organize by court automatically

### 6️⃣ **Enter Match Code** (Umpire Tab)
1. Click **"Umpire"** in the sidebar  
2. You'll see the screen from your screenshot:
   ```
   ┌─────────────────────────────┐
   │     Umpire Access           │
   │                             │
   │  Enter 6-digit match code   │
   │  ┌─────────────────┐        │
   │  │  [ ][ ][ ][ ][ ][ ]  │        │
   │  └─────────────────┘        │
   │                             │
   │  [Enter Match Mode →]       │
   └─────────────────────────────┘
   ```

3. **Type the 6-digit code** from step 4 (e.g., `A7X9K2`)
4. Click **"Enter Match Mode"**

### 7️⃣ **Live Scoring**
Once you enter the code:
- See both players with their scores
- Click **+** buttons to increase scores
- Click **−** buttons to decrease scores
- Click **"Finalize"** when done

### 8️⃣ **View Leaderboard**
1. Click **"Leaderboard"** in the sidebar
2. See standings updated with match results

---

## 🔥 WHAT TO ENTER AS MATCH CODE

Match codes are **automatically generated** when you create fixtures. They look like:
- `A7X9K2`
- `B3M5N8`
- `C1P4Q6`

You can find them in the **Fixtures** or **Schedule** view.

---

## 🎮 BACKEND API TESTING (Optional)

If you want to test via API directly:

### Create Admin:
```powershell
$admin = @{
    name = "Admin"
    email = "admin@xsprint.com"
    password = "admin123"
    adminCode = "AthmaAdminInit5321"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register-admin" `
    -Method POST -Body $admin -ContentType "application/json"
```

### Login:
```powershell
$login = @{
    email = "admin@xsprint.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" `
    -Method POST -Body $login -ContentType "application/json" `
    -SessionVariable session
```

### Create Event:
```powershell
$event = @{
    name = "U18 Singles"
    sport = "Badminton"
    type = "KNOCKOUT"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/events" `
    -Method POST -Body $event `
    -ContentType "application/json" -WebSession $session
```

### Generate Fixtures:
```powershell
# Replace EVENT_ID with actual ID from above
Invoke-RestMethod -Uri "http://localhost:5001/api/events/EVENT_ID/fixtures/generate" `
    -Method POST -WebSession $session
```

---

## 📊 AVAILABLE ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register-admin` | POST | Create admin |
| `/api/auth/login` | POST | Login |
| `/api/events` | POST | Create event |
| `/api/events/:id/fixtures/generate` | POST | Generate fixtures |
| `/api/schedule/events/:id/generate` | POST | Generate schedule |
| `/api/matches` | GET | Get matches |
| `/api/matches/result` | POST | Submit match result |

---

## 🎯 EXPECTED WORKFLOW

1. **Registration** → Add players to the system
2. **Fixtures** → Generate match brackets  
3. **Schedule** → Assign courts & times
4. **Umpire** → Enter match codes & score live
5. **Leaderboard** → View rankings

---

## ✨ KEY FEATURES WORKING

✅ Login/Authentication  
✅ Player Registration  
✅ Fixture Generation (Knockout/Round Robin)  
✅ Match Code Generation  
✅ Live Scoring Interface  
✅ Schedule Management  
✅ Leaderboard Display  
✅ Real-time Updates  

---

## 🐛 TROUBLESHOOTING

**"Invalid Match Code"**  
→ Make sure you generated fixtures first  
→ Code must be exactly 6 characters  
→ Codes are case-sensitive

**"No matches found"**  
→ Create an event first  
→ Add players  
→ Generate fixtures

**Backend not responding**  
→ Check `http://localhost:5001/api/health`  
→ Ensure backend terminal shows "running on port 5001"

---

**🎉 That's it! You're ready to test!**

Open `http://localhost:3000` and start with Registration → Fixtures → Umpire.
