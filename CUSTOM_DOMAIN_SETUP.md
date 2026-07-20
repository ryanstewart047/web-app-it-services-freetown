# Custom Domain Setup: itservicesfreetown.com

## Overview
This guide will help you set up `itservicesfreetown.com` as your custom domain on Vercel after the static site deployment.

## Step-by-Step Domain Setup

### 1. Deploy to Vercel First
Your project is now ready for static deployment. Deploy it:

```bash
# Option 1: Auto-deploy via GitHub
# Vercel will automatically deploy when you push to GitHub (if connected)

# Option 2: Manual deployment
npx vercel --prod
```

### 2. Add Custom Domain in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `web-app-it-services-freetown`

2. **Navigate to Domain Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Domains** in the sidebar

3. **Add Your Domain**
   - Click **"Add Domain"**
   - Enter: `itservicesfreetown.com`
   - Click **"Add"**

4. **Add WWW Subdomain (Recommended)**
   - Click **"Add Domain"** again
   - Enter: `www.itservicesfreetown.com`
   - Click **"Add"**
   - Set this to redirect to `itservicesfreetown.com`

### 3. Configure DNS Records

You'll need to update your domain's DNS records. Vercel will show you exactly what records to add.

#### Required DNS Records:

**For `itservicesfreetown.com`:**
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 300 (or your provider's default)
```

**For `www.itservicesfreetown.com`:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300 (or your provider's default)
```

#### Alternative (If A record doesn't work):
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 300
```

### 4. DNS Provider Instructions

#### Popular DNS Providers:

**Cloudflare:**
1. Login to Cloudflare Dashboard
2. Select your domain `itservicesfreetown.com`
3. Go to **DNS** tab
4. Add the A/CNAME records as specified above
5. Set Proxy Status to "Proxied" (orange cloud) for better performance

**Namecheap:**
1. Login to Namecheap Account
2. Go to Domain List → Manage
3. Click **Advanced DNS** tab
4. Add the A/CNAME records
5. Remove any conflicting records

**GoDaddy:**
1. Login to GoDaddy Account
2. Go to **My Products** → **DNS**
3. Click **Manage** next to your domain
4. Add the A/CNAME records
5. Delete any conflicting records

**Google Domains:**
1. Login to Google Domains
2. Select your domain
3. Go to **DNS** tab
4. Add Custom Resource Records
5. Add the A/CNAME records

### 5. Verify Domain Setup

After adding DNS records:

1. **Wait for Propagation** (5-48 hours, usually ~1 hour)
2. **Check Domain Status** in Vercel Dashboard
3. **Test Your Domain:**
   ```bash
   # Check if domain resolves
   nslookup itservicesfreetown.com
   
   # Test in browser
   https://itservicesfreetown.com
   https://www.itservicesfreetown.com
   ```

### 6. Enable HTTPS (Automatic)

Vercel automatically provides SSL certificates for custom domains:
- ✅ Free SSL certificate
- ✅ Automatic renewal
- ✅ HTTPS redirect
- ✅ HTTP/2 support

### 7. Performance Optimizations

#### Enable Additional Features:
1. **Edge Network** - Already enabled (global CDN)
2. **Compression** - Automatic gzip/brotli
3. **Image Optimization** - For your logo and images
4. **Caching Headers** - Automatic

#### Optional: Add Security Headers
Create `vercel.json` headers section (already configured):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues:

**Domain Not Connecting:**
- Wait longer for DNS propagation (up to 48 hours)
- Check DNS records are exactly as specified
- Clear browser cache and try incognito mode

**SSL Certificate Issues:**
- Wait 24 hours for certificate generation
- Try re-adding the domain in Vercel
- Contact Vercel support if issues persist

**www vs non-www:**
- Set up both versions
- Choose primary version in Vercel settings
- Set redirects appropriately

### Verification Commands:

```bash
# Check DNS propagation
dig itservicesfreetown.com
dig www.itservicesfreetown.com

# Check SSL certificate
curl -I https://itservicesfreetown.com

# Test website
curl -s -o /dev/null -w "%{http_code}" https://itservicesfreetown.com
```

## Final Checklist

- [ ] Project deployed to Vercel
- [ ] Domain added in Vercel dashboard
- [ ] DNS A record added for `@`
- [ ] DNS CNAME record added for `www`
- [ ] DNS propagation completed
- [ ] Domain shows "Connected" in Vercel
- [ ] SSL certificate issued
- [ ] Website accessible via custom domain
- [ ] All pages working correctly
- [ ] Mobile menu functioning
- [ ] Forms submitting properly

## Expected URLs

After setup, your website will be available at:
- ✅ `https://itservicesfreetown.com`
- ✅ `https://www.itservicesfreetown.com`
- ✅ `http://itservicesfreetown.com` (redirects to HTTPS)
- ✅ `http://www.itservicesfreetown.com` (redirects to HTTPS)

## Support

If you encounter issues:
1. Check Vercel Dashboard for error messages
2. Verify DNS settings with your provider
3. Contact Vercel support: https://vercel.com/help
4. Check domain propagation: https://dnschecker.org

---

Your IT Services Freetown website will be live at `itservicesfreetown.com` once DNS propagation completes! 🚀
