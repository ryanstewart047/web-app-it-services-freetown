# Offer Popup Setup Guide

The offer popup system is now installed and will show promotional offers to visitors 30 seconds after they open any page on your site.

## ✅ What's Already Done

1. ✅ Popup component created (`components/OfferPopup.tsx`)
2. ✅ API routes set up (`/api/offer`, `/api/offer/manage`)
3. ✅ Admin interface created at `/offer-admin`
4. ✅ Link added to main admin panel ("Manage Offers" button)
5. ✅ Popup integrated into all pages (shows after 30 seconds)

## 🔧 Setup Required (One-Time)

### Step 1: Create a GitHub Gist

You need to create a GitHub Gist to store your offers:

1. **Go to** https://gist.github.com/
2. **Create a new gist** with these details:
   - **Filename:** `current-offer.json`
   - **Content:** Paste this initial offer:
   
   ```json
   {
     "id": "1",
     "title": "Welcome Offer - 20% Off All Repairs!",
     "description": "Get 20% off on all computer and mobile repairs this week!\n\nValid for:\n✓ Screen replacements\n✓ Battery repairs\n✓ Software fixes\n✓ Data recovery\n\nBook now and save!",
     "imageUrl": "https://i.postimg.cc/13b2KwK8/images.jpg",
     "isActive": false,
     "createdAt": "2025-01-24T00:00:00.000Z",
     "updatedAt": "2025-01-24T00:00:00.000Z"
   }
   ```
   
3. **Create public gist**
4. **Copy the Gist ID** from the URL
   - Example URL: `https://gist.github.com/ryanstewart047/abc123def456`
   - Gist ID: `abc123def456`

### Step 2: Add Gist ID to Vercel

1. **Go to** https://vercel.com/ryan-stewarts-projects-6b62ac43/it-services-freetown/settings/environment-variables
2. **Add new environment variable:**
   - **Name:** `OFFER_GIST_ID`
   - **Value:** (paste the Gist ID you copied)
   - **Environment:** Production, Preview, Development (all three)
3. **Save**
4. **Redeploy** your site for the changes to take effect

## 📝 How to Use

### Access the Admin Interface

1. Go to your main admin panel: https://www.itservicesfreetown.com/admin
2. Login with admin credentials
3. Click the **"Manage Offers"** button (orange) in Quick Controls

### Create/Update an Offer

1. In the Offer Admin page:
   - **Left Side (Image):**
     - Click "Add Image URL" or paste a URL directly
     - Upload images to [Imgur](https://imgur.com) or [PostImages](https://postimages.org) first
   
   - **Right Side (Content):**
     - Enter an attractive title (max 100 characters)
     - Write your offer description (max 500 characters)
     - Check "Show this offer to visitors" to activate it

2. Click **"Save Offer"**
3. Your offer will now appear to visitors after 30 seconds!

### Deactivate an Offer

- Click the **"Deactivate"** button in the admin interface
- The popup will stop showing to visitors immediately

## 🎯 How It Works

### For Visitors:
1. Visitor opens any page on your website
2. After 30 seconds, the offer popup appears
3. The popup shows once per browser session (won't annoy visitors)
4. Visitors can close it with the X button or "Got It!" button

### Popup Features:
- Beautiful gradient design (purple to pink)
- Responsive layout (works on mobile and desktop)
- Image on the left, text on the right
- "TODAY'S OFFER" badge
- Smooth animations
- Backdrop blur effect

## 🖼️ Image Guidelines

**Recommended:**
- **Size:** 400x400 to 800x800 pixels
- **Format:** JPG or PNG
- **Subject:** Product images, promotional graphics, service photos
- **Upload to:** Imgur.com or PostImages.org

**Example Images:**
- Product photos
- Service illustrations
- Discount badges
- Before/after comparisons

## 💡 Offer Ideas

**Sample Offers You Can Create:**

1. **Seasonal Discounts:**
   - "New Year Special - 30% Off All Repairs"
   - "Back to School - Free Diagnostics"

2. **Service Promotions:**
   - "Free Screen Protector with Every Repair"
   - "Data Recovery - 50% Off This Week"

3. **Limited Time:**
   - "Flash Sale - Today Only!"
   - "Weekend Special - Book Now"

4. **Bundle Deals:**
   - "Phone + Laptop Repair - Save 40%"
   - "3 Repairs for the Price of 2"

## 🔄 Testing the Popup

1. **Test on your site:**
   - Visit https://www.itservicesfreetown.com
   - Wait 30 seconds
   - Popup should appear (if offer is active)

2. **Test again:**
   - Close your browser completely
   - Open a new browser/incognito window
   - Visit any page
   - Wait 30 seconds

3. **Preview before publishing:**
   - Use the preview section in the admin interface
   - See exactly how it will look before activating

## 📊 Offer Management Tips

1. **Keep titles short and punchy** - Grab attention quickly
2. **Use emojis or checkmarks** - Make descriptions scannable
3. **Update regularly** - Fresh offers keep visitors engaged
4. **Test on mobile** - Ensure images look good on small screens
5. **Use high-quality images** - Professional photos build trust

## 🚨 Troubleshooting

### Popup not showing?
1. Check if offer is set to **"isActive": true**
2. Verify OFFER_GIST_ID is added to Vercel
3. Clear browser cache and try in incognito mode
4. Check browser console for errors (F12)

### Image not displaying?
1. Make sure URL is direct link to image (ends in .jpg, .png, etc.)
2. Test URL in new browser tab - should show just the image
3. Use image hosting services (Imgur, PostImages)
4. Avoid Google Drive or Dropbox direct links

### Changes not appearing?
1. Wait 30-60 seconds for Vercel to redeploy
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Try incognito/private browsing mode

## 📱 Access URLs

- **Offer Admin:** https://www.itservicesfreetown.com/offer-admin
- **Main Admin:** https://www.itservicesfreetown.com/admin
- **Your Site:** https://www.itservicesfreetown.com

---

## ✨ Features Summary

✅ Shows after 30 seconds on all pages
✅ Once per session (not annoying)
✅ Beautiful responsive design
✅ Easy to update via admin panel
✅ Image + text layout
✅ Activate/deactivate anytime
✅ Preview before publishing
✅ Mobile-friendly
✅ Smooth animations

**Your promotional offer system is ready to boost engagement! 🎉**
