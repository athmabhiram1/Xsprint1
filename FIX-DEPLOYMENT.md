# 🚀 Fix Vercel Deployment - Configuration Guide

## ✅ Step 1: Local Files Updated

I've already updated your local `.env.production` file with the correct backend URL:
- ✅ `VITE_API_URL=https://xsprint1b2.vercel.app/api`
- ✅ `VITE_WS_URL=https://xsprint1b2.vercel.app`

---

## 🔧 Step 2: Update Vercel Environment Variables

You need to add/update environment variables in **both** your frontend and backend projects on Vercel.

### 📱 **Frontend Project (xsprint1f2.vercel.app)**

1. Go to: https://vercel.com/dashboard
2. Click on your **frontend project** (xsprint1f2)
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```
VITE_API_URL=https://xsprint1b2.vercel.app/api
VITE_WS_URL=https://xsprint1b2.vercel.app
VITE_APP_NAME=xSPRINT
VITE_APP_VERSION=1.0.0
```

**For each variable:**
- Click "Add New"
- Name: (e.g., `VITE_API_URL`)
- Value: (e.g., `https://xsprint1b2.vercel.app/api`)
- Environment: Select **Production**, **Preview**, and **Development** (all three)
- Click "Save"

### 🔙 **Backend Project (xsprint1b2.vercel.app)**

1. Click on your **backend project** (xsprint1b2)
2. Go to **Settings** → **Environment Variables**
3. Add/Update these CORS variables:

```
FRONTEND_URL=https://xsprint1f2.vercel.app
ALLOWED_ORIGINS=https://xsprint1f2.vercel.app
```

**Important:** Make sure these other backend variables are also set (they should be from your initial deployment):
- `DATABASE_URL` (your Neon database connection string)
- `DIRECT_URL` (your Neon direct connection string)
- `JWT_SECRET` (secure random string)
- `JWT_EXPIRES_IN=7d`
- `ADMIN_BOOTSTRAP_CODE` (your admin code)
- `ALLOW_MULTIPLE_ADMINS=false`
- `BCRYPT_SALT_ROUNDS=10`
- `NODE_ENV=production`
- `GEMINI_API_KEY` (if you're using AI features)

---

## 🔄 Step 3: Redeploy Both Projects

After updating environment variables, you need to redeploy:

### Redeploy Frontend:
1. Go to your **frontend project** (xsprint1f2)
2. Click **Deployments** tab
3. Find the latest deployment
4. Click the **three dots (...)** menu
5. Click **Redeploy**
6. Confirm the redeploy

### Redeploy Backend:
1. Go to your **backend project** (xsprint1b2)
2. Click **Deployments** tab
3. Find the latest deployment
4. Click the **three dots (...)** menu
5. Click **Redeploy**
6. Confirm the redeploy

**Wait for both deployments to complete** (usually 2-3 minutes each)

---

## ✅ Step 4: Verify the Fix

After both deployments complete:

1. **Open your app**: https://xsprint1f2.vercel.app
2. **Open Browser DevTools**: Press `F12`
3. **Go to Network tab**
4. **Try to sign in** with test credentials:
   - Email: `admin@test.com`
   - Password: `Admin123!`

5. **Check the Network tab**:
   - You should see a request to: `https://xsprint1b2.vercel.app/api/auth/login`
   - Status should be `200 OK` (or appropriate error if credentials are wrong)
   - **NO MORE "Failed to fetch" error!** ✅

6. **Check Console tab**:
   - Should be no CORS errors
   - Should be no network errors

---

## 🐛 Troubleshooting

### Still getting "Failed to fetch"?

**Check 1: Verify Backend is Running**
- Visit: https://xsprint1b2.vercel.app/api/health
- Should return: `{"success":true,"data":{"status":"UP",...}}`
- If you get an error, check backend logs in Vercel

**Check 2: Verify CORS Headers**
- In Network tab, click on the failed request
- Go to "Headers" section
- Check "Response Headers" for:
  - `Access-Control-Allow-Origin: https://xsprint1f2.vercel.app`
- If missing, backend CORS is not configured correctly

**Check 3: Environment Variables**
- Go to Vercel → Frontend → Settings → Environment Variables
- Verify `VITE_API_URL` is set to `https://xsprint1b2.vercel.app/api`
- If you changed it, you MUST redeploy for it to take effect

### CORS Errors?

If you see CORS errors in console:
1. Verify backend has `FRONTEND_URL` and `ALLOWED_ORIGINS` set correctly
2. Make sure there are NO trailing slashes in the URLs
3. Redeploy backend after changing CORS variables

### Backend 500 Error?

If backend returns 500 errors:
1. Go to Vercel → Backend → Deployments
2. Click on latest deployment
3. Check the **Function Logs** for error details
4. Common issues:
   - Database connection failed (check `DATABASE_URL`)
   - Missing environment variables
   - Prisma schema not generated

---

## 📋 Quick Checklist

- [ ] Updated `.env.production` locally (already done ✅)
- [ ] Added `VITE_API_URL` to Vercel frontend
- [ ] Added `VITE_WS_URL` to Vercel frontend
- [ ] Added `VITE_APP_NAME` to Vercel frontend
- [ ] Added `VITE_APP_VERSION` to Vercel frontend
- [ ] Updated `FRONTEND_URL` in Vercel backend
- [ ] Updated `ALLOWED_ORIGINS` in Vercel backend
- [ ] Redeployed frontend
- [ ] Redeployed backend
- [ ] Tested login on deployed app
- [ ] Verified no "Failed to fetch" error
- [ ] Verified no CORS errors

---

## 🎯 Summary

**What was wrong:**
- Frontend was trying to call `https://your-backend-domain.com/api` (fake URL)
- This caused "Failed to fetch" error

**What we fixed:**
- Updated frontend to call `https://xsprint1b2.vercel.app/api` (real backend)
- Updated backend to allow requests from `https://xsprint1f2.vercel.app` (real frontend)

**Next steps:**
1. Add environment variables in Vercel (both projects)
2. Redeploy both projects
3. Test the app - it should work! 🎉

---

**Need help?** Let me know if you encounter any issues during the deployment!
