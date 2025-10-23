# Groq API Backend Security Setup - COMPLETE

## 🔒 SECURITY UPDATE (October 23, 2025)

Your Groq API key has been secured! The API key is now:
- ✅ Hidden from browser/frontend code
- ✅ Only stored in backend environment variables
- ✅ Never exposed in deployed code
- ✅ Protected from public access

---

## 📋 Current Configuration

### New API Key (Secure)
```
gsk_Tar81...HaS (Contact admin for full key - never commit to git!)
```

### Old API Key (REVOKED by Groq)
```
gsk_X18I...CJc (DO NOT USE - REVOKED)
```

---

## 🏗️ Architecture

**Before (Insecure - Groq detected and revoked):**
```
Browser → Groq API (with exposed key) ❌
```

**After (Secure - Recommended by Groq):**
```
Browser → Your Backend Proxy → Groq API (with secure key) ✅
```

---

## ✅ What's Been Done

### 1. Backend Proxy Created
File: `app/api/groq-proxy/route.ts`
- Securely stores API key in environment variable
- Validates all requests
- Forwards to Groq API
- Returns responses to frontend
- Edge runtime for fast global performance

### 2. Frontend Updated
File: `lib/groq-ai-client.ts`
- Removed all hardcoded API keys
- Now calls `/api/groq-proxy` instead of Groq directly
- API key never exposed in browser
- Works for chat and troubleshooting

### 3. Blog Admin Updated
File: `app/blog/admin/page.tsx`
- Uses backend proxy for AI content generation
- No API key in frontend code

### 4. Environment Variable Set
File: `.env.local`
```env
GROQ_API_KEY=gsk_Tar81...HaS (your full API key - never commit!)
```

---

## 🚀 Deployment Options

Since GitHub Pages doesn't support backend/serverless functions, you need to deploy the backend separately:

### Option 1: Vercel (RECOMMENDED - FREE)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
vercel
```

#### Step 4: Add Environment Variable
```bash
vercel env add GROQ_API_KEY
# When prompted, paste your API key: gsk_Tar81...HaS
# Select: Production, Preview, Development (all environments)
```

#### Step 5: Redeploy with Environment Variable
```bash
vercel --prod
```

**Your API will be live at:** `https://your-project.vercel.app/api/groq-proxy`

---

### Option 2: Netlify (FREE Alternative)

#### Step 1: Create `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

#### Step 2: Create Netlify Function
Move `app/api/groq-proxy/route.ts` to `netlify/functions/groq-proxy.ts`

#### Step 3: Deploy
```bash
netlify deploy --prod
```

#### Step 4: Add Environment Variable
Go to: Netlify Dashboard → Site Settings → Environment Variables
- Key: `GROQ_API_KEY`
- Value: `gsk_Tar81...HaS` (your full API key)

---

### Option 3: Railway (FREE Tier)

#### Step 1: Push to GitHub
```bash
git push origin main
```

#### Step 2: Deploy on Railway
1. Go to: https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

#### Step 3: Add Environment Variable
In Railway dashboard:
- Variables → Add Variable
- `GROQ_API_KEY` = `gsk_Tar81...HaS` (your full API key)

---

## 🔧 Update Frontend URL

After deploying to Vercel/Netlify/Railway, update the proxy URL:

**File:** `lib/groq-ai-client.ts`

Change:
```typescript
const GROQ_PROXY_URL = '/api/groq-proxy'  // Local development
```

To:
```typescript
const GROQ_PROXY_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/groq-proxy`
  : '/api/groq-proxy'  // Fallback for local dev
```

Then add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

---

## 🧪 Testing

### Test Locally (Development)
```bash
npm run dev
# Visit: http://localhost:3000/chat
# Try sending a message
# Check browser console for logs
```

### Test Production (After Deploy)
1. Go to: https://itservicesfreetown.com/chat
2. Send a test message: "Hello, can you help me?"
3. Open browser console (F12)
4. Look for: `✅ [CLIENT-SIDE] Groq AI response received via proxy`

### Expected Console Logs
```
🔍 [CLIENT-SIDE] Calling Groq AI via Backend Proxy: Hello
📤 [CLIENT-SIDE] Request preview: { model: "llama-3.1-8b-instant", ... }
📥 [CLIENT-SIDE] Backend proxy response status: 200
✅ [CLIENT-SIDE] Groq AI response received via proxy
💬 [CLIENT-SIDE] AI chat response: Hello! How can I help you today?...
```

---

## 📊 Monitoring

### Check Groq Usage
1. Go to: https://console.groq.com
2. Login with your account
3. View: API Usage → Requests, Tokens, Costs

### Check for Issues
If you see errors:
- **401 Unauthorized**: API key incorrect (check environment variable)
- **429 Rate Limit**: Too many requests (Groq free tier limits)
- **500 Server Error**: Backend proxy issue (check Vercel/Netlify logs)

---

## 🔐 Security Best Practices

### ✅ DO:
- Keep API key in environment variables only
- Use backend proxy for all AI requests
- Monitor usage on Groq console
- Rotate API keys periodically
- Use rate limiting on your backend

### ❌ DON'T:
- Hardcode API keys in frontend code
- Commit `.env.local` to git
- Share API keys publicly
- Use `NEXT_PUBLIC_` prefix for API keys (exposes to browser)

---

## 🎯 Quick Reference

### Local Development
```bash
# Start dev server
npm run dev

# API runs at: http://localhost:3000/api/groq-proxy
# Chat at: http://localhost:3000/chat
```

### Production Deployment
```bash
# GitHub Pages (frontend only)
npm run deploy

# Vercel (backend + frontend)
vercel --prod
```

### Environment Variables
```env
# Backend only (SECURE)
GROQ_API_KEY=gsk_Tar81...HaS (never commit this!)

# Frontend (for API URL only)
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

---

## 📞 Support

If you need help:
1. **Groq API Issues**: https://console.groq.com/docs
2. **Vercel Deployment**: https://vercel.com/docs
3. **General Questions**: Check GROQ_BACKEND_SETUP.md

---

**Status:** ✅ API Key Secured  
**Last Updated:** October 23, 2025  
**Current Key:** gsk_Tar81...HaS (last 3 chars)
