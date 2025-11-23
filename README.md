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
- PostgreSQL >= 14.0
- Git

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/yourusername/xsprint-backend.git
cd xsprint-backend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up environment variables:**

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xsprint?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRES_IN="1d"

# Admin Bootstrap
ADMIN_BOOTSTRAP_CODE="your-secret-admin-code"
ALLOW_MULTIPLE_ADMINS="false"

# Server
NODE_ENV="development"
PORT=5000

# Frontend (for CORS)
FRONTEND_URL="http://localhost:3000"
```

**4. Set up database:**
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed sample data
npm run db:seed
```

**5. Create admin user:**
```bash
npm run bootstrap
```

**6. Start development server:**
```bash
npm run dev
```

The server will start at `http://localhost:5000`

**7. Verify installation:**

Visit `http://localhost:5000/api/health` - you should see:
```json
{
  "status": "ok"
}
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

### Deploy to Render (Recommended)

**Quick Deploy:**
1. Push to GitHub
2. Go to [Render Dashboard](https://render.com/dashboard)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Add `FRONTEND_URL` and `ADMIN_BOOTSTRAP_CODE` environment variables

📖 **Full Guide**: [`RENDER_DEPLOYMENT.md`](RENDER_DEPLOYMENT.md)

### Deploy to Vercel

**Quick Deploy:**
```bash
npm install -g vercel
vercel --prod
```

📖 **Full Guide**: [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md)

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
