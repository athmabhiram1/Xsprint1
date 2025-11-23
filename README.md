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
- [Deployment Status](#-deployment-status)
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
- 🏆 Multi-tournament management  
- 🎮 Smart fixture generation (Knockout / Round Robin)  
- ⚡ Real-time match updates via Socket.IO  
- 🔐 Secure authentication & RBAC  
- 📊 Live analytics & leaderboards  
- 🎫 Match code verification system  

---

## 🌐 Deployment Status

> Deployment is in-progress. Current status:

- ✅ **Frontend is live:**  
  **https://xsprint1a.vercel.app/**

- ❌ **Backend is NOT deployed yet**  
  Runs locally at:  
  `http://localhost:5001`

This section will be updated once the backend is deployed (Render/Vercel).

---

## ✨ Features

### Tournament Management
- Create/manage tournaments  
- Multi-sport support  
- Knockout / Round Robin / Double Elimination  
- Venue & court scheduling  
- Locker assignments  

### Player & Registration
- Player profiles with stats  
- Club affiliations  
- Seeding system  
- ELO-based ranking  
- Category & gender filters  

### Match Management
- Automated fixture generation  
- Real-time match updates  
- Scoring + metadata  
- Umpire verification  
- Secure match code system  
- Audit logging  

### Real-Time Engine
- Live leaderboard  
- WebSocket updates  
- Match completion broadcast  
- Automatic client synchronization  

### Security & Performance
- JWT authentication  
- Refresh tokens  
- Role-based access  
- Zod validation  
- Helmet + rate limiting  
- Winston logging  
- Audit trails  

---

## 🛠 Tech Stack

### Core
- Node.js 18+
- Express.js
- TypeScript
- PostgreSQL 14+
- Prisma ORM

### Libraries
- jsonwebtoken, bcryptjs  
- Socket.IO  
- Zod  
- Helmet, express-rate-limit  
- Winston logger  
- node-cache  

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18  
- npm >= 9  
- PostgreSQL (NeonDB recommended)  
- Git  

### Installation

```bash
git clone https://github.com/athmabhiram1/Xsprint1.git
cd Xsprint1
npm install
Setup Environment
bash
Copy code
copy .env.example .env       # Windows
# or
cp .env.example .env         # Mac/Linux
Update .env with database + JWT secrets.

Initialize Database
bash
Copy code
npx prisma generate
npx prisma migrate deploy
npm run db:seed   # optional
Run Server
bash
Copy code
npm run dev      # development
npm run build
npm start        # production
Backend runs at:
http://localhost:5001

Start Frontend (optional)
bash
Copy code
cd frontend
npm install
npm run dev
Frontend runs at:
http://localhost:3001

📁 Project Structure
pgsql
Copy code
xsprint-backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── lib/
│   ├── utils/
│   ├── app.ts
│   └── index.ts
├── scripts/
│   └── bootstrap-admin.ts
├── frontend/
├── .env.example
├── render.yaml
├── vercel.json
└── README.md
📚 API Documentation
Base URLs
javascript
Copy code
Development: http://localhost:5001
Production: <coming soon>
Authentication Endpoints
bash
Copy code
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me
Tournament API
bash
Copy code
GET    /api/tournaments
POST   /api/tournaments
GET    /api/tournaments/:id
PUT    /api/tournaments/:id
DELETE /api/tournaments/:id
Events
bash
Copy code
GET    /api/events
POST   /api/events
GET    /api/events/:id
PUT    /api/events/:id
GET    /api/events/:id/standings
GET    /api/events/:id/analytics
Players
bash
Copy code
GET    /api/players
POST   /api/players
GET    /api/players/:id
PUT    /api/players/:id
Matches
bash
Copy code
GET    /api/matches
GET    /api/matches/:id
POST   /api/matches/:id/result
POST   /api/matches/verify-code
Fixtures
bash
Copy code
POST   /api/fixtures/generate
GET    /api/fixtures/:eventId
WebSocket Events
js
Copy code
socket.on('MATCH_COMPLETED', data => console.log(data));
socket.on('LEADERBOARD_UPDATED', data => console.log(data));
🚀 Deployment
Production Environment Variables
env
Copy code
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
ADMIN_BOOTSTRAP_CODE="AthmaAdminInit5321"
ALLOW_MULTIPLE_ADMINS="false"
NODE_ENV="production"
PORT=5001
FRONTEND_URL="https://xsprint1a.vercel.app"
ALLOWED_ORIGINS="https://xsprint1a.vercel.app"
Backend Deployment (Render)
Create a Web Service

Build Command:
npm install && npx prisma generate && npx prisma migrate deploy && npm run build

Start Command:
npm start

Add env vars

Deploy

Frontend Deployment (Vercel)
Create frontend/.env.production:

env
Copy code
VITE_API_URL=https://your-backend-url
VITE_WS_URL=wss://your-backend-url
Then:

bash
Copy code
cd frontend
npm run build
npx vercel --prod
🔐 Environment Variables
Variable	Required	Description
DATABASE_URL	✅	PostgreSQL connection
JWT_SECRET	✅	JWT signing key
ADMIN_BOOTSTRAP_CODE	✅	Admin creation code
FRONTEND_URL	✅	CORS allowed origin
PORT	optional	Default: 5001

📜 Scripts
bash
Copy code
npm run dev
npm run build
npm start

npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
npm run db:seed

npm run bootstrap
npm test
🤝 Contributing
Fork repo

Create feature branch

Commit changes

Push branch

Open PR

📄 License
MIT License.

<div align="center">
Made with ❤️ for tournament organizers worldwide
⬆ Back to Top

</div> ```
