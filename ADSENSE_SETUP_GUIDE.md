# Google AdSense Setup Guide

Your IT Services Freetown website is now ready for Google AdSense integration! Follow these steps to start earning revenue from your website.

## 📍 Ad Placements

We've strategically placed ads on your highest-traffic pages:

### 1. **Blog Page** (`/blog`)
- ✅ Top banner ad (above posts)
- ✅ In-feed ads (between every 2 posts)
- ✅ Bottom banner ad (before footer)
- **Why?** Blog content attracts readers who spend time on your site, increasing ad impressions and clicks

### 2. **Chat Support Page** (`/chat`)
- ✅ Top banner ad (above chat interface)
- **Why?** Users seeking help often spend several minutes chatting, providing good ad visibility

### 3. **Troubleshooting Page** (`/troubleshoot`)
- ✅ Top banner ad (above form)
- ✅ In-article ad (before AI diagnosis results)
- **Why?** Technical troubleshooting content is valuable for tech-related ads (higher CPC)

## 🚀 Step-by-Step Setup

### Step 1: Apply for Google AdSense

1. Go to [https://www.google.com/adsense](https://www.google.com/adsense)
2. Click "Get Started"
3. Sign in with your Google account
4. Fill out the application:
   - **Website URL**: `https://ryanstewart047.github.io/web-app-it-services-freetown/`
   - **Country**: Sierra Leone
   - **Payment information**: Your bank details
5. Accept the Terms and Conditions
6. Submit your application

**Note:** Approval typically takes 1-2 weeks. Google will review your site for:
- ✅ Sufficient content (you have this with your blog)
- ✅ Original content (your IT service content is original)
- ✅ Easy navigation (your site has good UX)
- ✅ Compliance with policies

### Step 2: Add AdSense Verification Code

Once you receive the verification email from Google:

1. Copy the verification code from your AdSense account
2. Open `app/layout.tsx` in your project
3. Find this line (around line 40):
   ```tsx
   src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
   ```
4. Replace `ca-pub-XXXXXXXXXXXXXXXX` with YOUR Publisher ID (e.g., `ca-pub-1234567890123456`)

### Step 3: Configure Ad Units

After approval, Google will provide ad unit codes:

1. In your AdSense dashboard, go to **Ads** > **Overview**
2. Click **"By ad unit"** > **"Display ads"**
3. Create ad units for each placement:
   - **Display Ad** (responsive) - for blog/chat/troubleshoot banners
   - **In-feed Ad** - for blog post list
   - **In-article Ad** - for within blog content/troubleshooting

4. Copy the **data-ad-slot** numbers for each ad unit

5. Open `src/components/AdSense.tsx` and update the slot IDs:
   ```tsx
   // Line 58: Change this
   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Your Publisher ID
   
   // Line 71: Display Ad slot
   adSlot="1111111111" // Replace with your display ad slot
   
   // Line 80: In-Article Ad slot
   adSlot="2222222222" // Replace with your in-article ad slot
   
   // Line 98: In-Feed Ad slot
   adSlot="4444444444" // Replace with your in-feed ad slot
   ```

### Step 4: Deploy Your Changes

Run these commands to deploy:

```bash
npm run build-static
npm run deploy
```

### Step 5: Verify Ads Are Working

1. Visit your live site: `https://ryanstewart047.github.io/web-app-it-services-freetown/`
2. Go to the Blog page
3. You should see placeholder ad slots (may show "Advertisement" or blank until approved)
4. After approval, real ads will appear within 24 hours

## 💰 Revenue Potential

Based on your IT services niche:

| Metric | Estimate |
|--------|----------|
| **CPC (Cost Per Click)** | $0.50 - $5.00 |
| **CTR (Click-Through Rate)** | 1% - 3% |
| **Revenue per 1,000 views** | $5 - $30 |

**Example:** With 1,000 monthly visitors:
- 10,000 page views (10 pages/visitor)
- 2% CTR = 200 clicks
- $2 CPC = **$400/month potential**

## 📋 AdSense Policy Checklist

Make sure your content follows these rules:

- ✅ No copyrighted content without permission
- ✅ Original blog posts (your AI-generated content is fine)
- ✅ No adult content
- ✅ No violent or hateful content
- ✅ No illegal content
- ✅ Clear privacy policy (add one if needed)
- ✅ Contact information visible (you have this)

## 🎯 Tips for Maximizing Revenue

### 1. **Create More Blog Content**
- Write 1-2 blog posts per week
- Focus on IT tips, device troubleshooting, tech news
- Longer articles = more ad impressions

### 2. **Optimize Ad Placement**
Current placements are optimal, but you can:
- Add more ads after you get approved (max 3 per page is good)
- Test different ad formats
- Monitor AdSense reports to see which pages perform best

### 3. **Drive Traffic**
- Share blog posts on social media
- Use WhatsApp Business to share content
- Optimize for Google search (SEO)
- Create valuable content people want to read

### 4. **Monitor Performance**
Check your AdSense dashboard weekly:
- Which pages get the most clicks?
- What's your average CPC?
- Which ad units perform best?

## 🔧 Troubleshooting

### Ads not showing after approval?

1. **Check your Publisher ID** in `app/layout.tsx`
2. **Verify ad slot IDs** in `src/components/AdSense.tsx`
3. **Clear browser cache** and revisit the site
4. **Wait 24-48 hours** after making changes

### "This site can't be reached" in AdSense?

- Your site URL should be: `https://ryanstewart047.github.io/web-app-it-services-freetown/`
- Not `localhost` or any development URL

### Low earnings?

- **More content** = more page views = more revenue
- **Better content** = longer visits = more ad impressions
- **Targeted keywords** = higher CPC (IT/tech keywords pay well)

## 📞 Need Help?

Contact Google AdSense Support:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community Forums](https://support.google.com/adsense/community)

## ✅ Current Status

- [x] Ad slots created on all major pages
- [x] AdSense script added to site layout
- [x] Ad components configured
- [ ] **Your action**: Apply for AdSense
- [ ] **Your action**: Add your Publisher ID
- [ ] **Your action**: Configure ad slot IDs after approval
- [ ] **Your action**: Deploy updated site

---

**Next Steps:**
1. Apply for Google AdSense today
2. While waiting for approval, keep creating blog content
3. Once approved, update the IDs in the code files
4. Deploy and start earning!

Good luck! 🎉
