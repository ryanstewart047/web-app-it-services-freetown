# IT Services Device Detector - Desktop Application

Professional Android device detection tool with full ADB integration. Get complete device information including IMEI, hardware specs, battery stats, and more!

## 🚀 Features

### Complete Device Information
- ✅ **Basic Info**: Model, Manufacturer, Brand, Serial Number
- ✅ **IMEI**: Both IMEI 1 and IMEI 2 (dual SIM support)
- ✅ **Android Info**: Version, SDK, Build ID, Security Patch
- ✅ **Hardware**: CPU, Board, Bootloader, Hardware Info
- ✅ **Display**: Screen size, density, resolution
- ✅ **Memory**: Total RAM, Available RAM, Free RAM
- ✅ **Storage**: Internal, System, SD Card usage
- ✅ **Battery**: Level, health, status, temperature, voltage, technology
- ✅ **Network**: WiFi MAC address, IP address
- ✅ **Additional**: Locale, timezone, uptime, fingerprint

### Professional Features
- 🖥️ **Desktop Application**: Full system access, no browser limitations
- 🔄 **Real-time Detection**: Instant device recognition
- 💾 **Export Options**: Save as JSON or TXT file
- 🎨 **Beautiful UI**: Dark mode interface with smooth animations
- ⚡ **Fast**: Gathers 50+ device properties in seconds
- 🔒 **Secure**: Runs locally, no data sent to servers
- 📱 **Multi-Platform**: Windows, Mac, Linux support

## 📋 Requirements

### Before Installing
1. **ADB (Android Debug Bridge)** must be installed on your system
2. **USB Cable** to connect your Android device
3. **USB Debugging** enabled on your Android device

### System Requirements
- **Windows**: Windows 10 or later (64-bit)
- **macOS**: macOS 10.13 or later
- **Linux**: Ubuntu 18.04+, Fedora 32+, or equivalent

## 🛠️ Installation

### Step 1: Install ADB

#### Windows
**Option 1: Platform Tools (Recommended)**
1. Download [Android Platform Tools](https://developer.android.com/studio/releases/platform-tools)
2. Extract to `C:\platform-tools`
3. Add to PATH:
   - Search "Environment Variables" in Start Menu
   - Click "Environment Variables"
   - Under "System Variables", find "Path" and click "Edit"
   - Click "New" and add `C:\platform-tools`
   - Click OK on all windows
4. Restart your computer

**Option 2: Chocolatey**
```powershell
choco install adb
```

#### macOS
**Option 1: Homebrew (Recommended)**
```bash
brew install android-platform-tools
```

**Option 2: Manual**
1. Download [Android Platform Tools](https://developer.android.com/studio/releases/platform-tools)
2. Extract and move to `/usr/local/bin/`
3. Add to PATH in `~/.zshrc` or `~/.bash_profile`

#### Linux
**Ubuntu/Debian:**
```bash
sudo apt-get install android-tools-adb
```

**Fedora:**
```bash
sudo dnf install android-tools
```

**Arch:**
```bash
sudo pacman -S android-tools
```

### Step 2: Enable USB Debugging on Android

1. Open **Settings** on your Android device
2. Scroll to **About Phone**
3. Tap **Build Number** 7 times to enable Developer Options
4. Go back to Settings → **Developer Options**
5. Enable **USB Debugging**
6. Connect device via USB cable
7. Accept the authorization prompt on your phone

### Step 3: Download the Desktop App

#### For Users (Pre-built Binaries)
Download the installer for your operating system:

- **Windows**: `IT-Services-Device-Detector-Setup-1.0.0.exe` or `IT-Services-Device-Detector-1.0.0-portable.exe`
- **macOS**: `IT-Services-Device-Detector-1.0.0.dmg`
- **Linux**: `IT-Services-Device-Detector-1.0.0.AppImage` or `it-services-device-detector_1.0.0_amd64.deb`

Run the installer and follow the on-screen instructions.

#### For Developers (Build from Source)
```bash
# Clone or navigate to the desktop-app directory
cd desktop-app

# Install dependencies
npm install

# Run in development mode
npm start

# Build for your platform
npm run build        # Build for current platform
npm run build:win    # Build for Windows
npm run build:mac    # Build for macOS
npm run build:linux  # Build for Linux
npm run build:all    # Build for all platforms
```

## 🎯 Usage

### First Launch
1. Launch the application
2. The app will automatically check if ADB is installed
3. If ADB is not found, follow the installation guide provided in the app
4. Connect your Android device via USB
5. The app will automatically detect and display device information

### Main Features

#### View Device Information
- Information is organized into categories
- Hover over sections for enhanced visibility
- IMEI information is highlighted for easy access

#### Export Device Info
Click the export buttons to save device information:
- **Export JSON**: Machine-readable format for integration
- **Export TXT**: Human-readable text format

#### Refresh Data
Click the "Refresh" button to re-scan for devices and update information

### Troubleshooting

#### "ADB Not Installed" Warning
- Install ADB using instructions above
- Click "Recheck" after installation
- Restart the application

#### "No Device Detected" Warning
- Check USB cable connection
- Enable USB Debugging on your device
- Accept the authorization prompt on your phone
- Try a different USB port or cable
- Run `adb devices` in terminal to verify

#### IMEI Shows "Unable to retrieve"
- Some devices require root access for IMEI
- Try rebooting your phone while connected
- Some manufacturers block IMEI access via ADB

#### Device Connected but No Data
- Make sure you accepted the USB debugging authorization
- Try running `adb kill-server` then `adb start-server`
- Reconnect your device

## 🔐 Privacy & Security

- ✅ All data processing happens **locally** on your computer
- ✅ **No data** is sent to any servers
- ✅ **No internet connection** required (except for downloading)
- ✅ IMEI and sensitive data stay on your device
- ✅ Open source - you can verify the code

## 🏗️ Technology Stack

- **Electron**: Cross-platform desktop framework
- **Node.js**: Backend processing
- **ADB**: Android Debug Bridge integration
- **HTML/CSS/JS**: Beautiful UI

## 📦 Building from Source

### Prerequisites
```bash
node --version  # v16 or higher
npm --version   # v8 or higher
```

### Development
```bash
# Install dependencies
npm install

# Run in development mode (with DevTools)
npm run dev

# Run normally
npm start
```

### Building Installers
```bash
# Build for all platforms (requires macOS for Mac builds)
npm run build:all

# Build for specific platform
npm run build:win      # Windows (NSIS installer + Portable)
npm run build:mac      # macOS (DMG + ZIP)
npm run build:linux    # Linux (AppImage + DEB)
```

Built files will be in the `dist/` directory.

## 🤝 Contributing

This is part of the IT Services Freetown project. Contributions are welcome!

## 📄 License

MIT License - feel free to use and modify!

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Visit our website: IT Services Freetown
3. Submit an issue on GitHub

## 🌟 Credits

Developed by **IT Services Freetown**
Professional IT solutions and device diagnostics

---

**Note**: This application requires ADB to function. Make sure Android Debug Bridge is properly installed and your device has USB Debugging enabled.
