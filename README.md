# xSPRINT Tournament Management System

A full-stack tournament management application for organizing and managing sports tournaments with real-time updates, live scoring, and comprehensive analytics.

## 🚀 Features

- **Player Registration** - Easy athlete onboarding with multi-sport support
- **Automated Fixture Generation** - Multiple tournament formats (Knockout, Round Robin, Swiss, etc.)
- **Live Scoring** - Real-time match score updates with umpire interface  
- **Leaderboards & Analytics** - Track performance and standings
- **Multi-Sport Support** - Tennis, Badminton, Table Tennis, Squash, and more
- **Real-time Updates** - WebSocket integration for live data
- **Secure Authentication** - JWT-based auth with role-based access
- **Production Ready** - Deployment configs for Vercel

## 📁 Project Structure

```
xsprint1/
├── backend/          # Node.js/Express/TypeScript API
├── frontend/         # React/TypeScript/Vite SPA
└── README.md         # This file
```

## 🛠️ Technology Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (Neon) + Prisma ORM
- JWT Authentication + Socket.IO
- Zod Validation

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS
- React Context + Fetch API

## 🚦 Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma generate && npx prisma migrate deploy
npm run dev
```

### Frontend
```bash
cd frontend
npm install  
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

## 🌐 Deployment

See `DEPLOYMENT-CHECKLIST.md` for complete deployment instructions.

## 📄 License

MIT License

## 👥 Author

**Athma Bhiram** - [athmabhiram1](https://github.com/athmabhiram1)

---

**Repository:** https://github.com/athmabhiram1/Xsprint1
