# Deploying to Vercel (Free Alternative to Railway)

This guide explains how to deploy your IT Services Freetown website to Vercel, a free hosting platform that provides serverless functions as an alternative to PHP.

## Prerequisites

1. A GitHub account (which you already have)
2. A Vercel account (sign up at https://vercel.com using your GitHub account)
3. Your project code committed to GitHub

## Setup Steps

### 1. Prepare Your Project for Vercel

Your project is already set up with a serverless function in the `api` folder that replaces the PHP form handler. The serverless function is located at:
- `api/process-appointment.js`

### 2. Set up Email Service (for form submission emails)

You'll need an email service to send emails from the serverless function. Here are some options:

#### Option 1: Use SendGrid (Free tier available)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. You'll use this in your environment variables

#### Option 2: Use SMTP from your email provider
1. Get SMTP credentials from your email provider (Gmail, Outlook, etc.)
2. You'll use these in your environment variables

### 3. Create a package.json file (if you don't have one)

```json
{
  "name": "it-services-freetown",
  "version": "1.0.0",
  "description": "IT Services Freetown Website",
  "main": "index.js",
  "scripts": {
    "dev": "vercel dev"
  },
  "dependencies": {
    "nodemailer": "^6.9.1"
  },
  "devDependencies": {
    "vercel": "^30.0.0"
  }
}
```

### 4. Update the Form Endpoint in your HTML

Update your form action to point to the serverless function:

```html
<form id="appointmentForm" class="space-y-6" action="/api/process-appointment" method="post">
```

### 5. Deploy to Vercel

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy your project:
```bash
vercel
```

4. Follow the prompts to link to your Vercel account and project

### 6. Set Environment Variables in Vercel Dashboard

After deploying, go to the Vercel dashboard and add these environment variables:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" > "Environment Variables"
3. Add the following variables:

For SendGrid:
- `SMTP_HOST`: smtp.sendgrid.net
- `SMTP_PORT`: 587
- `SMTP_SECURE`: false
- `SMTP_USER`: apikey
- `SMTP_PASSWORD`: your-sendgrid-api-key

Or for regular SMTP:
- `SMTP_HOST`: smtp.gmail.com (or your provider's SMTP server)
- `SMTP_PORT`: 587
- `SMTP_SECURE`: false
- `SMTP_USER`: your-email@gmail.com
- `SMTP_PASSWORD`: your-password-or-app-password

4. Click "Save"

### 7. Redeploy Your Site

```bash
vercel --prod
```

## Using a Database (Optional but Recommended)

The serverless function example uses a placeholder for database storage. For production, you should use a proper database. Here are free options:

1. **MongoDB Atlas** (free tier available)
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string
   - Add as an environment variable: `MONGODB_URI`

2. **Supabase** (free tier available)
   - Sign up at https://supabase.com/
   - Create a new project
   - Get your connection details
   - Add as environment variables

## Troubleshooting

1. **Emails not sending**
   - Check your SMTP credentials
   - Verify the environment variables are set correctly
   - Check Vercel function logs

2. **Form submission errors**
   - Check browser console for errors
   - Look at Vercel function logs
   - Verify the form action URL is correct

## Maintenance

1. **Updating your site**
   - Push changes to your GitHub repository
   - Vercel will automatically redeploy

2. **Viewing logs**
   - Go to Vercel dashboard
   - Select your project
   - Click on "Deployments"
   - Select the latest deployment
   - Click on "Functions" to see logs

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
