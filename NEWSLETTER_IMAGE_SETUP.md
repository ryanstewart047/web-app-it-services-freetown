# Newsletter Pop-up Image Setup Guide

## Image Requirements

The newsletter pop-up now features a beautiful two-column layout with:
- **Left side**: Image of an African woman smiling while using a laptop
- **Right side**: Newsletter subscription form

### Image Specifications

**File Path**: `/public/assets/newsletter-woman.jpg`

**Dimensions**: 
- Recommended: 500×600px or similar 5:6 aspect ratio
- Minimum: 400×480px
- Will be displayed at full container height on desktop

**Format**: 
- JPG, PNG, or WebP
- Optimized for web (compressed)
- File size: 100-200KB recommended

### How to Add Your Image

1. **Find or create an image** of an African woman:
   - Smiling, professional appearance
   - Using/looking at a laptop
   - Good lighting
   - Stock photo sites: Pexels, Unsplash, Pixabay (search "African woman laptop")
   - Or hire a photographer for authentic branding

2. **Place the image file**:
   - Save as: `/public/assets/newsletter-woman.jpg`
   - Create the `/public/assets/` directory if it doesn't exist

3. **The component automatically handles**:
   - Image scaling and responsiveness
   - Responsive layout (image hidden on mobile, full width on desktop)
   - Fallback placeholder if image not found
   - Rounded corners and shadow effects
   - Subtle background gradient effects

### Image Design Tips

✅ **Do**:
- Use high-quality, professional images
- Show genuine smiles and engagement
- Ensure the laptop is clearly visible
- Use warm, inviting lighting
- Keep the background slightly out of focus

❌ **Don't**:
- Use outdated or pixelated images
- Use generic/stock photos that look fake
- Have harsh shadows or poor lighting
- Use images with text/watermarks

### Responsive Behavior

- **Desktop (md and larger)**: 
  - Two-column layout
  - Image visible on left
  - Form on right

- **Mobile and Tablet**: 
  - Single column layout
  - Image hidden
  - Form takes full width

### Image Fallback

If the image file is not found, the component displays a gray placeholder that says "Add your photo here" so you know to upload the image.

### Example Stock Image Sources

Free high-quality African photos:
- **Unsplash**: unsplash.com - search "African woman"
- **Pexels**: pexels.com - search "African woman laptop"
- **Pixabay**: pixabay.com - search "woman computer"
- **Freepik**: freepik.com - search "African woman working"

### Testing

After adding the image:
1. Clear browser cache
2. Visit your site homepage
3. Wait 8 seconds for the pop-up to appear
4. Verify the image displays correctly
5. Test on mobile to confirm layout works

### CSS Classes Applied

The image element uses:
- `w-full h-full object-cover` - Fills container while maintaining aspect ratio
- `rounded-xl` - Rounded corners
- `shadow-lg` - Drop shadow for depth

### Customizing Image Appearance

To adjust the image styling, edit in `src/components/NewsletterPopup.tsx`:

```tsx
<img
  src="/assets/newsletter-woman.jpg"
  alt="African woman smiling at laptop"
  className="relative z-10 w-full h-full object-cover rounded-xl shadow-lg"
  // Modify these classes to adjust appearance
/>
```

Available adjustments:
- `rounded-xl` → `rounded-2xl` (more rounded)
- `shadow-lg` → `shadow-xl` (stronger shadow)
- `w-full h-full` → adjust sizing if needed

### Questions?

If the image doesn't show:
1. Check the file exists at `/public/assets/newsletter-woman.jpg`
2. Verify the filename matches exactly (case-sensitive)
3. Check browser console for 404 errors
4. Clear browser cache and reload
5. Try a different image format if JPG doesn't work
