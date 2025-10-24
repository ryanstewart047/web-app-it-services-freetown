# Point itservicesfreetown.com to Vercel ✅

## Current Situation
- ✅ **Vercel URL**: `it-services-freetown-git-main-ryan-stewarts-projects-6b62ac43.vercel.app` - Working perfectly with all features
- ❌ **Custom Domain**: `itservicesfreetown.com` - Still pointing to GitHub Pages (old static version)
- 🎯 **Goal**: Point custom domain to Vercel to get all new features

## Step 1: Add Domain to Vercel

### Via Vercel Dashboard (Easiest):
1. Go to https://vercel.com/dashboard
2. Click on your project: **web-app-it-services-freetown**
3. Click **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `itservicesfreetown.com`
6. Click **Add**
7. Vercel will show you DNS records to configure

### Expected DNS Records from Vercel:
You'll see something like:
```
Type: A Record
Name: @ (or itservicesfreetown.com)
Value: 76.76.21.21 (Vercel's IP - may vary)

OR

Type: CNAME
Name: @ (or www)
Value: cname.vercel-dns.com
```

## Step 2: Update DNS Records

### Where to Update:
You need to update DNS where you registered your domain (e.g., Namecheap, GoDaddy, Cloudflare, etc.)

### Current DNS (GitHub Pages):
```
Type: CNAME
Name: itservicesfreetown.com
Value: ryanstewart047.github.io
```

### New DNS (Vercel):
Replace the GitHub Pages CNAME with Vercel's records.

### Example for Most DNS Providers:

#### Option A: A Record (Recommended)
```
Type: A
Host: @ (or leave empty for root domain)
Value: 76.76.21.21 (use the IP Vercel provides)
TTL: 3600 (or automatic)
```

#### Option B: CNAME (Alternative)
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com (use what Vercel provides)
TTL: 3600

Type: A (for root domain)
Host: @
Value: 76.76.21.21 (Vercel's IP)
TTL: 3600
```

### Additional Records (Optional but Recommended):
```
Type: CNAME
Host: www
Value: itservicesfreetown.com (redirects www to non-www)
```

## Step 3: Remove GitHub Pages CNAME File (Important!)

Since you're moving to Vercel, remove the CNAME file from your repo:

```bash
cd /workspaces/web-app-it-services-freetown
rm CNAME
git add CNAME
git commit -m "Remove CNAME - migrating to Vercel"
git push origin main
```

Or if you want to keep GitHub Pages as backup:
- Keep the CNAME file
- Just update DNS to point to Vercel
- GitHub Pages will still work at ryanstewart047.github.io

## Step 4: Verify Domain Configuration

### In Vercel Dashboard:
1. Go to **Settings** → **Domains**
2. You should see `itservicesfreetown.com` with:
   - ✅ Green checkmark (valid)
   - Status: "Active"
   - SSL: "Enabled" (automatic)

### Wait for DNS Propagation:
- **Time**: 5 minutes to 48 hours (usually 10-30 minutes)
- **Check progress**: https://www.whatsmydns.net/#A/itservicesfreetown.com

### Test When Ready:
```bash
# Check if pointing to Vercel
curl -I https://itservicesfreetown.com
# Should show: server: Vercel
```

## Step 5: Add GROQ_API_KEY to Vercel (If Not Done)

**CRITICAL**: Make sure you've added the API key to Vercel:

1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Add:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `your-groq-api-key-here`
   - **Environments**: All (Production, Preview, Development)
3. Redeploy after adding

## Step 6: Test Everything

After DNS propagates and you visit `https://itservicesfreetown.com`:

### Pages to Test:
- ✅ Homepage - Should show new features
- ✅ `/admin` - Admin panel (password: ITServices2025!)
- ✅ `/blog` - Blog listing page
- ✅ `/blog/admin` - Blog admin with AI generation
- ✅ `/chat` - AI chat support
- ✅ `/troubleshoot` - AI troubleshooting
- ✅ `/receipt` - Receipt generator
- ✅ `/social` - Social media links
- ✅ `/book-appointment` - Booking form

### What Should Work:
- ✅ All CSS styling (Tailwind)
- ✅ All API routes
- ✅ AI features (chat, troubleshoot, blog generation)
- ✅ Proper navigation
- ✅ SSL certificate (automatic from Vercel)

## Troubleshooting

### Issue: Domain shows "Domain not found"
**Solution**: DNS not propagated yet. Wait 10-30 minutes.

### Issue: Still seeing old GitHub Pages version
**Solution**: 
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Try incognito/private browsing
3. Check DNS propagation status

### Issue: "Invalid Host Header"
**Solution**: Make sure you added the domain in Vercel dashboard first.

### Issue: SSL certificate error
**Solution**: Wait a few minutes - Vercel automatically provisions SSL, can take 5-10 minutes.

## Quick Reference

### DNS Provider Examples:

**Namecheap**:
1. Login → Domain List → Manage
2. Advanced DNS → Add New Record
3. Type: A, Host: @, Value: (Vercel IP)

**GoDaddy**:
1. Login → My Products → DNS
2. Add → Type: A, Name: @, Value: (Vercel IP)

**Cloudflare**:
1. Dashboard → DNS → Add Record
2. Type: A, Name: @, Value: (Vercel IP)
3. **Important**: Set Proxy status to "DNS only" (grey cloud) for Vercel

## Summary

| Step | Action | Status |
|------|--------|--------|
| 1 | Add domain to Vercel | ⏳ To Do |
| 2 | Update DNS records | ⏳ To Do |
| 3 | Wait for DNS propagation | ⏳ 10-30 min |
| 4 | Verify SSL enabled | ⏳ Auto |
| 5 | Add GROQ_API_KEY | ⏳ Critical |
| 6 | Test all features | ⏳ Final |

---

**Current**: Custom domain → GitHub Pages (old static site)  
**Target**: Custom domain → Vercel (new full-featured site)  
**Vercel URL**: Already working perfectly ✅  
**Time**: ~30 minutes total including DNS propagation  

🚀 **Once DNS updates, itservicesfreetown.com will have ALL features!**
