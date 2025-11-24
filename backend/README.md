# xSPRINT - Smart Tournament Engine Backend

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A powerful, scalable tournament management system with real-time updates, intelligent fixture generation, and comprehensive match management.**

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## 🎯 Overview

**xSPRINT** is a comprehensive tournament management backend built with Node.js, Express, and TypeScript. It provides a robust API for managing tournaments, events, players, matches, and real-time updates through WebSockets.

### Key Capabilities

- 🏆 **Multi-Tournament Management** - Handle multiple tournaments with different formats
- 🎮 **Smart Fixture Generation** - Automated bracket creation for Knockout and Round Robin formats
- ⚡ **Real-Time Updates** - Live match results and leaderboard updates via Socket.IO
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control (RBAC)
- 📊 **Analytics & Leaderboards** - Comprehensive statistics and standings
- 🎫 **Match Code System** - Secure result submission with umpire verification

---

## ✨ Features

### Tournament Management
- Create and manage multiple tournaments
- Support for various sports (Badminton, Basketball, Cricket, Football, Tennis, etc.)
- Flexible event configuration (Knockout, Round Robin, Double Elimination)
- Court/venue scheduling
- Locker assignments for applicable sports

### Player & Registration
- Player profiles with stats tracking
- Club affiliations
- Event registration with seeding
- ELO-based ranking system
- Gender and category-based events

### Match Management
- Automated fixture generation with fairness optimization
- Real-time match status updates
- Score tracking with detailed metadata
- Umpire assignment and verification
- Match code security system
- Result audit logging

### Real-Time Features
- Live leaderboard updates
- Match completion notifications
- WebSocket-based event streaming
- Automatic client synchronization

### Security & Performance
- JWT authentication with refresh tokens
- Role-based access control (Admin, Umpire, Organizer, Viewer)
- Rate limiting on sensitive endpoints
- Request validation with Zod schemas
- Comprehensive error handling
- Audit logging for critical operations

---

## 🛠 Tech Stack

### Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 6.19

### Key Libraries
- **Authentication**: jsonwebtoken, bcryptjs
- **Real-time**: Socket.IO 4.8
- **Validation**: Zod 4.1
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston
- **Caching**: node-cache
- **Date Handling**: date-fns

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 14+ (NeonDB recommended for cloud)
- Git

### Installation & Setup

**1. Clone the repository:**
```bash
git clone https://github.com/athmabhiram1/Xsprint1.git
cd Xsprint1
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up environment variables:**

Create a `.env` file in the root directory:
```bash
# On Windows (PowerShell)
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database (NeonDB PostgreSQL)
DATABASE_URL="postgresql://user:password@host.region.neon.tech/xsprint?sslmode=require"
DIRECT_URL="postgresql://user:password@host.region.neon.tech/xsprint?sslmode=require"

# Authentication
JWT_SECRET="8f32a0b9c2b445df8ca92781f33ac86f7c1f55b4976a991efb9dc7e4ca91b8da"
JWT_EXPIRES_IN="7d"

# Admin Bootstrap
ADMIN_BOOTSTRAP_CODE="AthmaAdminInit5321"
ALLOW_MULTIPLE_ADMINS="false"

# Server
NODE_ENV="development"
PORT=5001

# Frontend (for CORS)
FRONTEND_URL="http://localhost:3001"
ALLOWED_ORIGINS="http://localhost:3001,http://localhost:5173"
```

**4. Set up database:**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate deploy

# (Optional) Seed sample data
npm run db:seed
```

**5. Create admin user:**

The first user to register with the admin bootstrap code becomes an admin:
- Email: `admin@test.com`
- Password: `Admin123!`
- Admin Code: `AthmaAdminInit5321`

Or run the bootstrap script:
```bash
npm run bootstrap
```

**6. Start the backend server:**
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The backend server will start at `http://localhost:5001`

**7. Start the frontend (optional):**

If you want to run the complete application:
```bash
# Open a new terminal
cd frontend

# Install frontend dependencies
npm install

# Start frontend dev server
npm run dev
```

The frontend will start at `http://localhost:3001`

**8. Verify installation:**

Test the backend health endpoint:
```bash
# Using browser
http://localhost:5001/api/health

# Using curl (Mac/Linux)
curl http://localhost:5001/api/health

# Using PowerShell (Windows)
Invoke-WebRequest http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "uptime": 123.456
}
```

### Running Both Backend and Frontend Together

**Option 1: Separate Terminals**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option 2: Using npm scripts from root**
```bash
# Install frontend dependencies
npm run frontend:install

# Run frontend dev server
npm run frontend:dev

# Build frontend for production
npm run frontend:build
```

### First-Time Login

1. Open frontend at `http://localhost:3001`
2. Click "Register" or go to `/register`
3. Fill in:
   - Name: `Admin User`
   - Email: `admin@test.com`
   - Password: `Admin123!`
   - Admin Code: `AthmaAdminInit5321`
4. Click "Register" - you're now an admin!

### Common Issues & Solutions

**Database Connection Failed:**
- Ensure DATABASE_URL is correct in `.env`
- Check if NeonDB is accessible
- Verify SSL mode is set to `require`

**Port Already in Use:**
```bash
# Change PORT in .env file
PORT=5002  # or any available port
```

**Prisma Client Not Generated:**
```bash
npx prisma generate
```

**Migration Errors:**
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or push schema without migrations
npx prisma db push
```

---

## 📁 Project Structure

```
xsprint-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Sample data seeder
├── src/
│   ├── controllers/          # Route controllers
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   │   ├── FixtureEngineEnhanced.ts
│   │   ├── LeaderboardService.ts
│   │   └── ScheduleService.ts
│   ├── middleware/           # Express middleware
│   ├── lib/                  # Utilities & helpers
│   ├── utils/                # Helper functions
│   ├── app.ts               # Express app setup
│   └── index.ts             # Entry point
├── scripts/
│   └── bootstrap-admin.ts    # Admin user creation
├── frontend/                 # React frontend (optional)
├── .env.example              # Environment template
├── render.yaml               # Render deployment config
├── vercel.json               # Vercel deployment config
└── README.md                 # This file
```

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000
Production: https://your-backend.onrender.com
```

### Authentication

All protected endpoints require a JWT token:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
```http
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login
POST   /api/auth/refresh      # Refresh token
GET    /api/auth/me           # Get current user
```

#### Tournaments
```http
GET    /api/tournaments        # List all tournaments
POST   /api/tournaments        # Create tournament (Admin)
GET    /api/tournaments/:id    # Get tournament details
PUT    /api/tournaments/:id    # Update tournament (Admin)
DELETE /api/tournaments/:id    # Delete tournament (Admin)
```

#### Events
```http
GET    /api/events             # List events
POST   /api/events             # Create event (Admin)
GET    /api/events/:id         # Get event details
PUT    /api/events/:id         # Update event (Admin)
GET    /api/events/:id/standings        # Get standings
GET    /api/events/:id/analytics        # Get analytics (Admin)
```

#### Players
```http
GET    /api/players            # List players
POST   /api/players            # Register player (Admin)
GET    /api/players/:id        # Get player details
PUT    /api/players/:id        # Update player (Admin)
```

#### Matches
```http
GET    /api/matches            # List matches
GET    /api/matches/:id        # Get match details
POST   /api/matches/:id/result # Submit result (Umpire)
POST   /api/matches/verify-code # Verify match code
```

#### Fixtures
```http
POST   /api/fixtures/generate  # Generate fixtures (Admin)
GET    /api/fixtures/:eventId  # Get event fixtures
```

### WebSocket Events

Connect to Socket.IO:
```javascript
const socket = io('http://localhost:5000');

socket.on('MATCH_COMPLETED', (data) => {
  console.log('Match completed:', data);
});

socket.on('LEADERBOARD_UPDATED', (data) => {
  console.log('Leaderboard updated:', data);
});
```

---

## 🚀 Deployment

### Prerequisites for Deployment

- GitHub account with your code pushed
- NeonDB PostgreSQL database (free tier available)
- Render or Vercel account (both have free tiers)

### Environment Variables for Production

Create these in your deployment platform:

```env
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/xsprint?sslmode=require"
DIRECT_URL="postgresql://user:password@host.neon.tech/xsprint?sslmode=require"

# Authentication
JWT_SECRET="8f32a0b9c2b445df8ca92781f33ac86f7c1f55b4976a991efb9dc7e4ca91b8da"
JWT_EXPIRES_IN="7d"

# Admin
ADMIN_BOOTSTRAP_CODE="AthmaAdminInit5321"
ALLOW_MULTIPLE_ADMINS="false"

# Server
NODE_ENV="production"
PORT=5001

# Frontend (update after frontend deployment)
FRONTEND_URL="https://your-frontend.vercel.app"
ALLOWED_ORIGINS="https://your-frontend.vercel.app"
```

### Deploy Backend to Render

**Step 1: Create Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `athmabhiram1/Xsprint1`
4. Configure:
   - Name: `xsprint-backend`
   - Region: `Singapore` (or closest to you)
   - Branch: `main`
   - Root Directory: `.` (leave empty)
   - Runtime: `Node`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start Command: `npm start`

**Step 2: Add Environment Variables**

In Render dashboard → Environment tab, add all variables from above.

**Step 3: Deploy**

Click **"Create Web Service"** - Render will automatically deploy.

Your backend URL will be: `https://xsprint-backend.onrender.com`

### Deploy Frontend to Vercel

**Step 1: Update Frontend Environment**

Create `frontend/.env.production`:
```env
VITE_API_URL=https://xsprint-backend.onrender.com
VITE_WS_URL=wss://xsprint-backend.onrender.com
```

**Step 2: Deploy**
```bash
cd frontend
npx vercel --prod
```

Or connect via Vercel dashboard:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import `athmabhiram1/Xsprint1`
4. Configure:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables from above
6. Click **"Deploy"**

**Step 3: Update Backend CORS**

After frontend deployment, update Render environment variables:
```env
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Post-Deployment Steps

**1. Run Database Migrations**

Render automatically runs migrations during build. To manually trigger:
```bash
# In Render dashboard → Shell tab
npx prisma migrate deploy
```

**2. Create Admin User**

Option A: Use the frontend registration with admin code
- Go to your frontend URL
- Register with email, password, and admin code: `AthmaAdminInit5321`

Option B: Use Render Shell
```bash
# In Render dashboard → Shell tab
npm run bootstrap
```

**3. Test Deployment**

Backend health check:
```
https://xsprint-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "uptime": 123.456
}
```

### Monitoring & Logs

**Render:**
- View logs: Dashboard → Logs tab
- Monitor metrics: Dashboard → Metrics tab
- Database connections shown in real-time

**Vercel:**
- View deployment logs: Project → Deployments → Click on deployment
- Monitor performance: Project → Analytics

### Troubleshooting Deployment

**Render Build Fails:**
- Check build logs for errors
- Verify all environment variables are set
- Ensure `DATABASE_URL` is accessible

**Database Connection Errors:**
- Use pooled connection string from NeonDB
- Ensure SSL mode is `require`
- Check Neon database is not paused (free tier sleeps after inactivity)

**CORS Errors After Deployment:**
- Update `FRONTEND_URL` in Render environment variables
- Redeploy backend after updating

**Frontend Can't Connect to Backend:**
- Verify `VITE_API_URL` in frontend `.env.production`
- Check backend is deployed and healthy
- Ensure no typos in URLs

📖 **Detailed Guides:**
- Backend: [`DEPLOY-BACKEND.md`](DEPLOY-BACKEND.md)
- Full Deployment: [`DEPLOYMENT.md`](DEPLOYMENT.md)

---

## 🔐 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | - |
| `JWT_SECRET` | ✅ | Secret for JWT signing (min 32 chars) | - |
| `JWT_EXPIRES_IN` | ⚪ | Token expiration time | `1d` |
| `ADMIN_BOOTSTRAP_CODE` | ✅ | Secret code for admin creation | - |
| `NODE_ENV` | ✅ | Environment mode | `development` |
| `PORT` | ⚪ | Server port | `5000` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS | - |

---

## 📜 Scripts

### Development
```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server
```

### Database
```bash
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run migrations (dev)
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed sample data
```

### Utilities
```bash
npm run bootstrap        # Create admin user
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
```

### Frontend (if included)
```bash
npm run frontend:install # Install frontend deps
npm run frontend:dev     # Start frontend dev server
npm run frontend:build   # Build frontend
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Real-time updates via [Socket.IO](https://socket.io/)

---

<div align="center">

**Made with ❤️ for tournament organizers worldwide**

[⬆ Back to Top](#xsprint---smart-tournament-engine-backend)

</div>
