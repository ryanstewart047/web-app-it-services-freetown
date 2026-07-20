# AdSense Manual Ad Placements - Setup Guide

## Current Status

✅ **Auto Ads Enabled** - Google AdSense Auto ads are running on your site  
⏳ **Manual Ads Hidden** - Manual ad placements are hidden to prevent 400 errors  
📋 **Waiting for Approval** - AdSense Publisher ID: ca-pub-9989697800650646

## Why Manual Ads Are Hidden

Before AdSense approval, manual ad placements with placeholder ad slot IDs cause:
- **400 errors** in browser console (dozens of them as you scroll)
- **Console spam** that makes debugging difficult
- **No benefit** since ads won't show until approval anyway

**Solution**: Manual ad components return `null` until AdSense is approved.

## What's Still Working

✅ **Auto Ads** - Google automatically places ads on your pages  
✅ **AdSense Script** - Loaded correctly without errors  
✅ **Site Compliance** - All AdSense policies followed

## After AdSense Approval

When your AdSense account is approved:

### Step 1: Get Your Ad Slot IDs

1. Log into [Google AdSense](https://adsense.google.com)
2. Go to **Ads** → **By ad unit** → **Display ads**
3. Create ad units for:
   - Display Ad (responsive banner)
   - In-Feed Ad (blog listing)
   - In-Article Ad (blog posts)
   - Multiplex Ad (native ads)
   - Horizontal Ad (headers/footers)

4. Copy each ad slot ID (looks like: `1234567890`)

### Step 2: Update Ad Slot IDs

Edit `/src/components/AdSense.tsx`:

```tsx
// Replace placeholder IDs with your real ad slot IDs
export function DisplayAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="YOUR_DISPLAY_AD_SLOT_ID" // ← Replace this
      adFormat="auto"
      className={className}
    />
  )
}

export function InFeedAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="YOUR_IN_FEED_AD_SLOT_ID" // ← Replace this
      adFormat="auto"
      className={className}
    />
  )
}

// ... do the same for all ad types
```

### Step 3: Enable Manual Ads

Update `.env.local`:

```bash
# Change from false to true
NEXT_PUBLIC_ADSENSE_APPROVED=true
```

### Step 4: Deploy

```bash
# Commit changes
git add .
git commit -m "Enable AdSense manual ads after approval"
git push

# Or update environment variable on Vercel:
# Dashboard → Project → Settings → Environment Variables
# Add: NEXT_PUBLIC_ADSENSE_APPROVED = true
```

### Step 5: Verify

1. Visit your site
2. Open browser console (F12)
3. You should see:
   - ✅ No 400 errors
   - ✅ Ads loading successfully
   - ✅ `data-ad-status="filled"` on ad elements

## Current Ad Placements

When enabled, ads will appear at:

**Blog Page** (`/blog`):
- Top banner (DisplayAd)
- After every 2 posts (InFeedAd)
- Bottom banner (DisplayAd)

**Homepage** (`/`):
- (Currently using Auto Ads only)

**Other Pages**:
- (Auto Ads placement by Google)

## Troubleshooting

### Still seeing 400 errors?

1. Check environment variable:
   ```bash
   grep ADSENSE_APPROVED .env.local
   ```
   Should show: `NEXT_PUBLIC_ADSENSE_APPROVED=true`

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

### Ads not showing?

- **Before approval**: Only Auto Ads work
- **After approval**: Update slot IDs and enable manual ads
- **Check status**: Look for `data-ad-status` attribute on ad elements

### Want to test manual ads?

You can temporarily enable them before approval:
```bash
NEXT_PUBLIC_ADSENSE_APPROVED=true
```

But you'll see 400 errors since the slot IDs are placeholders. Not recommended.

## Benefits of This Approach

✅ **Clean Console** - No error spam while waiting for approval  
✅ **Auto Ads Work** - Google still places ads automatically  
✅ **Easy Enable** - Single environment variable toggles manual ads  
✅ **Production Ready** - No code changes needed after approval  
✅ **Better UX** - Site loads faster without failed ad requests

## Related Files

- `/src/components/AdSense.tsx` - Ad component definitions
- `/app/blog/page.tsx` - Blog page with ad placements
- `/app/layout.tsx` - AdSense script tag
- `.env.local` - Environment configuration

## Support

If you need help after approval:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
- Check `ADSENSE_SETUP_GUIDE.md` for initial setup

---

**Last Updated**: November 29, 2025  
**Status**: Awaiting AdSense Approval
