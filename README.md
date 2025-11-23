# xSPRINT - Sports Tournament Management System

A modern, full-stack tournament management platform for managing sports tournaments, fixtures, schedules, and leaderboards.

## 🏆 Features

- **Multi-Sport Support**: Tennis, Badminton, Squash, Table Tennis
- **5 Tournament Formats**: Knockout, Round Robin, Groups → Playoff, Swiss System, Double Elimination
- **Real-time Updates**: Live match scores and leaderboards
- **Fixture Management**: Automated bracket generation and scheduling
- **User Roles**: Admin and Umpire access levels
- **Responsive UI**: Modern design with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- Node.js 18+ + TypeScript
- Express.js
- PostgreSQL (Neon)
- Prisma ORM
- JWT Authentication
- Socket.IO

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Lucide React Icons

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd backend
npm install
cd frontend && npm install && cd ..
```

2. **Configure environment variables:**

Backend `.env`:
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_min_32_chars
ADMIN_BOOTSTRAP_CODE=AthmaAdminInit5321
PORT=5001
```

Frontend `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_WS_URL=http://localhost:5001
```

3. **Setup database:**
```bash
npx prisma migrate deploy
npx prisma generate
```

4. **Start servers:**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

5. **Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api

## 🔑 First Login

1. Go to http://localhost:3000
2. Login with default credentials:
   - Email: `admin@test.com`
   - Password: `Admin123!`

## 📖 API Documentation

### Authentication
- `POST /api/auth/register-admin` - Register admin (requires bootstrap code)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tournaments
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/:id` - Get tournament

### Events
- `POST /api/events` - Create event
- `POST /api/events/register` - Register player
- `GET /api/events/:id/registrations` - Get registrations

### Fixtures
- `POST /api/events/:eventId/fixtures/generate` - Generate fixtures
- `GET /api/fixtures/:eventId` - Get fixtures

### Matches
- `GET /api/matches` - List matches
- `PATCH /api/matches/:id/score` - Update score

## 🚀 Deployment

### Backend (Railway/Render/Heroku)

1. Build: `npm run build`
2. Set environment variables (production)
3. Run migrations: `npm run prisma:deploy`
4. Start: `npm start`

### Frontend (Vercel/Netlify)

1. Build: `cd frontend && npm run build`
2. Set env vars:
   ```
   VITE_API_URL=https://your-backend.com/api
   VITE_WS_URL=https://your-backend.com
   ```
3. Deploy `frontend/dist` folder

## 📁 Project Structure

```
xsprint/
├── src/                  # Backend
│   ├── controllers/      # API controllers
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── middleware/      # Auth, validation
│   └── lib/             # Utilities
├── prisma/              # Database schema
├── frontend/            # React app
│   └── src/
│       ├── components/  # UI components
│       ├── views/       # Pages
│       ├── context/     # State
│       └── api/         # API client
└── README.md
```

## 🧪 Available Scripts

### Backend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm start            # Production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
npx kill-port 5001
```

**Database connection error:**
- Check DATABASE_URL
- Run migrations: `npx prisma migrate deploy`

**CORS errors:**
- Update CORS_ORIGINS in backend .env
- Verify VITE_API_URL matches backend

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request
