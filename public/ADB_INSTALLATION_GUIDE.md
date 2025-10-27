# 📱 ADB Installation Guide - Complete Step-by-Step

**Android Debug Bridge (ADB) Installation for Windows & Mac**  
**Updated:** October 27, 2025

---

## 📋 Table of Contents

1. [What is ADB?](#what-is-adb)
2. [Windows Installation](#windows-installation)
3. [Mac Installation](#mac-installation)
4. [Verify Installation](#verify-installation)
5. [Enable USB Debugging on Android](#enable-usb-debugging-on-android)
6. [Common ADB Commands](#common-adb-commands)
7. [Troubleshooting](#troubleshooting)

---

## What is ADB?

**ADB (Android Debug Bridge)** is a command-line tool that allows you to communicate with Android devices. It's essential for:
- Getting detailed device information (IMEI, Android version, battery status, etc.)
- Installing/uninstalling apps
- Debugging applications
- Accessing device shell
- Transferring files

---

## Windows Installation

### Method 1: Platform Tools (Recommended)

This is the official method from Google and works on Windows 10/11.

#### Step 1: Download ADB Platform Tools

1. **Open your web browser**
2. **Go to:** https://developer.android.com/studio/releases/platform-tools
3. **Click:** "Download SDK Platform-Tools for Windows"
4. **Accept** the terms and conditions
5. **Download** the ZIP file (approximately 10-15 MB)

#### Step 2: Extract the Files

1. **Locate** the downloaded file (usually in `Downloads` folder)
   - File name: `platform-tools-latest-windows.zip`

2. **Right-click** on the ZIP file

3. **Select:** "Extract All..."

4. **Choose destination:** `C:\platform-tools`
   - Click "Browse"
   - Navigate to `C:\`
   - Create new folder named `platform-tools`
   - Click "Select Folder"
   - Click "Extract"

**Result:** Files extracted to `C:\platform-tools`

#### Step 3: Add ADB to System PATH

This allows you to run ADB from any Command Prompt window.

**Option A: Using System Settings (Windows 10/11)**

1. **Press:** `Windows + S` (open search)
2. **Type:** `environment variables`
3. **Click:** "Edit the system environment variables"
4. **Click:** "Environment Variables" button (bottom right)
5. **In "System variables" section:**
   - Find and **select** "Path"
   - Click **"Edit"**
6. **Click:** "New"
7. **Type:** `C:\platform-tools`
8. **Click:** "OK" on all windows
9. **Restart** Command Prompt (if already open)

**Option B: Using Command Prompt (Administrator)**

1. **Press:** `Windows + X`
2. **Select:** "Windows PowerShell (Admin)" or "Command Prompt (Admin)"
3. **Run this command:**

```cmd
setx PATH "%PATH%;C:\platform-tools"
```

4. **Close and reopen** Command Prompt

#### Step 4: Verify Installation

1. **Press:** `Windows + R`
2. **Type:** `cmd`
3. **Press:** Enter
4. **Run:**

```cmd
adb version
```

**Expected Output:**
```
Android Debug Bridge version 1.0.41
Version 35.0.0-11580240
Installed as C:\platform-tools\adb.exe
```

✅ **Success!** ADB is now installed.

---

### Method 2: Chocolatey Package Manager (Alternative)

If you have Chocolatey installed:

1. **Open Command Prompt (Admin)**
2. **Run:**

```cmd
choco install adb
```

3. **Wait** for installation to complete
4. **Verify:**

```cmd
adb version
```

---

## Mac Installation

### Method 1: Homebrew (Recommended - Easiest)

Homebrew is a package manager for Mac that makes installation simple.

#### Step 1: Install Homebrew (if not already installed)

1. **Open Terminal:**
   - Press `Command + Space`
   - Type: `Terminal`
   - Press Enter

2. **Check if Homebrew is installed:**

```bash
brew --version
```

**If Homebrew is NOT installed**, you'll see: `command not found`

**Install Homebrew by running:**

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Follow the prompts:**
- Press Enter when prompted
- Enter your Mac password when asked
- Wait 5-10 minutes for installation

**After installation, run:**

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

#### Step 2: Install ADB using Homebrew

```bash
brew install android-platform-tools
```

**Wait** for installation (1-2 minutes)

#### Step 3: Verify Installation

```bash
adb version
```

**Expected Output:**
```
Android Debug Bridge version 1.0.41
Version 35.0.0-11580240
Installed as /opt/homebrew/bin/adb
```

✅ **Success!** ADB is now installed.

---

### Method 2: Manual Installation (Without Homebrew)

If you prefer not to use Homebrew:

#### Step 1: Download Platform Tools

1. **Open Safari or Chrome**
2. **Go to:** https://developer.android.com/studio/releases/platform-tools
3. **Click:** "Download SDK Platform-Tools for Mac"
4. **Accept** terms and download
5. **File downloaded:** `platform-tools-latest-darwin.zip`

#### Step 2: Extract the Files

1. **Open Terminal** (Command + Space → type "Terminal")

2. **Navigate to Downloads:**

```bash
cd ~/Downloads
```

3. **Extract the ZIP file:**

```bash
unzip platform-tools-latest-darwin.zip
```

4. **Move to a permanent location:**

```bash
sudo mv platform-tools /usr/local/
```

5. **Enter your Mac password** when prompted

#### Step 3: Add to PATH

1. **Check which shell you're using:**

```bash
echo $SHELL
```

**If output is `/bin/zsh` (macOS Catalina and newer):**

```bash
echo 'export PATH=$PATH:/usr/local/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

**If output is `/bin/bash` (older macOS):**

```bash
echo 'export PATH=$PATH:/usr/local/platform-tools' >> ~/.bash_profile
source ~/.bash_profile
```

#### Step 4: Verify Installation

```bash
adb version
```

**Expected Output:**
```
Android Debug Bridge version 1.0.41
Version 35.0.0-11580240
Installed as /usr/local/platform-tools/adb
```

✅ **Success!** ADB is installed.

---

## Verify Installation

Run these commands to ensure ADB is working correctly:

### Check ADB Version

**Windows:**
```cmd
adb version
```

**Mac:**
```bash
adb version
```

### List Available Commands

**Windows:**
```cmd
adb help
```

**Mac:**
```bash
adb help
```

### Check for Connected Devices

**Windows:**
```cmd
adb devices
```

**Mac:**
```bash
adb devices
```

**Expected Output (no devices connected yet):**
```
List of devices attached
```

---

## Enable USB Debugging on Android

Before you can use ADB with your Android device, you must enable USB debugging.

### Step 1: Enable Developer Options

1. **Open Settings** on your Android device
2. **Scroll down** to "About phone" (or "About device")
3. **Find** "Build number"
4. **Tap** "Build number" **7 times** rapidly
5. **Enter** your PIN/password if prompted
6. **You'll see:** "You are now a developer!"

### Step 2: Enable USB Debugging

1. **Go back** to Settings
2. **Find and tap:** "Developer options" (usually near bottom or under "System")
3. **Toggle ON:** "Developer options" (if needed)
4. **Scroll down** and find "USB debugging"
5. **Toggle ON:** "USB debugging"
6. **Tap OK** on the warning dialog

### Step 3: Connect Your Device

1. **Connect** your Android device to computer using USB cable
2. **Unlock** your device
3. **On your device,** you'll see a popup: "Allow USB debugging?"
   - ✅ Check "Always allow from this computer"
   - Tap "OK" or "Allow"

### Step 4: Verify Connection

**Windows:**
```cmd
adb devices
```

**Mac:**
```bash
adb devices
```

**Expected Output:**
```
List of devices attached
RF8N12345678    device
```

✅ **Success!** Your device is connected.

---

## Common ADB Commands

Now that ADB is installed and your device is connected, try these commands:

### Basic Device Information

**Check connected devices:**
```bash
adb devices
```

**Get device model:**
```bash
adb shell getprop ro.product.model
```

**Get Android version:**
```bash
adb shell getprop ro.build.version.release
```

**Get manufacturer:**
```bash
adb shell getprop ro.product.manufacturer
```

**Get device serial number:**
```bash
adb shell getprop ro.serialno
```

### Advanced Information

**Get all device properties:**
```bash
adb shell getprop
```

**Get IMEI (requires authorization):**
```bash
adb shell service call iphonesubinfo 1
```

**Get battery information:**
```bash
adb shell dumpsys battery
```

**Get storage information:**
```bash
adb shell df
```

**Get RAM information:**
```bash
adb shell cat /proc/meminfo
```

**Get screen resolution:**
```bash
adb shell wm size
```

**Get screen density:**
```bash
adb shell wm density
```

### File Operations

**Push file to device:**
```bash
adb push C:\path\to\file.txt /sdcard/
```

**Pull file from device:**
```bash
adb pull /sdcard/file.txt C:\path\to\destination\
```

**List files on device:**
```bash
adb shell ls /sdcard/
```

### App Management

**List installed packages:**
```bash
adb shell pm list packages
```

**Install APK:**
```bash
adb install C:\path\to\app.apk
```

**Uninstall app:**
```bash
adb uninstall com.package.name
```

### Device Control

**Reboot device:**
```bash
adb reboot
```

**Reboot to recovery:**
```bash
adb reboot recovery
```

**Reboot to bootloader:**
```bash
adb reboot bootloader
```

**Take screenshot:**
```bash
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

**Record screen (Ctrl+C to stop):**
```bash
adb shell screenrecord /sdcard/recording.mp4
```

### Network Information

**Get IP address:**
```bash
adb shell ip addr show wlan0
```

**Get WiFi information:**
```bash
adb shell dumpsys wifi
```

**Get network operator:**
```bash
adb shell getprop gsm.operator.alpha
```

---

## Troubleshooting

### Issue: "adb is not recognized" (Windows)

**Cause:** ADB not in system PATH

**Solution:**
1. Verify ADB location: `C:\platform-tools\adb.exe`
2. Re-add to PATH (see Step 3 of Windows installation)
3. Restart Command Prompt
4. Try: `C:\platform-tools\adb.exe version` (full path)

### Issue: "command not found: adb" (Mac)

**Cause:** ADB not in PATH

**Solution:**

```bash
# Find where ADB is installed
which adb

# If nothing appears, reinstall:
brew install android-platform-tools

# Or add to PATH manually:
echo 'export PATH=$PATH:/usr/local/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

### Issue: "no permissions" (Mac)

**Cause:** ADB doesn't have execute permissions

**Solution:**

```bash
sudo chmod +x /usr/local/platform-tools/adb
```

### Issue: "unauthorized" device

**Cause:** USB debugging not authorized

**Solution:**
1. Disconnect device
2. Revoke USB debugging authorizations on device:
   - Settings → Developer Options → Revoke USB debugging authorizations
3. Reconnect device
4. Accept authorization popup

### Issue: Device not detected

**Solutions:**

**Windows:**
1. Install device-specific USB drivers:
   - Samsung: https://developer.samsung.com/android-usb-driver
   - Google: https://developer.android.com/studio/run/win-usb
   - Others: Check manufacturer website

2. Update ADB:
```cmd
cd C:\platform-tools
adb kill-server
adb start-server
```

**Mac:**
1. Update ADB:
```bash
brew upgrade android-platform-tools
```

2. Restart ADB server:
```bash
adb kill-server
adb start-server
```

**Both:**
1. Try different USB cable (use original if possible)
2. Try different USB port (avoid USB hubs)
3. Restart device
4. Restart computer
5. Enable "File Transfer" mode on Android (swipe down → tap USB notification)

### Issue: Multiple devices connected

**Solution:** Specify device by serial number

```bash
# List devices to get serial number
adb devices

# Use specific device
adb -s RF8N12345678 shell getprop ro.product.model
```

---

## Quick Reference Card

### Installation Commands

**Windows (Manual):**
```cmd
# Download from https://developer.android.com/studio/releases/platform-tools
# Extract to C:\platform-tools
setx PATH "%PATH%;C:\platform-tools"
adb version
```

**Windows (Chocolatey):**
```cmd
choco install adb
adb version
```

**Mac (Homebrew):**
```bash
brew install android-platform-tools
adb version
```

**Mac (Manual):**
```bash
cd ~/Downloads
unzip platform-tools-latest-darwin.zip
sudo mv platform-tools /usr/local/
echo 'export PATH=$PATH:/usr/local/platform-tools' >> ~/.zshrc
source ~/.zshrc
adb version
```

### Essential Commands

```bash
adb devices                                    # List connected devices
adb shell getprop ro.product.model            # Get device model
adb shell getprop ro.build.version.release    # Get Android version
adb shell getprop                             # Get all properties
adb shell dumpsys battery                     # Battery info
adb shell df                                  # Storage info
adb reboot                                    # Reboot device
adb kill-server                               # Stop ADB server
adb start-server                              # Start ADB server
```

---

## Video Tutorials (Optional)

**Windows Installation:**
- Search YouTube: "How to install ADB on Windows 10"
- Official Android Developers channel has tutorials

**Mac Installation:**
- Search YouTube: "Install ADB on Mac using Homebrew"
- Homebrew official documentation: https://brew.sh

---

## Additional Resources

### Official Documentation
- **ADB User Guide:** https://developer.android.com/studio/command-line/adb
- **Platform Tools Release Notes:** https://developer.android.com/studio/releases/platform-tools
- **Android Developer Options:** https://developer.android.com/studio/debug/dev-options

### Download Links
- **Windows Platform Tools:** https://dl.google.com/android/repository/platform-tools-latest-windows.zip
- **Mac Platform Tools:** https://dl.google.com/android/repository/platform-tools-latest-darwin.zip
- **Linux Platform Tools:** https://dl.google.com/android/repository/platform-tools-latest-linux.zip

### USB Drivers (Windows)
- **Samsung:** https://developer.samsung.com/android-usb-driver
- **Google USB Driver:** https://developer.android.com/studio/run/win-usb
- **Universal ADB Driver:** https://adb.clockworkmod.com/

### Community Support
- **Stack Overflow:** Tag: `adb`
- **XDA Developers Forum:** https://forum.xda-developers.com/
- **Reddit:** r/AndroidQuestions, r/Android

---

## Summary Checklist

Use this checklist to track your installation:

### Windows
- [ ] Downloaded Platform Tools from official site
- [ ] Extracted to `C:\platform-tools`
- [ ] Added to System PATH
- [ ] Ran `adb version` successfully
- [ ] Enabled USB debugging on Android device
- [ ] Connected device and authorized computer
- [ ] Ran `adb devices` and see device listed

### Mac
- [ ] Installed Homebrew (or chose manual method)
- [ ] Ran `brew install android-platform-tools`
- [ ] Ran `adb version` successfully
- [ ] Enabled USB debugging on Android device
- [ ] Connected device and authorized computer
- [ ] Ran `adb devices` and see device listed

---

## Need Help?

If you're still having issues after following this guide:

1. **Check ADB version:** Make sure you have the latest version
2. **Read error messages:** They often tell you exactly what's wrong
3. **Google the error:** Someone else has likely had the same issue
4. **Visit our support:** https://www.itservicesfreetown.com/connect-agent

---

**Last Updated:** October 27, 2025  
**Guide Version:** 2.0  
**Tested On:** Windows 10/11, macOS Sonoma/Ventura

✅ **Success!** You now have ADB installed and ready to use!
