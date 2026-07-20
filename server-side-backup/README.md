# Server-Side Code Backup

This directory contains the server-side code that requires Node.js runtime and cannot be deployed to GitHub Pages.

## Files Backed Up:

### API Routes (`/api/`)
- `analytics/visitor/route.ts` - Visitor analytics endpoint
- `analytics/forms/route.ts` - Form submissions endpoint  
- `analytics/errors/route.ts` - Error tracking endpoint
- `analytics/financial/route.ts` - Revenue analytics endpoint
- `analytics/events/route.ts` - Event tracking endpoint
- `analytics/interactions/route.ts` - User interactions endpoint

### Admin Dashboard
- `admin-page-server.tsx` - Server-side admin dashboard with API integration

## Usage Instructions:

### For Full-Stack Deployment (Vercel, Netlify, etc.):
1. Copy the `api/` folder back to `app/api/`
2. Replace the client-side admin dashboard with `admin-page-server.tsx`
3. Enable server-side features in `next.config.js`

### For GitHub Pages (Static Only):
- Use the client-side version that's currently deployed
- Data is stored in localStorage only
- No server-side analytics or API endpoints

## Deployment Platforms:

**Static (GitHub Pages):** ✅ Current setup
**Server-Side (Vercel/Netlify):** Use backed up files

## Restore Command:
```bash
# To restore server-side functionality:
cp -r server-side-backup/api app/
cp server-side-backup/admin-page-server.tsx app/simple-admin/page.tsx
```