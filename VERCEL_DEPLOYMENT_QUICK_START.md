# Quick Deployment Guide - Secure Groq API Backend

## 🚀 Deploy to Vercel (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
- Choose "Continue with GitHub"
- Authorize Vercel

### Step 3: Deploy
```bash
cd /workspaces/web-app-it-services-freetown
vercel
```

**Answer the prompts:**
- Set up and deploy? → **Yes**
- Which scope? → **Your username**
- Link to existing project? → **No**
- Project name? → **it-services-freetown-api** (or keep default)
- Directory? → **./** (current directory)
- Override settings? → **No**

### Step 4: Add Environment Variable
```bash
vercel env add GROQ_API_KEY
```
- Value: `gsk_X18I2Po76uKYV8rAqZQqWGdyb3FYxXwMJoVQQhv383tq3kOUCJc`
- Environment: **Production, Preview, Development** (select all)

### Step 5: Deploy to Production
```bash
vercel --prod
```

### Step 6: Get Your API URL
Vercel will show: `✅ Production: https://your-project.vercel.app`

Your Groq proxy will be at:
```
https://your-project.vercel.app/api/groq-proxy
```

## 📝 Update Frontend Code

After deployment, I'll update these files to use your secure proxy:
- `app/chat/page.tsx`
- `app/troubleshoot/page.tsx`

Replace direct Groq API calls with calls to your Vercel proxy endpoint.

## ✅ Verification

Test your proxy:
```bash
curl -X POST https://your-project.vercel.app/api/groq-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "mixtral-8x7b-32768"
  }'
```

Should return AI response without exposing your key!

## 🎯 Benefits

✅ API key is **never** exposed in browser
✅ Groq won't revoke your key
✅ Free hosting (100GB bandwidth/month)
✅ Automatic HTTPS
✅ Edge functions (fast worldwide)

## 💡 Alternative: Use Both

You can deploy API to Vercel AND keep static site on GitHub Pages:

- **GitHub Pages**: https://itservicesfreetown.com (static HTML/CSS/JS)
- **Vercel**: https://your-project.vercel.app/api/* (API proxy only)

Your static site on GitHub Pages will call the Vercel API for chat functionality.

---

**Ready to deploy?** Let me know when you've completed the Vercel deployment, and I'll update your frontend code to use the secure proxy!
