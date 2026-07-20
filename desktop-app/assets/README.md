# Desktop App Assets

This directory contains icon files for the desktop application.

## Current Files

- `icon.svg` - Main app icon with IT Services Freetown logo (512x512)
- `logo-original.svg` - Original IT Services logo (40x40)
- `logo-original.png` - Original IT Services logo PNG

## Icon Files Needed for Building

To build the desktop app for all platforms, you'll need to create the following icon files from the `icon.svg`:

### Windows
- `icon.ico` - Multi-resolution Windows icon (16x16, 32x32, 48x48, 256x256)

### macOS
- `icon.icns` - macOS icon bundle (16x16 to 1024x1024)

### Linux
- `icon.png` - PNG icon (512x512 recommended)

## Creating Icons from SVG

The `icon.svg` file is already 512x512 and uses the IT Services Freetown branding with:
- Company logo (computer monitor + mobile phone + repair tools)
- Blue gradient background matching brand colors
- USB detection badge (green)
- Professional appearance

### Online Tools (Easiest)
1. **CloudConvert**: https://cloudconvert.com/svg-to-ico
   - Upload `icon.svg`
   - Convert to ICO (Windows)
   
2. **SVG to PNG**: https://svgtopng.com/
   - Upload `icon.svg`
   - Download as 512x512 PNG
   - Then convert PNG to ICO/ICNS

3. **ICO Convert**: https://icoconvert.com/
   - Upload the PNG from step 2
   - Select multi-resolution
   - Download ICO

### Using Inkscape (Free Desktop Software)
```bash
# Install Inkscape first
# Windows: Download from inkscape.org
# Mac: brew install inkscape
# Linux: sudo apt-get install inkscape

# Convert SVG to PNG
inkscape icon.svg --export-type=png --export-filename=icon.png -w 512 -h 512

# For higher resolution (1024x1024)
inkscape icon.svg --export-type=png --export-filename=icon-1024.png -w 1024 -h 1024
```

### Using ImageMagick (Command Line)
```bash
# Install ImageMagick
# Windows: Download from imagemagick.org
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Convert SVG to PNG
convert -background none icon.svg -resize 512x512 icon.png

# Convert PNG to ICO (Windows)
convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# Convert PNG to ICNS (macOS - requires iconutil on Mac)
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
rm -rf icon.iconset
```

## Quick Start (Recommended)

1. **Convert SVG to PNG first** (using any tool above):
   ```bash
   # Result: icon.png (512x512)
   ```

2. **Convert to ICO** (for Windows):
   - Visit https://icoconvert.com/
   - Upload `icon.png`
   - Select all sizes (16, 32, 48, 256)
   - Download as `icon.ico`

3. **Convert to ICNS** (for macOS - requires Mac):
   ```bash
   # Use the ImageMagick commands above
   # Or use Icon Composer/Image2Icon app
   ```

4. **For Linux**, just rename:
   ```bash
   cp icon.png icon.png  # Already 512x512
   ```

## Branding

The icon features the IT Services Freetown logo:
- 🖥️ Computer monitor (desktop/laptop repairs)
- 📱 Mobile phone (mobile device services)
- 🔧 Repair tools (technical services)
- 🔌 USB badge (device detection feature)
- Brand colors: Dark blue (#040e40) to purple (#1c1891)

## Note

The SVG file is the source of truth. All platform-specific icons are generated from `icon.svg`.
