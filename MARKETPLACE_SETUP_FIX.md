# 🔧 Fixing "Unable to Add Products" and "Unable to Save Today's Offer"

## 🔍 Root Cause Analysis

Both issues are caused by **missing environment variables**:

1. **Products Issue**: Missing `DATABASE_URL` - can't connect to Vercel Postgres
2. **Today's Offer Issue**: Missing proper GitHub token configuration

## ✅ Solution Steps

### Step 1: Get Your Database URL from Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project **"it-services-freetown"**
3. Click on the **"Storage"** tab
4. Click on your **Postgres database**
5. Click on the **".env.local"** tab
6. Copy the **POSTGRES_URL** value

### Step 2: Update Your .env.local File

Open `.env.local` and add:

```bash
DATABASE_URL="your-postgres-url-from-vercel-here"
GITHUB_TOKEN="your-github-token-here"
OFFER_GIST_ID="741d3c2e3203df10a318d3dae1a94c66"
```

### Step 3: Restart Development Server

```bash
npm run dev
```

## 🧪 Testing

### Test Adding a Product

1. Go to http://localhost:3000/admin/add-product
2. Fill in all required fields
3. Click "Add Product"

### Test Saving Today's Offer

1. Go to http://localhost:3000/offer-admin
2. Fill in title and description
3. Click "Save Offer"

## ⚠️ Important

- Your `.env.local` is already in `.gitignore` (secrets are safe)
- DATABASE_URL is only for local development
- Vercel uses its own environment variables (already configured)

## 📊 Status

### Working ✅
- Database schema (8 models)
- Database tables in Vercel
- 3 categories created
- Admin pages functional

### Needs Setup ⚠️
- Add DATABASE_URL to `.env.local`
- Verify GITHUB_TOKEN in `.env.local`
- Restart dev server

## 🆘 Troubleshooting

**Problem**: "Failed to create product"
- Verify DATABASE_URL is correct
- Run `npx prisma generate`
- Check console for errors

**Problem**: "Failed to save offer"
- Verify GITHUB_TOKEN has gist permissions
- Check OFFER_GIST_ID is valid
- Check browser console

## 📝 Quick Checklist

- [ ] Get DATABASE_URL from Vercel
- [ ] Add to `.env.local`
- [ ] Verify GITHUB_TOKEN
- [ ] Restart server: `npm run dev`
- [ ] Test adding product
- [ ] Test saving offer
