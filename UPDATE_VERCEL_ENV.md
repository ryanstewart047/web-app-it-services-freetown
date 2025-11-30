# Update Vercel Environment Variable

The site needs the new environment variable to work properly in production.

## Quick Fix

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **it-services-freetown**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `NEXT_PUBLIC_ADSENSE_APPROVED`
   - **Value**: `false`
   - **Environment**: Check all (Production, Preview, Development)
6. Click **Save**
7. Go to **Deployments** tab
8. Click **⋯** on the latest deployment → **Redeploy**

## What This Does

- Hides manual AdSense ad placements until approval
- Prevents 400 errors in console
- Auto Ads still work normally

## After AdSense Approval

Change the value to `true`:
1. Settings → Environment Variables
2. Edit `NEXT_PUBLIC_ADSENSE_APPROVED`
3. Change value from `false` to `true`
4. Redeploy

---

**Status**: Environment variable added to `.env.local` (local dev)  
**Action Required**: Add to Vercel for production
