# Email Configuration for Custom Domain Setup

## Environment Variables for Vercel

When you deploy to Vercel with your custom domain (itservicesfreetown.com), you need to set up these environment variables in your Vercel dashboard:

### Required Environment Variables:

1. **SMTP_HOST** = `smtp.gmail.com` (or your email provider's SMTP server)
2. **SMTP_USER** = `your-email@gmail.com` (your Gmail address)
3. **SMTP_PASS** = `your-app-password` (Gmail App Password - NOT your regular password)
4. **ADMIN_EMAIL** = `info@itservicesfreetown.com` (where appointment notifications are sent)

### How to Set Up Gmail App Password:

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to Google Account Settings → Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password as your `SMTP_PASS`

### Setting Environment Variables in Vercel:

#### Option 1: Via Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable with its value
4. Set Environment to "Production"
5. Click "Save"

#### Option 2: Via Vercel CLI
```bash
vercel env add SMTP_HOST
# Enter: smtp.gmail.com

vercel env add SMTP_USER
# Enter: your-email@gmail.com

vercel env add SMTP_PASS
# Enter: your-16-character-app-password

vercel env add ADMIN_EMAIL
# Enter: info@itservicesfreetown.com
```

### Test Your Setup:

After setting environment variables:
1. Redeploy your site
2. Test the booking form on your custom domain
3. Check if emails are received

### Alternative Email Providers:

If you don't want to use Gmail, you can use:

**SendGrid:**
- SMTP_HOST: `smtp.sendgrid.net`
- SMTP_USER: `apikey`
- SMTP_PASS: `your-sendgrid-api-key`

**Mailgun:**
- SMTP_HOST: `smtp.mailgun.org`
- SMTP_USER: `your-mailgun-username`
- SMTP_PASS: `your-mailgun-password`

**Custom Email (if you have cPanel hosting):**
- SMTP_HOST: `mail.yourdomain.com`
- SMTP_USER: `info@itservicesfreetown.com`
- SMTP_PASS: `your-email-password`

### Security Notes:

- ✅ Environment variables are secure and not visible in your code
- ✅ They work perfectly with custom domains
- ✅ Different values can be set for development and production
- ❌ Never commit email passwords to your GitHub repository
- ❌ Don't use your main Gmail password - always use App Passwords

### After Setup:

Your custom domain (itservicesfreetown.com) will:
- ✅ Handle form submissions properly
- ✅ Send confirmation emails to customers
- ✅ Send notification emails to you
- ✅ Generate tracking IDs for appointments
- ✅ Work exactly like your original PHP setup

### Deployment Command:

After adding environment variables, redeploy:
```bash
vercel --prod
```

Or simply push to GitHub if you have auto-deployment enabled.
