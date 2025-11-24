xSPRINT — Tournament Management System




















A modern full-stack tournament management platform for organizing, scheduling, and tracking sports tournaments with real-time updates, automated fixtures, live scoring, and analytics.

🌐 Live Deployment

https://xsprint1f2.vercel.app/

🚀 Features

Player Registration — Smooth onboarding for multi-sport tournaments

Automated Fixture Generation — Knockout, Round Robin, Swiss, League formats

Live Scoring System — Real-time umpire scoring + instant updates

Live Leaderboards — Auto-updating rankings and stats

Multi-Sport Support — Tennis, Badminton, Table Tennis, Squash, Pickleball & more

Real-Time Sync — Powered by Socket.IO

Role-Based Access — Admin, Umpire, and Player modes

Secure Authentication — JWT + refresh tokens

# xSPRINT — Tournament Management System

A modern full-stack tournament management platform for organizing, scheduling, and tracking sports tournaments. The system provides real-time updates, automated fixture generation, live scoring, analytics and role-based access control.

---

## Live (production)

- Frontend: https://xsprint1f2.vercel.app/
- Backend: https://xsprint1-1b.onrender.com
- Backend health: https://xsprint1-1b.onrender.com/api/health

---

## Table of contents

- Overview
- Features
- Tech stack
- Project layout
- Local development
- Configuration (env variables)
- Database & migrations
- API overview
- Testing & utilities
- Contributing
- License

---

## Overview

xsprint is built for tournament organizers who need a web-based console to manage players, fixtures, schedules, and live scoring. It supports multiple tournament formats and delivers live updates via WebSockets (Socket.IO).

---

## Key features

- Multi-role authentication (Admin, Organizer, Viewer)
- JWT authentication with httpOnly cookie support
- Player, Club and Tournament CRUD
- Automated fixture generation (Round robin, Knockout, Swiss-like patterns)
- Match scheduling, rescheduling and withdrawals
- Live scoring and real-time leaderboards using Socket.IO
- Admin bootstrap flow to create the first admin
- Rate-limited auth endpoints for protection against brute force

---

## Tech stack

- Backend: Node.js, Express, TypeScript
- ORM: Prisma (Type-safe DB client)
- DB: PostgreSQL (Neon recommended)
- Real-time: Socket.IO
- Frontend: React + Vite + TypeScript + Tailwind CSS

---

## Project layout

```
xsprint1/
├── backend/           # Express API (TypeScript)
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/          # React + Vite SPA
│   ├── src/
│   └── package.json
└── README.md
```

---

## Local development

Prerequisites: Node.js 18+, pnpm/npm/yarn, PostgreSQL (or a Neon DB connection)

Backend (development):

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill DATABASE_URL, JWT_SECRET and other variables
npx prisma generate
npx prisma migrate dev
npm run dev
```

Frontend (development):

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_URL to your backend (e.g. http://localhost:5001)
npm run dev
```

Notes:

- `npm run dev` in backend runs the ts-node/ts-node-dev server configured for local development.
- Frontend picks up `VITE_API_URL` at build time. In development, a `.env.local` with `VITE_API_URL` pointing to your backend is recommended.

---

## Configuration (environment variables)

Keep secrets out of git. Copy `backend/.env.example` and `frontend/.env.example` and provide values.

Important backend variables (examples):

- `DATABASE_URL` — Neon/Postgres connection string (pooled)  
- `DIRECT_URL` — direct DB connection (used for migrations)  
- `JWT_SECRET` — long random string  
- `ADMIN_BOOTSTRAP_CODE` — code to create the initial admin  
- `ALLOW_MULTIPLE_ADMINS` — `false` by default  
- `BCRYPT_SALT_ROUNDS` — e.g. `10`  
- `ALLOWED_ORIGINS` — comma-separated allowed origins for CORS

Important frontend variables:

- `VITE_API_URL` — base backend URL (the client app appends `/api` if needed)
- `VITE_WS_URL` — websocket URL (if applicable)

---

## Database & migrations

This project uses Prisma. For local development run:

```bash
npx prisma generate
npx prisma migrate dev
```

To run migrations in production, use:

```bash
npx prisma migrate deploy
```

Prisma schema is in `backend/prisma/schema.prisma`.

---

## Minimal API overview

The backend exposes a REST API under the `/api` prefix. Example endpoints:

- `POST /api/auth/login` — authenticate (email + password)
- `POST /api/auth/register` — register user
- `POST /api/auth/register-admin` — bootstrap admin (requires `ADMIN_BOOTSTRAP_CODE`)
- `GET /api/health` — health check
- `GET /api/tournaments` — list tournaments
- `POST /api/events` — create event (auth required)

For local manual testing use the provided REST snippets at `backend/test-api.rest` and `backend/test-auth.rest`.

---

## Testing & utilities

- REST files for quick tests: `backend/test-api.rest`, `backend/test-auth.rest`  
- Admin bootstrap script: `backend/scripts/bootstrap-admin.ts`  

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Implement and test locally
4. Open a PR with a clear description of changes

Please follow existing code style and run tests where applicable.

---

## License

MIT — see `LICENSE` if included

---

## Author

Athmabhiram — https://github.com/athmabhiram1

