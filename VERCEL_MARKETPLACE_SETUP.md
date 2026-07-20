# 🚀 Vercel Marketplace Setup Guide

## Current Errors You're Seeing

The marketplace is deployed but showing errors because the database isn't configured yet:
- ❌ `500 Internal Server Error` on `/api/products` and `/api/categories`
- ❌ `404 Not Found` on `/cart` (this is normal - we only have `/checkout`)

## ✅ Quick Fix Steps

### Option 1: Use Vercel Postgres (Recommended - Easiest)

1. **Go to your Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your `web-app-it-services-freetown` project

2. **Add Vercel Postgres**
   - Click on the **"Storage"** tab
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Choose a database name (e.g., `marketplace-db`)
   - Select a region close to you
   - Click **"Create"**

3. **Connect to Your Project**
   - Vercel will automatically add `DATABASE_URL` to your environment variables
   - Click **"Connect Project"** and select your deployment

4. **Run Database Migration**
   - Go to **Settings** → **Environment Variables**
   - Verify `DATABASE_URL` is there
   - Go to **Deployments** → Click the latest deployment → Click **"Redeploy"**
   - This will run `prisma generate` and create your tables

5. **Seed Initial Data** (After deployment succeeds)
   - Use the Vercel Postgres dashboard or run this API call to create categories:

```bash
# Create Electronics category
curl -X POST https://www.itservicesfreetown.com/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Phones, tablets, laptops and accessories",
    "icon": "Smartphone"
  }'

# Create Accessories category
curl -X POST https://www.itservicesfreetown.com/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Accessories",
    "description": "Phone cases, chargers, cables and more",
    "icon": "Cable"
  }'
```

### Option 2: Use External PostgreSQL (Supabase, Railway, etc.)

1. **Create a PostgreSQL database** on your preferred provider:
   - [Supabase](https://supabase.com) - Free tier available
   - [Railway](https://railway.app) - Free trial
   - [Neon](https://neon.tech) - Free tier with generous limits
   - [ElephantSQL](https://www.elephantsql.com) - Free tier

2. **Get your DATABASE_URL**
   - Format: `postgresql://username:password@host:5432/database`
   - Example: `postgresql://user:pass123@db.supabase.co:5432/postgres`

3. **Add to Vercel Environment Variables**
   - Go to your Vercel project → **Settings** → **Environment Variables**
   - Add new variable:
     - **Name**: `DATABASE_URL`
     - **Value**: `your-postgresql-connection-string`
     - **Environment**: Production, Preview, Development (select all)
   - Click **"Save"**

4. **Redeploy**
   - Go to **Deployments** → Latest deployment → **"Redeploy"**
   - This will create all database tables automatically via `prisma db push` or `prisma migrate deploy`

## 🗄️ What Tables Will Be Created

When you set up the database, Prisma will automatically create these tables:

**Marketplace Tables:**
- `Category` - Product categories
- `Product` - All products with prices, stock, descriptions
- `ProductImage` - Multiple images per product
- `Cart` - Shopping carts (session-based)
- `CartItem` - Items in each cart
- `Order` - Customer orders
- `OrderItem` - Products in each order

**Existing Tables:**
- `Customer`, `Appointment`, `Repair`, `ChatSession`, etc. (already working)

## 📝 After Database Setup

Once the database is connected and tables are created:

1. **Create Categories** (Use the curl commands above or admin panel)
2. **Add Products** via:
   - Admin Panel: https://www.itservicesfreetown.com/admin/products
   - API: POST to `/api/products` with product data

3. **Test Marketplace**
   - Visit: https://www.itservicesfreetown.com/marketplace
   - You should see products (once added)
   - Shopping cart should work
   - Checkout should process orders

## 🐛 Troubleshooting

### Still seeing 500 errors?

Check Vercel logs:
1. Go to your deployment
2. Click on **"Functions"** tab
3. Find `/api/products` or `/api/categories`
4. Check the error logs

Common issues:
- `DATABASE_URL` not set → Add it in Environment Variables
- Tables not created → Redeploy after adding DATABASE_URL
- Connection refused → Check your database provider's allowlist (add Vercel IPs)

### Cart 404 error is normal

The marketplace uses `/checkout` directly. The 404 on `/cart` won't affect functionality - it's just Next.js prefetching a route that doesn't exist. You can ignore it or create a cart page later.

## 🎯 Quick Checklist

- [ ] Database created (Vercel Postgres or external)
- [ ] `DATABASE_URL` environment variable added to Vercel
- [ ] Project redeployed (this creates tables)
- [ ] Categories created via API or admin
- [ ] Products added via admin panel
- [ ] Marketplace page loads without errors
- [ ] Can add products to cart
- [ ] Can complete checkout

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify DATABASE_URL is correctly formatted
3. Ensure database accepts connections from Vercel
4. Check that Prisma migration ran during deployment (look for "Generated Prisma Client" in logs)

---

**Next Steps:** Follow Option 1 (Vercel Postgres) for the fastest setup! 🚀
