xSPRINT — Tournament Management System




















A modern full-stack tournament management platform for organizing, scheduling, and tracking sports tournaments with real-time updates, automated fixtures, live scoring, and analytics.

🌐 Live Deployment

**Frontend:** https://frontend-lwno2jwc1-athmabhiram-gmailcoms-projects.vercel.app  
**Backend:** https://xsprint1-1b.onrender.com  
**Backend Health:** https://xsprint1-1b.onrender.com/api/health

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

### Frontend — Vercel
1. Connect GitHub repo
2. Add environment variable:
   ```
   VITE_API_URL=https://xsprint1-1b.onrender.com
   ```
3. Deploy

### Backend — Render (Production)
**Current deployment:** https://xsprint1-1b.onrender.com

1. Create new Web Service pointing to `backend/` directory
2. **Build Command:**
   ```bash
   cd backend && npm install && npm run build
   ```
3. **Start Command:**
   ```bash
   cd backend && npx prisma migrate deploy && node dist/index.js
   ```
4. **Environment Variables:** (copy from `backend/.env`)
   ```
   DATABASE_URL=<neon pooled connection>
   DIRECT_URL=<neon direct connection>
   JWT_SECRET=<your secret>
   JWT_EXPIRES_IN=7d
   ADMIN_BOOTSTRAP_CODE=<your code>
   ALLOW_MULTIPLE_ADMINS=false
   BCRYPT_SALT_ROUNDS=10
   NODE_ENV=production
   FRONTEND_URL=<your-frontend-url>
   ALLOWED_ORIGINS=<your-frontend-url>,http://localhost:3000,http://localhost:3001
   GEMINI_API_KEY=<optional>
   ```
5. Enable Auto-Deploy on git push
6. Verify: `curl https://xsprint1-1b.onrender.com/api/health`

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
