# 🚀 Railway Deployment Guide - Fixed Configuration

## ✅ What Was Fixed

The deployment error `deploy.restartPolicyType: Invalid input` was caused by:
1. **Invalid railway.toml configuration** - Removed problematic config file
2. **Complex startup script** - Simplified to use Railway defaults
3. **Postinstall script** - Now handles database setup automatically

## 📋 Step-by-Step Deployment

### 1. Railway Project Setup

1. **Go to [railway.app](https://railway.app)** and sign in
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Select your repository**: `web-app-it-services-freetown`
4. Railway will automatically detect it as a Node.js project

### 2. Add PostgreSQL Database

1. **In your Railway project**, click **"+ New Service"**
2. **Select "Database"** → **"PostgreSQL"**
3. **Wait for deployment** (Railway will auto-generate `DATABASE_URL`)

### 3. Configure Environment Variables

Go to your project **Variables** tab and add these **exact values**:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=itservicesfreetown@gmail.com
FROM_EMAIL=support@itservicesfreetown.com

# Security Secrets (use these exact generated values)
NEXTAUTH_SECRET=CrI0motGoQ75A6AfEbf+IFfaxrL26nJCJZCuf93IylU=
SOCKET_IO_SECRET=EPM/o9YPEHvwvi1kHt65tR5/YaWB4XZgVK/JBspAWQA=

# AI Configuration
GEMINI_API_KEY=AIzaSyDinSiRr6Gya3Q3Gy5f-Mx5otdOR7qg9q4

# Production URL (update after deployment)
NEXTAUTH_URL=https://your-app-name.up.railway.app
```

### 4. Set Up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Go to Google Account Settings** → **Security**
3. **Click "App passwords"** → **Select "Mail"** → **Other**
4. **Name it**: "IT Services Railway"
5. **Copy the 16-character password**
6. **Add to Railway**: `SMTP_PASS=[your-app-password]`

### 5. Deploy the Application

1. **Trigger deployment**: Railway should auto-deploy from the latest commit
2. **Monitor logs** in the **Deployments** tab
3. **Look for these success messages**:
   - ✅ Dependencies installed
   - ✅ Prisma client generated
   - ✅ Database schema pushed
   - ✅ Next.js application started

### 6. Update Production URL

1. **After successful deployment**, copy your Railway domain
2. **Update the `NEXTAUTH_URL` variable** with your actual domain
3. **Redeploy** if needed

## 🔧 Key Improvements Made

### ✅ Simplified Configuration
- **Removed railway.toml** - Uses Railway's auto-detection
- **Database setup in postinstall** - Automatic during deployment
- **Standard Next.js start** - No custom startup scripts

### ✅ Robust Error Handling
- **Database setup with fallback** - Won't fail if DB already exists
- **Environment checks** - Graceful handling of missing variables
- **Proper exit codes** - Clean deployment process

## 🧪 Testing Your Deployment

Once deployed, test these features:

### ✅ Core Functionality
- [ ] **Homepage loads** - Check your Railway domain
- [ ] **Book appointment** - Form submission works
- [ ] **Email notifications** - Check email delivery
- [ ] **Track repair** - Tracking system works
- [ ] **AI troubleshooting** - Gemini API responds
- [ ] **Chat support** - Real-time messaging works

### ✅ API Endpoints
Test these URLs on your domain:
- `https://your-app.up.railway.app/api/appointments` (POST)
- `https://your-app.up.railway.app/api/repairs` (GET/POST)
- `https://your-app.up.railway.app/api/troubleshoot` (POST)

## 🚨 Troubleshooting

### If deployment still fails:

1. **Check build logs** for specific errors
2. **Verify all environment variables** are set correctly
3. **Ensure PostgreSQL service** is running
4. **Check Gmail App Password** is valid

### Common Issues:

**Database Connection Failed:**
- Ensure PostgreSQL service is deployed first
- Verify `DATABASE_URL` is auto-generated

**Email Not Working:**
- Double-check Gmail App Password
- Verify 2FA is enabled on Gmail account

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are in package.json

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables
3. Test email configuration
4. Ensure database service is running

## 🎉 Success!

Once deployed successfully, your IT Services Freetown app will be live with:
- ✅ Real appointment booking with email confirmations
- ✅ Repair tracking with unique IDs
- ✅ AI-powered troubleshooting
- ✅ Real-time chat support
- ✅ Professional branding and mobile responsiveness

Your production app will be available at: `https://your-app-name.up.railway.app`
