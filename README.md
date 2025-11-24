xSPRINT — Tournament Management System




















A modern full-stack tournament management platform for organizing, scheduling, and tracking sports tournaments with real-time updates, automated fixtures, live scoring, and analytics.

🌐 Live Deployment

Frontend:
🔗 https://xsprint1f2.vercel.app/

🚀 Features

Player Registration — Smooth onboarding for multi-sport tournaments

Automated Fixture Generation — Knockout, Round Robin, Swiss, League formats

Live Scoring System — Real-time umpire scoring + instant updates

Live Leaderboards — Auto-updating rankings and stats

Multi-Sport Support — Tennis, Badminton, Table Tennis, Squash, Pickleball & more

Real-Time Sync — Powered by Socket.IO

Role-Based Access — Admin, Umpire, and Player modes

Secure Authentication — JWT + refresh tokens

Optimized for Production — Vercel frontend + Neon DB + Prisma ORM

📁 Project Structure
xsprint1/
├── backend/           # Node.js / Express / TypeScript API
├── frontend/          # React / TypeScript / Vite SPA
└── README.md

🛠️ Tech Stack
Backend

Node.js + Express

TypeScript

Prisma ORM

PostgreSQL (Neon)

Socket.IO

Zod schema validation

JWT Authentication

Frontend

React 18

Vite + TypeScript

Tailwind CSS

React Context API

REST + Realtime WebSocket updates

🚦 Quick Start (Local Development)
Backend Setup
cd backend
npm install
cp .env.example .env
# Add DB + JWT credentials
npx prisma generate
npx prisma migrate deploy
npm run dev

Frontend Setup
cd frontend
npm install  
cp .env.example .env.local
# Set VITE_API_URL to your backend URL
npm run dev

🌐 Deployment Guide

Frontend — Vercel
1. Connect GitHub repo
2. Add env var: `VITE_API_URL=https://<backend-domain>/api`
3. Deploy

Backend — Render (Managed Node Environment)
Backend — Railway (Container or Buildpack)
1. Select repository; set root directory to `backend/`.
2. If using buildpack: Build Command `npm install && npm run build` Start Command `npm run start:migrate`.
3. If using Docker: create a `Dockerfile` (see commits history for example) then just deploy; Railway sets `PORT`.
4. Add env vars from `.env.example` (ensure `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `ADMIN_BOOTSTRAP_CODE`).
5. Trigger deploy; first start applies migrations then launches server.
6. Test: `curl https://<railway-domain>/api/health`.

1. Create new Web Service pointing to `backend/` directory (choose Root Directory = backend).
2. Set Build Command:
```
npm install && npm run build
```
3. Set Start Command (runs migrations then starts API):
```
npx prisma migrate deploy && node dist/index.js
```
4. Add Environment Variables:
```
DATABASE_URL=<neon pooled url>
DIRECT_URL=<neon direct url>
JWT_SECRET=<secure long random secret>
ADMIN_BOOTSTRAP_CODE=<admin bootstrap code>
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=<optional>
ALLOWED_ORIGINS=https://<frontend-domain>,https://<render-service-host>
FRONTEND_URL=https://<frontend-domain>
NODE_ENV=production
PORT=10000   # Render provides PORT automatically; fallback only
```
5. Enable Auto-Deploy on commit.
6. Verify health:
```
curl https://<render-service-host>/api/health
```
Should return JSON with `status: UP`.

Backend — VPS (Manual)
1. Install Node 18+ & PostgreSQL client.
2. `npm install && npm run build`
3. `npx prisma migrate deploy`
4. `node dist/index.js`

For full deployment & security checklist see:
📄 `DEPLOYMENT-CHECKLIST.md`

🧭 Roadmap (Planned Features)

Mobile App (React Native)

AI-based match predictions

Automatic scheduling conflict resolver

Team-based tournaments

Tournament highlights dashboard
## Images 
<img width="1899" height="918" alt="image" src="https://github.com/user-attachments/assets/40acbcf1-8292-4203-b619-ac0a987fa59e" />

<img width="1902" height="925" alt="image" src="https://github.com/user-attachments/assets/32831418-d3ff-4045-8ac5-f14a857852d1" />

<img width="1919" height="923" alt="image" src="https://github.com/user-attachments/assets/a60e5b0f-f76d-4ba8-aa84-d54d17b3e64e" />

<img width="1919" height="920" alt="image" src="https://github.com/user-attachments/assets/5c51a53c-9b13-4d4c-8aae-f0499e869ff6" />

<img width="1919" height="922" alt="image" src="https://github.com/user-attachments/assets/b0cc3f3b-6453-44a0-8457-3284b7de545a" />


📄 License

This project is licensed under the MIT License.

👤 Author

Athmabhiram
GitHub: athmabhiram1
