# Custom Domain Setup with Form Submissions & Email Notifications

## ✅ Complete Solution for itservicesfreetown.com

Your custom domain **WILL** handle form submissions and email notifications perfectly! Here's what I've set up for you:

## What Changed:

### 1. ✅ Converted PHP Backend to Vercel API Routes
- **Before**: `process-appointment.php` (won't work on Vercel)
- **After**: `/api/appointments.js` (works perfectly with custom domains)

### 2. ✅ Updated Form Submission
- Your booking form now sends data to `/api/appointments`
- Uses JSON instead of form data for better reliability
- Maintains all the same functionality

### 3. ✅ Modern Email System
- Replaced PHP `mail()` with `nodemailer`
- Supports Gmail, SendGrid, Mailgun, and custom SMTP
- More reliable email delivery
- Better formatting with HTML emails

### 4. ✅ Environment Variables for Security
- Email credentials stored securely in Vercel
- No sensitive data in your code
- Works perfectly with custom domains

## How It Works with Your Custom Domain:

1. **User visits**: `https://itservicesfreetown.com/book-appointment.html`
2. **Form submits to**: `https://itservicesfreetown.com/api/appointments`
3. **System processes**: Validates data, generates IDs, sends emails
4. **Emails sent**: Customer confirmation + admin notification
5. **Response**: Success message with tracking ID

## Setup Steps:

### Step 1: Deploy the Code
```bash
# Commit and push changes
git add .
git commit -m "Convert to Vercel API routes for custom domain"
git push origin main

# Deploy to Vercel
vercel --prod
```

### Step 2: Set Environment Variables
In your Vercel dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | Email server |
| `SMTP_USER` | `your-email@gmail.com` | Your email |
| `SMTP_PASS` | `your-app-password` | Gmail app password |
| `ADMIN_EMAIL` | `info@itservicesfreetown.com` | Admin notifications |

### Step 3: Configure Custom Domain
1. In Vercel dashboard → Domains
2. Add `itservicesfreetown.com`
3. Configure DNS records as instructed
4. Wait for SSL certificate generation

### Step 4: Test Everything
1. Visit `https://itservicesfreetown.com`
2. Fill out the booking form
3. Submit and check for success message
4. Verify emails are received

## Email Setup Options:

### Option A: Gmail (Recommended for small volume)
```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
ADMIN_EMAIL=info@itservicesfreetown.com
```

### Option B: Custom Email Server
```env
SMTP_HOST=mail.itservicesfreetown.com
SMTP_USER=info@itservicesfreetown.com
SMTP_PASS=your-email-password
ADMIN_EMAIL=info@itservicesfreetown.com
```

### Option C: SendGrid (High volume)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
ADMIN_EMAIL=info@itservicesfreetown.com
```

## Features That Work with Custom Domain:

### ✅ Form Submissions
- All appointment data processed
- Validation and error handling
- Unique ID generation

### ✅ Email Notifications
- Customer confirmation emails
- Admin notification emails
- Professional HTML formatting
- Tracking ID included

### ✅ Data Handling
- Secure data validation
- JSON response format
- Error handling and logging

### ✅ Performance
- Fast serverless functions
- Global CDN delivery
- SSL encryption

## Testing Checklist:

- [ ] Form submits without errors
- [ ] Success message appears with tracking ID
- [ ] Customer receives confirmation email
- [ ] Admin receives notification email
- [ ] All appointment details are correct
- [ ] Custom domain loads properly
- [ ] SSL certificate is active

## Backup Plan:

If you encounter any issues, you can:

1. **Use external form service**: Formspree, Netlify Forms, or Typeform
2. **Use email service**: EmailJS for client-side email sending
3. **Hybrid approach**: Static site + external API

## Benefits of This Setup:

### 🚀 Performance
- Serverless functions scale automatically
- Global CDN for fast loading
- Minimal resource usage

### 🔒 Security
- Environment variables for sensitive data
- HTTPS encryption
- Input validation and sanitization

### 💰 Cost-Effective
- Vercel free tier handles significant traffic
- No server maintenance required
- Pay only for usage above free limits

### 🛠 Maintainable
- Modern JavaScript instead of PHP
- Easy to debug and modify
- Version controlled and deployable

## Support:

Your custom domain `itservicesfreetown.com` will work exactly like your original setup, but better:

- ✅ More reliable email delivery
- ✅ Better security
- ✅ Faster performance
- ✅ Automatic scaling
- ✅ Global availability

The form submissions and email notifications will work seamlessly with your custom domain once you complete the environment variable setup!
