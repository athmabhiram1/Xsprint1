# 🚀 Backend Deployment Guide - Step by Step

## Deploy to Vercel (Recommended - Easiest)

### Step 1: Go to Vercel
1. Open https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**

### Step 2: Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Find your repository: **Xsprint1**
3. Click **"Import"**

### Step 3: Configure Project
1. **Root Directory:** Leave as root (don't change)
2. **Framework Preset:** Other
3. **Build Command:** `npm run vercel-build`
4. **Output Directory:** `dist`

### Step 4: Add Environment Variables
Click **"Environment Variables"** and add these ONE BY ONE:

```
DATABASE_URL
postgresql://neondb_owner:npg_8SAvORIw6aWo@ep-red-rice-adtzdhy2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

DIRECT_URL
postgresql://neondb_owner:npg_8SAvORIw6aWo@ep-red-rice-adtzdhy2.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET
8f32a0b9c2b445df8ca92781f33ac86f7c1f55b4976a991efb9dc7e4ca91b8da

JWT_EXPIRES_IN
7d

ADMIN_BOOTSTRAP_CODE
AthmaAdminInit5321

ALLOW_MULTIPLE_ADMINS
false

BCRYPT_SALT_ROUNDS
10

NODE_ENV
production

GEMINI_API_KEY
AIzaSyAGRuCJ_BI-WzQ6Vc4WmQmTMdIvclKA3fI

FRONTEND_URL
http://localhost:3000

ALLOWED_ORIGINS
http://localhost:3000,http://localhost:3001
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. You'll see: ✅ **"Congratulations! Your project has been deployed"**
4. Copy your backend URL (looks like: `https://xsprint1.vercel.app` or `https://xsprint1-abc123.vercel.app`)

### Step 6: Test Backend
Visit: `https://your-backend-url.vercel.app/api/health`

Should see:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "...",
    "uptime": 123
  }
}
```

---

## Alternative: Deploy to Railway (More Features)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click **"Login with GitHub"**
3. Authorize Railway

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **Xsprint1** repository
4. Click on the service name

### Step 3: Add Environment Variables
Click **"Variables"** tab and add all the variables from above

### Step 4: Configure Build
Click **"Settings"** tab:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `/` (leave empty)

### Step 5: Deploy
Railway auto-deploys! Get your URL from the **"Deployments"** tab

---

## After Backend is Deployed

### Update CORS Settings

1. Go back to Vercel/Railway
2. Update these environment variables:

```
FRONTEND_URL
https://your-frontend-url.vercel.app

ALLOWED_ORIGINS
https://your-frontend-url.vercel.app,http://localhost:3000
```

3. **Redeploy** (Vercel: Deployments → ... → Redeploy)

---

## ⚡ Quick Commands

### Check deployment status:
```bash
# Visit these URLs
https://your-backend-url.vercel.app/api/health
https://your-backend-url.vercel.app/api/tournaments
```

### View logs:
- **Vercel:** Project → Deployments → Click deployment → View Function Logs
- **Railway:** Click service → Logs tab

### Redeploy:
- **Vercel:** Deployments → ... → Redeploy
- **Railway:** Automatic on git push

---

## 🎯 What You'll Get

After deployment, you'll have:
- ✅ Backend API: `https://xsprint1-xxx.vercel.app`
- ✅ Health check: `https://xsprint1-xxx.vercel.app/api/health`
- ✅ All API routes working
- ✅ Database connected
- ✅ JWT authentication ready

**Use this URL for your frontend deployment!**

---

## 🐛 Troubleshooting

### Build Failed?
- Check all environment variables are added
- Look at build logs for specific error
- Verify DATABASE_URL is correct

### 500 Error?
- Check Function Logs in Vercel
- Verify database is accessible
- Check JWT_SECRET is set

### CORS Error?
- Add frontend URL to ALLOWED_ORIGINS
- Redeploy after changing env vars

---

**Need help?** Check the logs and look for error messages!
