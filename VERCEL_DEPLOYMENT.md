# Deploy Backend to Vercel - Quick Guide

## Prerequisites
- Vercel account (same one you used for v0 frontend)
- PostgreSQL database (see Database Setup below)

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Setup Database

You need a PostgreSQL database. Choose one:

### Option A: Neon (Recommended - Free)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string
4. It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`

### Option B: Supabase (Free)
1. Go to https://supabase.com
2. Create a new project
3. Settings → Database → Connection string (Transaction pooler)
4. Copy the connection string

### Option C: Vercel Postgres (Paid)
1. In Vercel dashboard → Storage → Create Database → Postgres
2. Copy the connection string

## Step 3: Deploy Backend

```bash
# Navigate to your backend directory
cd "c:\Users\athma\OneDrive\Desktop\my projects\backend"

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? xsprint-backend (or your choice)
# - Directory? ./ (current directory)
# - Override settings? No

# Deploy to production
vercel --prod
```

## Step 4: Add Environment Variables

After first deployment, add environment variables:

```bash
# Add DATABASE_URL
vercel env add DATABASE_URL

# When prompted, paste your PostgreSQL connection string
# Select: Production, Preview, Development (all three)

# Add JWT_SECRET
vercel env add JWT_SECRET

# When prompted, paste a secure random string (min 32 characters)
# Generate one: https://randomkeygen.com/
# Select: Production, Preview, Development

# Add FRONTEND_URL
vercel env add FRONTEND_URL

# When prompted, paste your v0 frontend URL
# Example: https://your-app.vercel.app
# Select: Production, Preview, Development

# Add ADMIN_BOOTSTRAP_CODE
vercel env add ADMIN_BOOTSTRAP_CODE

# When prompted, paste a secret code for admin creation
# Select: Production, Preview, Development
```

## Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

## Step 6: Run Database Migrations

After deployment, you need to run migrations:

```bash
# Set DATABASE_URL locally to your production database
# Then run:
npx prisma migrate deploy
```

Or use Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## Step 7: Create Admin User

```bash
# Make sure .env.production has your production DATABASE_URL
npm run bootstrap
```

## Step 8: Update Frontend

Update your v0 frontend environment variables:

1. Go to your frontend project in Vercel dashboard
2. Settings → Environment Variables
3. Add/Update:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```
4. Redeploy frontend

## Step 9: Test

Visit your backend URL:
- Health check: `https://your-backend.vercel.app/api/health`
- Test login from frontend

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Remove a deployment
vercel remove [deployment-url]
```

---

## Important Notes

⚠️ **Socket.IO Limitation**: Vercel's serverless functions may not support Socket.IO reliably. If real-time features don't work, consider Railway or Render instead.

⚠️ **Timeout**: Vercel has a 10-second timeout on Hobby plan. Long-running operations may fail.

✅ **Your vercel.json is already configured** - no changes needed!

---

## Troubleshooting

### Build fails
- Check build logs: `vercel logs`
- Ensure `vercel-build` script works locally: `npm run vercel-build`

### Database connection fails
- Verify DATABASE_URL is set: `vercel env ls`
- Test connection string locally
- Ensure database allows connections from Vercel IPs (usually auto-configured)

### CORS errors
- Verify FRONTEND_URL is set correctly
- Check `src/app.ts` CORS configuration

### Can't create admin
- Ensure ADMIN_BOOTSTRAP_CODE is set
- Run `npm run bootstrap` with production DATABASE_URL

---

## Alternative: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your backend repository
4. Configure:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
5. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
6. Click "Deploy"

---

## Next Steps

1. Deploy backend to Vercel
2. Setup PostgreSQL database
3. Run migrations
4. Create admin user
5. Update frontend API URL
6. Test end-to-end

Your backend URL will be: `https://your-project-name.vercel.app`
