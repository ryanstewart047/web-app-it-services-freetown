# Vercel Deployment Guide - Static Site Version

## Overview
This project has been configured to deploy as a **static website** to Vercel, not as a Next.js application. This ensures faster deployments and better performance for your HTML-based IT Services website.

## Configuration Changes Made

### 1. Updated `vercel.json`
- Changed from `@vercel/next` to `@vercel/static` 
- Added proper routing for static HTML files
- Configured to serve `index.html` as the root page

### 2. Updated `package.json`
- Simplified build process to focus on CSS compilation
- Main build command now only builds production CSS
- Removed Next.js specific commands

### 3. Added `.vercelignore`
- Excludes unnecessary files from deployment
- Keeps deployment package small and fast

## Deployment Steps

### Method 1: Automatic GitHub Deployment
1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy using the static configuration

### Method 2: Manual Deployment
```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Method 3: Using Build Script
```bash
# Run the build script
./build.sh

# Deploy
npx vercel --prod
```

## What Gets Deployed

✅ **Included in deployment:**
- `index.html` (homepage)
- `book-appointment.html`
- `track-repair.html` 
- `chat.html`
- `troubleshoot.html`
- `preview.html`
- `assets/` folder (CSS, images, favicon)
- `favicon.*` files

❌ **Excluded from deployment:**
- `src/` folder (development files)
- `node_modules/`
- Next.js files (`.next/`, `out/`)
- Development configs (`tailwind.config.js`, etc.)
- Documentation files

## Environment Variables

If you need environment variables for any server-side functionality, add them in Vercel dashboard:
- `DATABASE_URL` (if using database features)
- `SMTP_*` variables (for email functionality)

## Troubleshooting

### Build Fails
```bash
# Ensure CSS builds correctly
npm run build-css-prod

# Check for missing files
ls -la public/assets/css/output.css
```

### Deployment Issues
1. Check `vercel.json` is properly formatted
2. Ensure all HTML files are in root directory
3. Verify `public/assets/css/output.css` exists

### 404 Errors
- Make sure routing in `vercel.json` is correct
- Check that all linked files exist in the repository

## Performance Benefits

✅ **Static deployment advantages:**
- ⚡ Faster deployments (no build process)
- 🚀 Faster page loads (served from CDN)
- 💰 Lower resource usage
- 🔒 Better security (no server-side code)
- 📱 Perfect for mobile performance

## Custom Domain

To add a custom domain:
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your domain (e.g., `itservicesfreetown.com`)

---

Your IT Services Freetown website is now optimized for static deployment on Vercel! 🎉
