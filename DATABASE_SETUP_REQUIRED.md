# ⚠️ Database Setup Required

## Issue: Categories showing 404 error in Admin Panel

The admin panel's categories section is showing a 404 error because **the database connection is not configured**.

## Why This Happens

Your application uses **Vercel Postgres** (via Prisma ORM) to store:
- Products and Categories
- Customer Orders
- Repair Records
- Chat Sessions
- And more...

Currently, the `.env.local` file has placeholder database credentials that won't work:
```bash
DATABASE_URL="postgres://default:YOUR_PASSWORD_HERE@YOUR_HOST_HERE/verceldb"
```

## Solution: Configure Your Database

### Option 1: Pull Environment Variables from Vercel (Recommended)

If you've already created a database on Vercel:

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Link your project to Vercel
vercel link

# 3. Pull environment variables
vercel env pull .env.local

# 4. Restart your development server
npm run dev
```

This will automatically populate your `.env.local` with the correct database credentials.

### Option 2: Manual Setup

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project "it-services-freetown"

2. **Navigate to Storage**
   - Click "Storage" in the sidebar
   - If you haven't created a database, click "Create Database" → "Postgres"

3. **Get Database Connection Strings**
   - Click on your Postgres database
   - Go to the ".env.local" tab
   - Copy the environment variables

4. **Update Your .env.local**
   Replace the placeholder values with your actual database URLs:
   ```bash
   # Required for Prisma
   POSTGRES_URL="postgres://default:ACTUAL_PASSWORD@ACTUAL_HOST/verceldb"
   DATABASE_URL="postgres://default:ACTUAL_PASSWORD@ACTUAL_HOST/verceldb?sslmode=require"
   
   # Optional but recommended
   POSTGRES_PRISMA_URL="..."
   POSTGRES_URL_NON_POOLING="..."
   ```

5. **Run Database Migrations**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations (creates tables)
   npx prisma migrate deploy
   
   # Or for development
   npx prisma migrate dev
   ```

6. **Restart Your Server**
   ```bash
   npm run dev
   ```

### Option 3: Seed Sample Data (Optional)

If you want to test with sample categories and products:

```bash
# This will create sample data in your database
npx prisma db seed
```

## Verify It's Working

1. Restart your development server
2. Visit: http://localhost:3000/admin/products
3. You should see categories loading without errors

## Current Status

✅ **What's Working:**
- All other admin features (Analytics, Forms, Repairs)
- Blog, Offers, and Receipt Generator
- AI Chatbot and Troubleshooting

❌ **What's Not Working:**
- Categories (database connection required)
- Products (database connection required)
- Orders (database connection required)
- Marketplace features (database connection required)

## Need Help?

- **Vercel Postgres Setup**: See `VERCEL_POSTGRES_SETUP.md`
- **Marketplace Setup**: See `MARKETPLACE_SETUP_FIX.md`
- **General Issues**: Check `TROUBLESHOOTING.md`

## Quick Check: Is Database Configured?

Run this command to check:
```bash
grep -E "POSTGRES_URL|DATABASE_URL" .env.local
```

If you see `YOUR_PASSWORD_HERE` or `YOUR_HOST_HERE`, you need to configure your database!

---

**Note**: The API now returns helpful error messages instead of 404 when the database is not configured.
