# How to Build and Release the Desktop App

## 🚀 Quick Release Guide

The desktop app download buttons now point to GitHub Releases. Here's how to build and publish the installers:

## Step 1: Build the Desktop App

### Prerequisites
```bash
# Make sure you have Node.js 16+ installed
node --version

# Navigate to desktop app
cd desktop-app

# Install dependencies
npm install
```

### Create Platform-Specific Icons (Optional but Recommended)

Before building, create the icon files:

**Quick Method:**
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `desktop-app/assets/icon.svg`
3. Convert to 512x512 PNG
4. Save as `desktop-app/assets/icon.png`

**For Windows (.ico):**
1. Go to https://icoconvert.com/
2. Upload the `icon.png` from above
3. Select sizes: 16, 32, 48, 256
4. Download as `icon.ico`
5. Save to `desktop-app/assets/icon.ico`

**For macOS (.icns):**
- Requires a Mac to build properly
- Or use online tool: https://cloudconvert.com/png-to-icns

### Build Installers

```bash
# Build for Windows (on any OS)
npm run build:win

# Build for macOS (requires macOS)
npm run build:mac

# Build for Linux (on Linux or WSL)
npm run build:linux

# Build for all platforms (requires macOS for Mac builds)
npm run build:all
```

### Output Location

After building, installers will be in `desktop-app/dist/`:

**Windows:**
- `IT Services Device Detector Setup 1.0.0.exe` (Installer)
- `IT Services Device Detector 1.0.0.exe` (Portable)

**macOS:**
- `IT Services Device Detector-1.0.0.dmg`
- `IT Services Device Detector-1.0.0-mac.zip`

**Linux:**
- `IT Services Device Detector-1.0.0.AppImage`
- `it-services-device-detector_1.0.0_amd64.deb`

## Step 2: Create GitHub Release

### Option A: Using GitHub Web Interface (Easiest)

1. **Go to Releases:**
   ```
   https://github.com/ryanstewart047/web-app-it-services-freetown/releases
   ```

2. **Click "Draft a new release"**

3. **Fill in Release Details:**
   - **Tag version:** `v1.0.0`
   - **Release title:** `IT Services Device Detector v1.0.0`
   - **Description:**
     ```markdown
     # IT Services Device Detector - Desktop Application
     
     Professional Android device detection with full ADB integration.
     
     ## ✨ Features
     - Get complete device information including IMEI
     - 50+ device properties in seconds
     - Battery, RAM, storage, network details
     - Export as JSON or TXT
     - 100% offline and private
     
     ## 📥 Downloads
     
     **Windows:**
     - **IT-Services-Device-Detector-Setup-1.0.0.exe** - Recommended (Full installer)
     - **IT-Services-Device-Detector-1.0.0-portable.exe** - Portable version
     
     **macOS:**
     - **IT-Services-Device-Detector-1.0.0.dmg** - Recommended (Disk image)
     - **IT-Services-Device-Detector-1.0.0-mac.zip** - ZIP archive
     
     **Linux:**
     - **IT-Services-Device-Detector-1.0.0.AppImage** - Recommended (Universal)
     - **it-services-device-detector_1.0.0_amd64.deb** - Debian package
     
     ## ⚙️ Requirements
     - ADB (Android Debug Bridge) must be installed
     - USB cable to connect Android device
     - USB Debugging enabled on device
     
     ## 📚 Documentation
     - [ADB Installation Guide](https://yoursite.com/adb-guide)
     - [Download Page](https://yoursite.com/download-app)
     - [GitHub Repository](https://github.com/ryanstewart047/web-app-it-services-freetown)
     
     ## 🔐 Security
     - All processing happens locally
     - No data sent to servers
     - Open source code
     ```

4. **Upload Files:**
   - Drag and drop ALL the installer files from `desktop-app/dist/` into the "Attach binaries" area
   - Make sure filenames match exactly:
     - `IT-Services-Device-Detector-Setup-1.0.0.exe`
     - `IT-Services-Device-Detector-1.0.0-portable.exe`
     - `IT-Services-Device-Detector-1.0.0.dmg`
     - `IT-Services-Device-Detector-1.0.0-mac.zip`
     - `IT-Services-Device-Detector-1.0.0.AppImage`
     - `it-services-device-detector_1.0.0_amd64.deb`

5. **Publish Release:**
   - Check "Set as the latest release"
   - Click "Publish release"

### Option B: Using GitHub CLI (Advanced)

```bash
# Install GitHub CLI (if not installed)
# Windows: winget install GitHub.cli
# Mac: brew install gh
# Linux: sudo apt install gh

# Login to GitHub
gh auth login

# Create release with all files
cd desktop-app/dist
gh release create v1.0.0 \
  --title "IT Services Device Detector v1.0.0" \
  --notes "Professional Android device detection desktop app" \
  *.exe *.dmg *.zip *.AppImage *.deb
```

## Step 3: Verify Downloads Work

After publishing the release:

1. Visit your website: `/download-app`
2. Try clicking each download button
3. Verify files download correctly
4. Test installation on each platform

## Expected Download URLs

The download page uses these URLs (they work automatically after release):

```
Windows Installer:
https://github.com/ryanstewart047/web-app-it-services-freetown/releases/latest/download/IT-Services-Device-Detector-Setup-1.0.0.exe

Windows Portable:
https://github.com/ryanstewart047/web-app-it-services-freetown/releases/latest/download/IT-Services-Device-Detector-1.0.0-portable.exe

macOS DMG:
https://github.com/ryanstewart047/web-app-it-services-freetown/releases/latest/download/IT-Services-Device-Detector-1.0.0.dmg

macOS ZIP:
https://github.com/ryanstewart047/web-app-it-services-freetown/releases/latest/download/IT-Services-Device-Detector-1.0.0-mac.zip

Linux AppImage:
https://github.com/ryanstewart047/web-app-it-services-freetown/releases/latest/download/IT-Services-Device-Detector-1.0.0.AppImage

Linux DEB:
https://github.com/ryanstewart047/web-app-it-services-freetown/releases/latest/download/it-services-device-detector_1.0.0_amd64.deb
```

## Troubleshooting

### Issue: Build fails on Windows
**Solution:** Make sure you have Windows Build Tools:
```bash
npm install --global windows-build-tools
```

### Issue: Can't build for macOS on Windows/Linux
**Solution:** You need a Mac to build macOS installers. Alternatives:
- Use a Mac
- Use macOS virtual machine
- Use GitHub Actions (automated)
- Build only Windows and Linux versions

### Issue: Icon not showing
**Solution:** Make sure icon files exist:
- `desktop-app/assets/icon.ico` (Windows)
- `desktop-app/assets/icon.icns` (macOS)
- `desktop-app/assets/icon.png` (Linux)

### Issue: Downloads return 404
**Solution:** Check:
1. Release is published (not draft)
2. Files are uploaded with exact names
3. Tag is `v1.0.0`
4. Release is marked as "latest"

## Automated Builds (Optional - GitHub Actions)

You can automate this with GitHub Actions. Create `.github/workflows/release.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      
      - name: Install dependencies
        run: |
          cd desktop-app
          npm install
      
      - name: Build
        run: |
          cd desktop-app
          npm run build
      
      - name: Upload artifacts
        uses: softprops/action-gh-release@v1
        with:
          files: desktop-app/dist/*
```

Then just push a tag to trigger build:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Next Version Updates

When releasing v1.0.1 or later:

1. Update version in `desktop-app/package.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. Rebuild installers
3. Create new GitHub release with new tag (v1.0.1)
4. Upload new files

The `/latest/download/` URLs will automatically point to the newest release.

## Summary

1. ✅ Build installers: `npm run build:all`
2. ✅ Create GitHub release: Tag `v1.0.0`
3. ✅ Upload all installer files
4. ✅ Publish release
5. ✅ Test download buttons on website

Downloads will now work! 🎉
