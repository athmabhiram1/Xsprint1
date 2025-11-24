# xSPRINT Deployment Guide

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at vercel.com)
- Neon database (already configured)

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Vercel

1. **Login to Vercel:**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the root directory (backend)

3. **Configure Environment Variables:**
   
   In Vercel dashboard, add these environment variables:
   
   ```env
   DATABASE_URL=<your-neon-database-pooled-connection-string>
   DIRECT_URL=<your-neon-database-direct-connection-string>
   JWT_SECRET=<generate-a-secure-random-string-minimum-32-characters>
   JWT_EXPIRES_IN=7d
   ADMIN_BOOTSTRAP_CODE=<your-secure-admin-bootstrap-code>
   ALLOW_MULTIPLE_ADMINS=false
   BCRYPT_SALT_ROUNDS=10
   NODE_ENV=production
   GEMINI_API_KEY=<your-gemini-api-key-if-using-ai-features>
   ```
   
   **NOTE:** Copy actual values from your `.env` file (never commit this file to git)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your backend URL (e.g., `https://xsprint-backend.vercel.app`)

### Step 2: Deploy Frontend to Vercel

1. **Create New Project:**
   - Click "Add New Project" again
   - Import the same repository
   - Set root directory to `frontend`

2. **Configure Build Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   
   Replace `your-backend-url` with your actual backend URL from Step 1:
   
   ```env
   VITE_API_URL=https://your-backend-url.vercel.app/api
   VITE_WS_URL=https://your-backend-url.vercel.app
   VITE_APP_NAME=xSPRINT
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your frontend URL (e.g., `https://xsprint.vercel.app`)

### Step 3: Update CORS Configuration

1. **Update Backend Environment Variables:**
   
   In Vercel backend project settings, update:
   
   ```env
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000
   ```

2. **Redeploy Backend:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### Step 4: Verify Deployment

1. **Test Backend:**
   - Visit: `https://your-backend-url.vercel.app/api/health`
   - Should return: `{"success":true,"data":{"status":"UP",...}}`

2. **Test Frontend:**
   - Visit: `https://your-frontend-url.vercel.app`
   - Login with: `admin@test.com` / `Admin123!`

## 🔧 Alternative: Deploy to v0.dev

### Backend on Railway/Render

1. **Create Railway Account:**
   - Go to railway.app
   - Connect GitHub

2. **Deploy:**
   - New Project → Deploy from GitHub
   - Select repository
   - Add environment variables (same as Vercel)
   - Railway will auto-deploy

3. **Get URL:**
   - Copy your Railway URL (e.g., `https://xsprint-backend.up.railway.app`)

### Frontend on Vercel

Follow the same frontend deployment steps as above, using your Railway backend URL.

## 📝 Post-Deployment Checklist

- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Login works with admin credentials
- [ ] API requests complete successfully
- [ ] WebSocket connection established
- [ ] Database migrations ran successfully

## 🐛 Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify DATABASE_URL is correct
- Check build logs for specific errors

### CORS Errors
- Verify ALLOWED_ORIGINS includes frontend URL
- Check FRONTEND_URL is set correctly
- Ensure no trailing slashes in URLs

### Database Errors
- Run migrations: `npx prisma migrate deploy`
- Check Neon database is accessible
- Verify connection string format

### 404 Errors
- Check API routes in vercel.json
- Verify build output directory
- Check dist folder contains index.js

## 🔐 Security Recommendations

1. **Change Default Credentials:**
   - After first login, create a new admin account
   - Use strong password
   - Disable default admin if needed

2. **Rotate Secrets:**
   - Generate new JWT_SECRET for production
   - Use different ADMIN_BOOTSTRAP_CODE

3. **Environment Separation:**
   - Use different database for production
   - Never commit .env files
   - Use Vercel environment variables

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Check database connection in Neon dashboard

---

**Your URLs:**
- Backend: `https://your-backend-url.vercel.app`
- Frontend: `https://your-frontend-url.vercel.app`

**Default Login:**
- Email: `admin@test.com`
- Password: `Admin123!`
