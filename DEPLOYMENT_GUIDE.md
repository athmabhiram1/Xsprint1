# Backend Deployment Guide

This guide covers deploying your xSPRINT backend to production.

## Prerequisites

- [ ] Frontend deployed (v0/Vercel)
- [ ] PostgreSQL database (we'll set this up)
- [ ] Backend code ready
- [ ] Environment variables documented

---

## Option 1: Railway (Recommended for Socket.IO)

Railway is ideal for your backend because it supports:
- Long-running processes (Socket.IO)
- PostgreSQL database hosting
- Simple deployment from GitHub
- Reasonable free tier

### Step 1: Prepare Your Code

1. **Create `.env.example`** (if not exists):
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.vercel.app
```

2. **Ensure `package.json` has correct scripts**:
```json
{
  "scripts": {
    "build": "prisma generate && tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate deploy"
  }
}
```

### Step 2: Deploy to Railway

1. **Sign up**: Go to [railway.app](https://railway.app) and sign in with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your backend repository

3. **Add PostgreSQL Database**:
   - In your project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create a database and provide `DATABASE_URL`

4. **Configure Environment Variables**:
   - Go to your backend service → "Variables"
   - Add these variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}  (auto-linked)
     JWT_SECRET=<generate-a-secure-random-string>
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

5. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Install Command: `npm install`

6. **Deploy**:
   - Railway will automatically deploy
   - Run migrations: In the service settings, add a deploy command:
     ```
     npm run build && npx prisma migrate deploy && npm start
     ```

7. **Get Your Backend URL**:
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Update your frontend to use this URL

---

## Option 2: Render (Alternative)

Render is another excellent option with a generous free tier.

### Step 1: Prepare Database

1. **Create PostgreSQL Database**:
   - Go to [render.com](https://render.com)
   - Dashboard → "New" → "PostgreSQL"
   - Choose free tier
   - Copy the "External Database URL"

### Step 2: Deploy Backend

1. **Create Web Service**:
   - Dashboard → "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: xsprint-backend
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

2. **Environment Variables**:
   ```
   DATABASE_URL=<your-render-postgres-url>
   JWT_SECRET=<generate-secure-string>
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete

---

## Option 3: Vercel (Serverless)

> ⚠️ **Warning**: Vercel serverless functions have limitations:
> - 10-second execution limit (Hobby plan)
> - Cold starts
> - Socket.IO may not work reliably

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Create `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

### Step 3: Deploy

```bash
vercel --prod
```

### Step 4: Add Environment Variables

In Vercel dashboard:
- Settings → Environment Variables
- Add `DATABASE_URL`, `JWT_SECRET`, etc.

---

## Database Setup (All Options)

### Option A: Neon (Serverless PostgreSQL)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use as `DATABASE_URL`

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (Transaction pooler for serverless)
5. Use as `DATABASE_URL`

### Option C: Railway/Render Built-in

Both platforms offer PostgreSQL databases included with your deployment.

---

## Post-Deployment Checklist

### 1. Run Database Migrations

```bash
# If using Railway/Render, add to start command:
npx prisma migrate deploy

# Or run manually via CLI:
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### 2. Create Admin User

```bash
# SSH into your deployment or run locally against production DB:
npm run bootstrap
```

### 3. Update Frontend Environment Variables

Update your frontend (Vercel) environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend-url.railway.app
```

Then redeploy your frontend.

### 4. Test Your Deployment

1. **Health Check**: Visit `https://your-backend-url/health`
2. **API Test**: Try logging in via frontend
3. **Socket.IO**: Test real-time features
4. **Database**: Verify data persistence

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | `super-secret-key-min-32-chars` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` (auto-set by platforms) |
| `FRONTEND_URL` | Frontend URL for CORS | `https://app.vercel.app` |

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection locally:
npx prisma db pull

# Check connection string format:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### Build Failures

```bash
# Ensure all dependencies are in dependencies, not devDependencies:
npm install --save @prisma/client prisma
```

### CORS Errors

Update `src/app.ts` to include your frontend URL:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Socket.IO Not Working

- Ensure your platform supports WebSockets (Railway ✅, Render ✅, Vercel ⚠️)
- Check CORS configuration for Socket.IO
- Verify frontend is using correct WebSocket URL

---

## Recommended: Railway Deployment

For your specific use case (Socket.IO + PostgreSQL), I recommend **Railway**:

1. **Quick Setup**: 5-10 minutes
2. **Database Included**: PostgreSQL with automatic `DATABASE_URL`
3. **WebSocket Support**: Full Socket.IO support
4. **Free Tier**: $5 credit/month (enough for development)
5. **Easy Scaling**: Upgrade when needed

### Quick Start with Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL
railway add --database postgres

# 5. Deploy
railway up
```

---

## Next Steps

1. Choose your deployment platform
2. Set up PostgreSQL database
3. Configure environment variables
4. Deploy backend
5. Run migrations
6. Update frontend API URL
7. Test end-to-end

Need help with any specific step? Let me know!
