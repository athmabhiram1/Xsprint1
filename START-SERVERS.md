# 🚀 Quick Start Guide

## Start Backend Server
```bash
cd "C:\Users\athma\OneDrive\Desktop\my projects\backend"
npm run dev
```
Backend will run on: http://localhost:5001

## Start Frontend Server
```bash
cd "C:\Users\athma\OneDrive\Desktop\my projects\backend\frontend"
npm run dev
```
Frontend will run on: http://localhost:3000

## Login Credentials

### Admin Account
- **Email**: `admin@test.com`
- **Password**: `Admin123!`

### Umpire/Test Account  
- **Email**: `umpire@test.com`
- **Password**: `123456`

## Tournament Formats Available
1. ✅ **Knockout** - Single elimination bracket
2. ✅ **Round Robin** - Everyone plays everyone
3. ✅ **Groups + Playoff** - Group stage then knockout
4. ✅ **Swiss System** - Pairing based on performance
5. ✅ **Double Elimination** - Winners & losers brackets

## Features
- ✅ Player registration
- ✅ Fixture generation (all 5 formats)
- ✅ Match scheduling
- ✅ Live score updates
- ✅ Leaderboards
- ✅ Real-time updates via WebSocket

## API Endpoints
- Auth: `/api/auth/login`, `/api/auth/register`
- Tournaments: `/api/tournaments`
- Players: `/api/players`
- Events: `/api/events`
- Fixtures: `/api/events/:eventId/fixtures/generate`
- Matches: `/api/matches`
- Schedule: `/api/schedule`
