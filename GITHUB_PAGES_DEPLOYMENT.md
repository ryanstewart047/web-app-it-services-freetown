# GitHub Pages Deployment Guide

## 🚀 Deploy IT Services Freetown to GitHub Pages

Your website will be available at: `https://ryanstewart047.github.io/web-app-it-services-freetown/`

## Setup Steps:

### Step 1: Enable GitHub Pages
1. Go to your repository: https://github.com/ryanstewart047/web-app-it-services-freetown
2. Click **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. The workflow will automatically deploy when you push to main or mobile-popup-fix

### Step 2: Form Handling Setup (Choose One Option)

#### Option A: Formspree (Recommended - Free)
1. Go to [Formspree.io](https://formspree.io)
2. Sign up for free account
3. Create a new form
4. Copy your form endpoint (looks like `https://formspree.io/f/xzbqklmn`)
5. Replace `YOUR_FORM_ID` in `book-appointment.html` with your actual form ID

#### Option B: Netlify Forms
1. Deploy a copy to Netlify
2. Add `netlify` attribute to your form
3. Forms will be handled by Netlify

#### Option C: EmailJS (Client-side email)
1. Sign up at [EmailJS.com](https://emailjs.com)
2. Set up email service
3. Add EmailJS JavaScript to your form

### Step 3: Update Form Configuration

Replace the form action in `book-appointment.html`:

```html
<!-- Replace this line -->
<form id="appointmentForm" class="space-y-8" action="https://formspree.io/f/YOUR_FORM_ID" method="post">

<!-- With your actual Formspree endpoint -->
<form id="appointmentForm" class="space-y-8" action="https://formspree.io/f/xzbqklmn" method="post">
```

### Step 4: Update JavaScript for Form Submission

For Formspree, update the form submission JavaScript:

```javascript
// Replace the existing fetch code with:
try {
    const response = await fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (response.ok) {
        alert('Appointment request submitted successfully! We will contact you soon to confirm.');
        this.reset();
    } else {
        throw new Error('Form submission failed');
    }
} catch (error) {
    console.error('Form submission error:', error);
    alert('There was an error submitting your form. Please try again or contact us directly.');
}
```

## GitHub Pages Limitations & Solutions:

### ❌ What Doesn't Work on GitHub Pages:
- Server-side processing (PHP, Node.js APIs)
- Database operations
- Server-side email sending

### ✅ What Works Perfectly:
- Static HTML, CSS, JavaScript
- Client-side interactions
- External API calls
- Form submissions to external services

## Alternative Hosting Options:

If you need full server-side functionality:

### Vercel (Recommended for your API routes)
- Supports your current `/api/appointments.js`
- Custom domains work perfectly
- Free tier available
- Deploy with: `vercel --prod`

### Netlify
- Supports serverless functions
- Form handling built-in
- Custom domains
- Deploy via GitHub integration

### Railway
- Full server hosting
- Database support
- Custom domains
- Deploy via GitHub

## Current Deployment Status:

After pushing to GitHub:
1. ✅ GitHub Actions will automatically build and deploy
2. ✅ Site will be available at your GitHub Pages URL
3. ⚠️ Forms need external service setup (Formspree recommended)
4. ✅ All static features work perfectly

## Testing Your Deployment:

1. Push your code to GitHub
2. Check Actions tab for deployment status
3. Visit your GitHub Pages URL
4. Test all pages and functionality
5. Set up form handling service
6. Test form submissions

## Recommended Next Steps:

1. **For quick deployment**: Use GitHub Pages + Formspree
2. **For full functionality**: Deploy to Vercel with your API routes
3. **For custom domain**: Set up DNS after choosing hosting platform

Your static HTML files are perfectly ready for GitHub Pages deployment! 🎉
