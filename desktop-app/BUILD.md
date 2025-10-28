# Desktop App - Quick Build Guide

## Quick Start (For Testing)

```bash
# Navigate to desktop app directory
cd desktop-app

# Install dependencies
npm install

# Run the app in development mode
npm start
```

## Building Installers

### Prerequisites
1. **Node.js 16+** must be installed
2. **ADB** should be installed on target system
3. **Platform-specific tools**:
   - Windows: No additional tools needed
   - macOS: Xcode Command Line Tools
   - Linux: Standard build tools

### Build Commands

```bash
# Build for current platform only
npm run build

# Build for Windows
npm run build:win

# Build for macOS (requires macOS)
npm run build:mac

# Build for Linux
npm run build:linux

# Build for all platforms (requires macOS)
npm run build:all
```

### Output Files

Built installers will be in `desktop-app/dist/`:

**Windows:**
- `IT Services Device Detector Setup 1.0.0.exe` (Installer)
- `IT Services Device Detector 1.0.0.exe` (Portable)

**macOS:**
- `IT Services Device Detector-1.0.0.dmg` (Installer)
- `IT Services Device Detector-1.0.0-mac.zip` (Portable)

**Linux:**
- `IT Services Device Detector-1.0.0.AppImage` (Portable)
- `it-services-device-detector_1.0.0_amd64.deb` (Debian/Ubuntu)

## Icons

Before building for distribution, create icon files:
- `assets/icon.ico` (Windows)
- `assets/icon.icns` (macOS)
- `assets/icon.png` (Linux)

See `assets/README.md` for instructions.

## File Structure

```
desktop-app/
├── main.js           # Electron main process
├── preload.js        # Electron preload script
├── renderer.js       # Frontend JavaScript
├── index.html        # UI markup
├── styles.css        # Styling
├── package.json      # Dependencies and build config
├── README.md         # Full documentation
├── BUILD.md          # This file
└── assets/          
    └── icon.svg      # Source icon (SVG)
```

## Testing

### Test ADB Connection
```bash
# Make sure ADB works from terminal
adb devices

# Should show "List of devices attached"
```

### Test the App
```bash
# Run with DevTools open
npm run dev

# Run normally
npm start
```

## Distribution

1. Build the installers for target platforms
2. Test each installer on a clean system
3. Upload to your website or GitHub releases
4. Provide download links with installation instructions

## Troubleshooting Build Issues

### "electron-builder not found"
```bash
npm install
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### macOS build on Windows/Linux
You cannot build macOS installers on Windows or Linux. Either:
- Build on a Mac
- Use a macOS virtual machine
- Build only for Windows and Linux

### Linux build permissions
```bash
chmod +x dist/*.AppImage
```

## Updating Version

Edit `package.json`:
```json
{
  "version": "1.0.1"  // Update this
}
```

Then rebuild.
