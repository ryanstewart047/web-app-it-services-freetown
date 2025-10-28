# Desktop App Assets

This directory contains icon files for the desktop application.

## Icon Files Needed

To build the desktop app for all platforms, you'll need to create the following icon files from the `icon.svg`:

### Windows
- `icon.ico` - Multi-resolution Windows icon (16x16, 32x32, 48x48, 256x256)

### macOS
- `icon.icns` - macOS icon bundle (16x16 to 1024x1024)

### Linux
- `icon.png` - PNG icon (512x512 recommended)

## Creating Icons

You can use online tools or software to convert the SVG:

### Online Tools
1. **CloudConvert**: https://cloudconvert.com/svg-to-ico
2. **ICO Convert**: https://icoconvert.com/
3. **PNG to ICO**: https://www.pngtoico.com/

### Using ImageMagick (Command Line)
```bash
# Convert SVG to PNG
convert icon.svg -resize 512x512 icon.png

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
```

## Note
The SVG file is included as the source. You'll need to generate the platform-specific icon files before building for distribution.
