# Railway Deployment Guide

## Prerequisites
1. GitHub account with your repository
2. Railway account (sign up at railway.app)
3. Gmail app password for email notifications

## Step 1: Connect to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `web-app-it-services-freetown` repository
4. Railway will automatically detect it's a Next.js app

## Step 2: Add Database

1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database and provide the connection URL

## Step 3: Configure Environment Variables

Go to your Railway project → Variables tab and add these:

### Required Variables:
```bash
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://user:password@host:port/database

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=itservicesfreetown@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=support@itservicesfreetown.com

# Google Gemini API
GEMINI_API_KEY=AIzaSyDinSiRr6Gya3Q3Gy5f-Mx5otdOR7qg9q4

# Next.js (Replace with your Railway domain)
NEXTAUTH_URL=https://your-app-name.railway.app
NEXTAUTH_SECRET=your-secure-random-string

# Socket.IO
SOCKET_IO_SECRET=your-socket-secret
```

## Step 4: Get Gmail App Password

1. Go to your Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate app password for "Mail"
4. Use this password in `SMTP_PASS` (not your regular Gmail password)

## Step 5: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Wait for deployment to complete
3. Click on your service → Settings → Public Networking → Generate Domain

## Step 6: Update Domain Settings

1. Copy your Railway domain (e.g., `your-app-name.railway.app`)
2. Update `NEXTAUTH_URL` variable with your Railway domain
3. Optionally, add custom domain if you have one

## Step 7: Test Features

Once deployed, test these features:
- ✅ Appointment booking with email confirmations
- ✅ Repair tracking with database lookup
- ✅ AI chat with Gemini integration
- ✅ Real-time notifications

## Custom Domain (Optional)

If you want to use `itservicesfreetown.com`:
1. In Railway project → Settings → Custom Domains
2. Add your domain
3. Update your DNS records as instructed
4. Update `NEXTAUTH_URL` to use your custom domain

## Database Access

To view your database:
1. Railway project → PostgreSQL service → Connect
2. Or use: `railway run prisma studio`

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that all dependencies are in package.json
2. **Database connection fails**: Verify DATABASE_URL is set correctly
3. **Emails not sending**: Verify SMTP credentials and Gmail app password
4. **Environment variables**: Make sure all required vars are set in Railway

### Logs:
- Railway project → Service → Logs tab to see deployment and runtime logs

## Production Checklist

- [ ] All environment variables configured
- [ ] Gmail app password working
- [ ] Database connected and migrated
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] All features tested and working

## Estimated Cost
Railway offers:
- $5/month per service (Next.js app)
- $5/month for PostgreSQL database
- Total: ~$10/month for full production setup

## Support
If you need help, Railway has excellent documentation and community support at docs.railway.app
