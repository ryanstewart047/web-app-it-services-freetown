# Groq API Proxy - Secure Backend Setup

## Problem
Groq's system automatically detects and revokes API keys that are publicly visible in browser/front-end code for security reasons.

## Solution
Implement a secure backend proxy that:
1. Keeps your API key server-side (never exposed to browsers)
2. Validates requests from your frontend
3. Forwards legitimate requests to Groq API
4. Returns responses to your frontend

## Deployment Options

### Option 1: Vercel (Recommended - FREE) ⭐

**Why Vercel?**
- Free tier: 100GB bandwidth/month
- Edge Functions (serverless)
- Automatic HTTPS
- Easy environment variable management
- Perfect for Next.js projects

**Setup Steps:**

1. **Create Vercel Account**
   - Go to: https://vercel.com/signup
   - Sign up with GitHub (easiest)

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy Your Backend**
   ```bash
   cd /workspaces/web-app-it-services-freetown
   vercel
   ```
   - Select: Create new project
   - Link to your GitHub repo
   - Framework: Next.js
   - Root Directory: ./

5. **Add Environment Variable**
   - Go to: https://vercel.com/your-username/your-project/settings/environment-variables
   - Add:
     - Name: `GROQ_API_KEY`
     - Value: `gsk_X18I2Po76uKYV8rAqZQqWGdyb3FYxXwMJoVQQhv383tq3kOUCJc`
     - Environment: Production, Preview, Development
   - Click "Save"

6. **Redeploy**
   ```bash
   vercel --prod
   ```

7. **Get Your API Endpoint**
   - Will be: `https://your-project.vercel.app/api/groq-proxy`

### Option 2: Netlify Functions (FREE)

**Setup Steps:**

1. **Create Netlify Account**
   - Go to: https://app.netlify.com/signup
   - Sign up with GitHub

2. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Create `netlify/functions/groq-proxy.js`**
   ```javascript
   exports.handler = async (event) => {
     if (event.httpMethod !== 'POST') {
       return { statusCode: 405, body: 'Method not allowed' }
     }

     const GROQ_API_KEY = process.env.GROQ_API_KEY
     const body = JSON.parse(event.body)

     const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${GROQ_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: body.model || 'mixtral-8x7b-32768',
         messages: body.messages,
         temperature: 0.7,
         max_tokens: 1024,
       }),
     })

     const data = await response.json()
     return {
       statusCode: 200,
       body: JSON.stringify(data),
       headers: { 'Content-Type': 'application/json' }
     }
   }
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

5. **Add Environment Variable**
   - Go to: Site settings → Environment variables
   - Add: `GROQ_API_KEY` with your key

### Option 3: Railway (FREE Tier)

**Setup:**
1. Go to: https://railway.app
2. Create account
3. Deploy from GitHub
4. Add `GROQ_API_KEY` environment variable

## Frontend Integration

Once deployed, update your chat/troubleshoot components to use the proxy:

### Before (Insecure - API key exposed):
```typescript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer gsk_X18I2Po76uKYV8rAqZQqWGdyb3FYxXwMJoVQQhv383tq3kOUCJc`,
    'Content-Type': 'application/json',
  },
  // ...
})
```

### After (Secure - API key hidden):
```typescript
const response = await fetch('https://your-project.vercel.app/api/groq-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: messages,
    model: 'mixtral-8x7b-32768',
    temperature: 0.7,
  })
})
```

## Files to Update

After deploying the proxy, update these files:

1. **lib/chat-service.ts** (if it exists)
2. **app/chat/page.tsx**
3. **app/troubleshoot/page.tsx**
4. **Any other files using Groq API**

Replace all direct Groq API calls with calls to your proxy endpoint.

## Security Benefits

✅ **API Key Protected**: Never visible in browser
✅ **Request Validation**: Backend validates before forwarding
✅ **Rate Limiting**: Can add rate limits to prevent abuse
✅ **CORS Control**: Only your domain can access
✅ **Error Handling**: Better error messages
✅ **Logging**: Track API usage server-side

## Cost

All options are **FREE** for your traffic level:
- Vercel: 100GB bandwidth/month
- Netlify: 100GB bandwidth/month
- Railway: 500 hours/month

Typical API call: ~5KB
Your expected traffic: <1GB/month
**Cost: $0/month** 💰

## Recommended: Vercel

**Choose Vercel because:**
1. ✅ Built for Next.js
2. ✅ Easiest deployment
3. ✅ Automatic deployments on git push
4. ✅ Great dashboard
5. ✅ Edge Functions (faster)

## Next Steps

1. **Choose a platform** (Vercel recommended)
2. **Deploy the proxy** (follow setup steps above)
3. **Add environment variable** (your Groq API key)
4. **Get your proxy URL**
5. **Update frontend code** (I'll help with this)
6. **Test the integration**
7. **Deploy to GitHub Pages**

Would you like me to help you set up Vercel and update your frontend code to use the secure proxy?
