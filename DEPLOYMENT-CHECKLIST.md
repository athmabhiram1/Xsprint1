# 🚀 DEPLOYMENT CHECKLIST - xSPRINT

## ⚠️ CRITICAL SECURITY ITEMS (DO THESE FIRST)

### 1. **Rotate All Secrets Immediately**
Your current secrets have been exposed in version control. Generate new ones:

- [ ] Generate new JWT_SECRET (use: `openssl rand -hex 32`)
- [ ] Create new ADMIN_BOOTSTRAP_CODE (strong, unique code)
- [ ] **ROTATE your Gemini API key** in Google Cloud Console (current one is exposed)
- [ ] **CHANGE Neon database password** in Neon dashboard (current one is exposed)
- [ ] Update all `.env` files with new values
- [ ] **NEVER** commit `.env` files to git

### 2. **Verify .gitignore**
- [x] Root `.gitignore` created
- [x] Backend `.gitignore` exists and includes `.env`
- [x] Frontend `.gitignore` exists and includes `.env`
- [ ] Run `git status` to ensure no `.env` files are tracked

### 3. **Clean Git History (IMPORTANT)**
If you've already committed secrets:
```bash
# Remove DEPLOYMENT.md from git history
git rm --cached backend/DEPLOYMENT.md
git commit -m "Remove sensitive credentials from documentation"

# Or use git-filter-repo to completely remove secrets from history
# https://github.com/newren/git-filter-repo
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Backend Configuration
- [x] `vercel-build` script added to package.json
- [x] `vercel.json` configured correctly
- [ ] Environment variables prepared (use `.env.example` as template)
- [ ] Update `FRONTEND_URL` placeholder in `.env`
- [ ] Update `ALLOWED_ORIGINS` with actual frontend URL

### Frontend Configuration
- [ ] Update `.env.local` with actual backend URL after backend deployment
- [ ] Verify `vite.config.ts` proxy settings
- [ ] Check `vercel.json` is configured for SPA routing
- [ ] Ensure build command produces `dist/` folder

### Database
- [ ] Neon database is accessible
- [ ] Connection pooling URL is used for `DATABASE_URL`
- [ ] Direct connection URL is used for `DIRECT_URL`
- [ ] Migrations are up to date: `npx prisma migrate deploy`

---

## 🚀 DEPLOYMENT STEPS

### Phase 1: Deploy Backend (Vercel)

1. **Login to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory:** Select `backend`
   - **Framework:** Other

3. **Configure Build Settings**
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables** (Use your NEW rotated secrets!)
   ```
   DATABASE_URL=<new-neon-pooled-connection>
   DIRECT_URL=<new-neon-direct-connection>
   JWT_SECRET=<new-secret-from-openssl-rand>
   JWT_EXPIRES_IN=7d
   ADMIN_BOOTSTRAP_CODE=<new-secure-code>
   ALLOW_MULTIPLE_ADMINS=false
   BCRYPT_SALT_ROUNDS=10
   NODE_ENV=production
   GEMINI_API_KEY=<new-rotated-api-key>
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   PORT=5001
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - **Copy your backend URL**: `https://your-backend-name.vercel.app`

6. **Verify Backend**
   - Visit: `https://your-backend-name.vercel.app/api/health`
   - Should return: `{"success":true,"data":{"status":"UP",...}}`

### Phase 2: Deploy Frontend (Vercel)

1. **Create New Vercel Project**
   - Click "Add New Project"
   - Import same GitHub repository
   - **Root Directory:** Select `frontend`
   - **Framework:** Vite

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend-name.vercel.app/api
   VITE_WS_URL=https://your-backend-name.vercel.app
   VITE_APP_NAME=xSPRINT
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - **Copy your frontend URL**: `https://your-frontend-name.vercel.app`

### Phase 3: Update CORS Settings

1. **Update Backend Environment Variables**
   - Go to backend project in Vercel
   - Settings → Environment Variables
   - Update:
     ```
     FRONTEND_URL=https://your-actual-frontend-name.vercel.app
     ALLOWED_ORIGINS=https://your-actual-frontend-name.vercel.app
     ```

2. **Redeploy Backend**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Backend Tests
- [ ] Health endpoint returns 200: `/api/health`
- [ ] Database connection works
- [ ] API routes are accessible: `/api/auth/login`
- [ ] CORS headers present in response

### Frontend Tests
- [ ] Site loads without console errors
- [ ] Can access login page
- [ ] Login with admin credentials works
- [ ] API calls complete successfully (check Network tab)
- [ ] No CORS errors in console

### End-to-End Tests
- [ ] Login → Dashboard loads
- [ ] Register a player
- [ ] Generate fixtures
- [ ] View schedule
- [ ] Submit match result (umpire view)
- [ ] Check leaderboard

---

## 🔒 SECURITY VERIFICATION

- [ ] `.env` files are NOT in git history
- [ ] All secrets have been rotated
- [ ] Old API keys have been revoked
- [ ] Database password has been changed
- [ ] `DEPLOYMENT.md` contains no real credentials
- [ ] HTTPS is enabled (Vercel does this automatically)
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] JWT tokens are being validated

---

## 🐛 TROUBLESHOOTING

### Build Fails
- Check Vercel build logs for specific errors
- Verify all dependencies in package.json
- Ensure TypeScript compiles locally: `npm run build`
- Check Prisma generates correctly: `npx prisma generate`

### CORS Errors
- Verify ALLOWED_ORIGINS includes your frontend URL (exact match, no trailing slash)
- Check FRONTEND_URL is set
- Ensure backend was redeployed after updating CORS settings

### Database Connection Fails
- Verify DATABASE_URL format is correct
- Check Neon dashboard shows database is active
- Test connection locally with new credentials
- Ensure IP allowlist in Neon allows all IPs (0.0.0.0/0)

### 500 Internal Server Error
- Check Vercel function logs in dashboard
- Verify environment variables are set correctly
- Check for missing dependencies
- Review error stack traces in logs

### Frontend 404s
- Verify `vercel.json` rewrites are configured for SPA
- Check build output has `dist/index.html`
- Ensure routing fallback is set up

---

## 📝 FINAL NOTES

### Default Admin Credentials (After Bootstrap)
- Email: `admin@test.com`
- Password: `Admin123!`

**IMPORTANT:** Change these immediately after first login!

### Your Deployment URLs
- Backend: `https://_____.vercel.app`
- Frontend: `https://_____.vercel.app`

### Monitoring
- Set up Vercel Analytics for frontend
- Monitor Vercel Function logs for backend errors
- Check Neon dashboard for database performance

---

## 🎯 QUICK REFERENCE

### Required Secrets to Rotate
1. JWT_SECRET - Generate: `openssl rand -hex 32`
2. ADMIN_BOOTSTRAP_CODE - Any secure string
3. Gemini API Key - Rotate in Google Cloud Console
4. Neon Database Password - Change in Neon dashboard

### Environment Variables Checklist
**Backend (9 vars):**
- DATABASE_URL
- DIRECT_URL  
- JWT_SECRET
- JWT_EXPIRES_IN
- ADMIN_BOOTSTRAP_CODE
- ALLOW_MULTIPLE_ADMINS
- BCRYPT_SALT_ROUNDS
- NODE_ENV
- GEMINI_API_KEY
- FRONTEND_URL
- ALLOWED_ORIGINS

**Frontend (4 vars):**
- VITE_API_URL
- VITE_WS_URL
- VITE_APP_NAME
- VITE_APP_VERSION

---

**Status:** Ready to deploy after rotating secrets ✅
**Last Updated:** November 24, 2025
