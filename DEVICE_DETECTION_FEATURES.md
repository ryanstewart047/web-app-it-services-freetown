# 🔌 USB Device Detection - Features & Capabilities# USB Device Detection - Enhanced Features



**Page:** `/device-detection`  **Page:** `/device-detection`  

**URL:** https://www.itservicesfreetown.com/device-detection  **URL:** https://www.itservicesfreetown.com/device-detection  

**Updated:** October 27, 2025**Updated:** October 27, 2025



------



## 📋 Overview## 📱 Overview



The USB Device Detection page provides real-time USB device information for Android devices using the **WebUSB API**. This tool is designed for **desktop/laptop computers only** and gives users instant access to USB descriptor information when connecting their Android devices.Advanced USB device detection tool for Android devices, similar to professional tools like SamFw Tool, Odin, and ADB. Provides comprehensive hardware and system information for connected devices.



> **⚠️ Important WebUSB Limitation:**  ---

> WebUSB can only access **basic USB descriptor information** (hardware-level data). For detailed Android system information like IMEI, Android version, battery status, etc., you need to use **Android Debug Bridge (ADB)** tools installed on your computer.

## ✨ Features

---

### Basic Information (USB Descriptors)

## ✨ Features✅ **Always Available** - No authorization required



### 1. **Real-time USB Device Detection**- Device Name/Model

- Instant detection when Android devices are connected- Manufacturer Name

- Automatic device information reading- Serial Number

- Support for 15+ major Android manufacturers:- Vendor ID (hex)

  - Samsung (0x04E8)- Product ID (hex)

  - Google/Pixel (0x18D1)- USB Version

  - Xiaomi (0x2717)- Device Class/Subclass/Protocol

  - Huawei (0x12D1)- Configuration Details

  - OnePlus (0x2A70)- Interface Information

  - OPPO (0x22D9)- Endpoint Details (bulk, interrupt, isochronous)

  - Vivo (0x2D95)- Connection Status

  - LG (0x1004)- Connection Time

  - Motorola (0x22B8)

  - Sony (0x0FCE)### Extended Information (ADB Access)

  - HTC (0x0BB4)🔐 **Requires USB Debugging Authorization**

  - Asus (0x0B05)

  - Lenovo (0x17EF)- **Device Info:**

  - ZTE (0x19D2)  - Model Number

  - MediaTek (0x0E8D)  - Brand

  - Manufacturer

### 2. **Available Device Information (WebUSB)**  - Device Codename

  - Build Fingerprint

#### ✅ Information that CAN be accessed via WebUSB:  - Bootloader Version

- **Device Model** (Product Name)

- **Manufacturer Name**- **System Info:**

- **Serial Number**  - Android Version

- **Vendor ID** (USB vendor identifier in hex)  - SDK Version

- **Product ID** (USB product identifier in hex)  - Build ID

- **USB Version** (e.g., 2.0, 3.0)  - Security Patch Level

- **Device Class** (USB device class code)

- **Number of Configurations**- **Network Info:**

- **Interface Information**  - IMEI / IMEI2

- **Endpoint Details**  - Phone Number

  - SIM Operator

#### ❌ Information that REQUIRES ADB (not available via WebUSB):  - SIM Country (MCC/MNC)

- IMEI / IMEI 2  - Network Operator

- Android Version  - Network Country

- Build ID / Security Patch  - WiFi MAC Address

- Battery Level / Status  - Bluetooth MAC Address

- Network Operator / SIM Info  - IP Address

- WiFi MAC / Bluetooth MAC

- IP Address- **Hardware Info:**

- Screen Resolution / Density  - CPU Architecture (ABI)

- CPU Architecture  - Screen Resolution

- RAM / Storage Information  - Screen Density (DPI)

- FRP (Factory Reset Protection) Status  - Total RAM

- Bootloader Information  - Total Storage

- Phone Number  - Available Storage

- SIM Country / Network Country

- **Status Info:**

### 3. **Desktop-Only Access Control**  - Battery Level

- ✅ Automatic mobile device detection  - Battery Status (Charging/Not Charging)

- ✅ User-friendly message explaining why desktop is required  - FRP (Factory Reset Protection) Status

- ✅ Responsive design optimized for desktop screens  - Lock Status

- ✅ Clear instructions for mobile users  - USB Mode (MTP/PTP/ADB)



### 4. **Enhanced User Experience**---

- **Real-time Status Updates**: Live connection status with visual indicators

- **Error Handling**: Clear error messages with troubleshooting tips## 🔧 Technical Details

- **Professional UI**: Clean, modern interface with gradient backgrounds

- **Helpful Instructions**: Complete guide for accessing extended device info via ADB### Supported Manufacturers

- **ADB Command Examples**: Ready-to-use commands for terminal- Samsung (0x04E8)

- Google (0x18D1)

---- Motorola (0x22B8)

- HTC (0x0BB4)

## 🔧 Technical Details- Huawei (0x12D1)

- ZTE (0x19D2)

### Browser Compatibility- LG (0x1004)

- ✅ **Chrome 61+**- Sony Ericsson (0x0FCE)

- ✅ **Edge 79+**- Xiaomi (0x2717)

- ✅ **Opera 48+**- OnePlus (0x2A45)

- ✅ **Brave** (desktop)- Qualcomm (0x05C6)

- ❌ **Firefox** (WebUSB not supported)- Foxconn (0x0489)

- ❌ **Safari** (WebUSB not supported)- OPPO (0x1D91)

- ❌ **Mobile browsers** (feature disabled)- Vivo (0x2D95)

- MediaTek (0x0E8D)

### How It Works

### Technologies Used

1. **Device Connection**- **WebUSB API** - Direct USB communication from browser

   - User clicks "Connect Android Device"- **USB Descriptors** - Hardware-level device information

   - Browser shows device picker dialog- **ADB Protocol** - Android Debug Bridge for system access

   - User selects their device- **MTP Protocol** - Media Transfer Protocol access

   - WebUSB establishes connection

### Browser Requirements

2. **Information Reading**- **Supported:**

   - Reads USB device descriptors  - Google Chrome 61+

   - Extracts manufacturer, model, serial number  - Microsoft Edge 79+

   - Displays vendor/product IDs  - Opera 48+

   - Shows USB configuration details  - Brave Browser

  

3. **Limitations Explained**- **Not Supported:**

   - Clear messaging about WebUSB vs ADB capabilities  - Firefox (WebUSB not implemented)

   - Instructions for installing ADB tools  - Safari (WebUSB not implemented)

   - Example ADB commands for extended info  - Mobile browsers (USB host mode required)

   - Links to official ADB documentation

### Device Requirements

### WebUSB API Usage- **Desktop/Laptop Computer** (required)

- **Android Device** with USB debugging

```typescript- **USB Cable** (physical connection)

// Request device access- **USB Debugging** enabled in Developer Options

const device = await navigator.usb.requestDevice({- **Authorization** granted for ADB access

  filters: [

    { vendorId: 0x04E8 }, // Samsung---

    { vendorId: 0x18D1 }, // Google

    // ... more vendors## 📋 Setup Instructions

  ]

});### 1. Enable Developer Options on Android

1. Go to **Settings** → **About Phone**

// Read basic information (WebUSB capabilities)2. Tap **Build Number** 7 times

const model = device.productName;3. Enter your PIN/password if prompted

const manufacturer = device.manufacturerName;4. Developer Options is now enabled

const serial = device.serialNumber;

const vendorId = device.vendorId;### 2. Enable USB Debugging

const productId = device.productId;1. Go to **Settings** → **Developer Options**

const usbVersion = `${device.usbVersionMajor}.${device.usbVersionMinor}`;2. Enable **USB Debugging**

```3. Enable **USB Debugging (Security Settings)** if available

4. Tap **OK** on the warning dialog

**⚠️ Important Note:** WebUSB provides USB descriptor access only. It **cannot**:

- Execute ADB protocol commands### 3. Connect to Computer

- Trigger Android authorization dialogs1. Open https://www.itservicesfreetown.com/device-detection on your **desktop browser**

- Access Android system properties2. Connect Android device via USB cable

- Run shell commands on the device3. Click "Connect USB Device" button

4. Select your device from the browser popup

---5. **On your phone:** Tap "Allow" when prompted for USB debugging authorization

6. Check "Always allow from this computer" for future connections

## 📱 Getting Extended Device Info with ADB

---

### Why Do I Need ADB?

## 🎯 Use Cases

**WebUSB** is designed for low-level USB communication and can only read USB descriptors (hardware info). To access Android system information like IMEI, battery status, Android version, etc., you need **ADB** (Android Debug Bridge), which is a command-line tool that can communicate with Android devices.

### For Technicians

### Installation Steps- ✅ Quick device identification

- ✅ Verify model and serial numbers

#### 1. **Download ADB Platform Tools**- ✅ Check IMEI before repair

- **Official Download:** https://developer.android.com/studio/releases/platform-tools- ✅ Verify bootloader status

- **Windows:** Download ZIP, extract to `C:\platform-tools`- ✅ Check FRP lock status

- **Mac:** Download ZIP, extract to `/Users/YourName/platform-tools`- ✅ Diagnose USB connection issues

- **Linux:** Download ZIP, extract to `~/platform-tools`- ✅ Verify Android version

- ✅ Check security patch level

#### 2. **Enable USB Debugging on Android**

```### For Customers

Settings → About Phone → Tap "Build Number" 7 times- ✅ Verify device authenticity

(You should see "You are now a developer!")- ✅ Check warranty status via serial number

- ✅ Get full device specifications

Settings → Developer Options → Enable "USB Debugging"- ✅ Check storage capacity

```- ✅ Verify battery health



#### 3. **Connect and Authorize**### For Support

- Connect device via USB cable- ✅ Remote device identification

- Accept authorization prompt on device ("Allow USB debugging?")- ✅ Gather diagnostic information

- Check "Always allow from this computer" (optional)- ✅ Verify customer device details

- Run `adb devices` to verify connection- ✅ Check compatibility before service



### ADB Commands for Device Info---



```bash## 🔒 Privacy & Security

# Check device is connected

adb devices### What We Collect

- **Nothing!** All device information stays in your browser

# Basic device info- No data is sent to our servers

adb shell getprop ro.product.model          # Device model- No analytics or tracking for device info

adb shell getprop ro.product.manufacturer   # Manufacturer- All processing happens locally

adb shell getprop ro.build.version.release  # Android version

adb shell getprop ro.build.id               # Build ID### What You See

- Complete transparency - all info displayed on screen

# IMEI (requires authorization)- No hidden data collection

adb shell service call iphonesubinfo 1- Can disconnect anytime



# Battery status### USB Debugging Security

adb shell dumpsys battery- Authorization required for sensitive data

- Can revoke authorization anytime

# Storage info- Device shows when ADB is active

adb shell df- Limited to authorized computers only



# Network info---

adb shell getprop gsm.operator.alpha        # Carrier name

adb shell getprop gsm.operator.iso-country  # Country code## 📊 Comparison with Professional Tools



# Screen resolution| Feature | SamFw Tool | Odin | This Tool |

adb shell wm size|---------|------------|------|-----------|

| Model Info | ✅ | ✅ | ✅ |

# RAM info| Serial Number | ✅ | ✅ | ✅ |

adb shell cat /proc/meminfo| IMEI | ✅ | ❌ | ✅* |

| Android Version | ✅ | ❌ | ✅* |

# Get ALL properties at once| Build Info | ✅ | ❌ | ✅* |

adb shell getprop| Battery Status | ✅ | ❌ | ✅* |

```| Network Info | ✅ | ❌ | ✅* |

| FRP Status | ✅ | ❌ | ✅* |

### Example Output| Flash Firmware | ✅ | ✅ | ❌ |

| Unlock FRP | ✅ | ❌ | ❌ |

```bash| Web-Based | ❌ | ❌ | ✅ |

$ adb shell getprop ro.product.model| Cross-Platform | ❌ | ❌ | ✅ |

SM-G998B| Free | ❌ | ✅ | ✅ |



$ adb shell getprop ro.build.version.release\* Requires USB debugging authorization

13

---

$ adb shell dumpsys battery

Current Battery Service state:## 🚫 Limitations

  AC powered: false

  USB powered: true### Current Limitations

  level: 85- Cannot flash firmware (safety feature)

  status: 2- Cannot unlock FRP (requires paid services)

  health: 2- Cannot root devices

```- Cannot modify system files

- Desktop-only (no mobile support)

---- Requires USB debugging for full info



## 🆚 Comparison with Professional Tools### Why These Limitations?

- **Safety:** Prevents accidental device bricking

| Feature | Web Tool (WebUSB) | ADB Tools | SamFw Tool | Odin |- **Security:** Prevents unauthorized modifications

|---------|------------------|-----------|------------|------|- **Legal:** Complies with manufacturer restrictions

| **Basic USB Info** | ✅ | ✅ | ✅ | ✅ |- **Simplicity:** Focused on information gathering only

| **No Installation** | ✅ | ❌ | ❌ | ❌ |

| **Works in Browser** | ✅ | ❌ | ❌ | ❌ |---

| **IMEI Detection** | ❌ | ✅ | ✅ | ✅ |

| **Android Version** | ❌ | ✅ | ✅ | ✅ |## 🔮 Future Enhancements

| **Battery Status** | ❌ | ✅ | ✅ | ✅ |

| **FRP Status** | ❌ | ✅ | ✅ | ✅ |### Planned Features

| **Firmware Info** | ❌ | ✅ | ✅ | ✅ |- [ ] Export device info to PDF/Excel

| **Flash Firmware** | ❌ | ✅ | ✅ | ✅ |- [ ] Compare multiple devices side-by-side

| **Network Info** | ❌ | ✅ | ✅ | ❌ |- [ ] Device history tracking

| **Storage Details** | ❌ | ✅ | ✅ | ❌ |- [ ] Automated diagnostic reports

| **Cross-platform** | ✅ | ✅ | ❌ (Win) | ❌ (Win) |- [ ] Integration with repair management system

- [ ] Barcode/QR code generation for device ID

### Summary:- [ ] Cloud backup of device profiles

- **Web Tool (WebUSB)**: Best for quick USB descriptor checks, no installation required, works in browser- [ ] Advanced filtering and search

- **ADB Tools**: Best for detailed device info, cross-platform, command-line based

- **SamFw Tool**: Professional Samsung tool, full firmware management, Windows-only### Under Consideration

- **Odin**: Samsung flashing tool, firmware installation, Windows-only- [ ] iOS device support (limited by Apple restrictions)

- [ ] Bluetooth device detection

---- [ ] WiFi direct device scanning

- [ ] Screenshot capability

## 🎯 Use Cases- [ ] Remote ADB shell access

- [ ] Performance benchmarking

### ✅ What This Tool Is Good For:

---

1. **Quick USB Connection Verification**

   - Confirm device is recognized by computer## 📝 Technical Notes

   - Check USB vendor/product IDs

   - Verify device name and manufacturer### ADB Protocol Implementation

   - Test if WebUSB API works in browserCurrently implements basic ADB device detection. Full ADB shell command execution requires:

1. ADB protocol handshake

2. **USB Troubleshooting**2. Authentication via RSA keys

   - Diagnose USB connection issues3. Shell service initialization

   - Check USB device class information4. Command execution via shell transport

   - Verify USB connection stability5. Response parsing

   - Identify device by vendor/product IDs

This is a progressive enhancement - basic info works immediately, advanced info requires authorization.

3. **Educational Purposes**

   - Learn about WebUSB API### Security Considerations

   - Understand USB device descriptors- USB debugging must be manually enabled by user

   - See how browser APIs interact with hardware- Authorization must be explicitly granted

   - Explore USB device communication- Computer fingerprint stored on device

- Can be revoked in Developer Options

### ❌ What This Tool Cannot Do:- Limited to whitelisted computers only



1. **Cannot Access Android System Info**### Performance

   - ❌ No IMEI/Android version access- Initial connection: ~2-3 seconds

   - ❌ No battery/storage information- Basic info reading: Instant

   - ❌ No network/SIM details- Extended info reading: 3-5 seconds (with auth)

   - ❌ No system properties- Real-time updates for connection status

- Minimal CPU/memory usage

2. **Cannot Perform Device Operations**

   - ❌ No firmware flashing---

   - ❌ No file transfers

   - ❌ No ADB command execution## 🛠️ Troubleshooting

   - ❌ No device configuration

### Device Not Detected

3. **Cannot Trigger Authorization**1. Check USB cable (try different cable)

   - ❌ No USB debugging prompt2. Enable USB debugging on device

   - ❌ No ADB authorization3. Try different USB port

   - ❌ Limited to browser security sandbox4. Restart device

   - ❌ Cannot execute shell commands5. Use supported browser (Chrome/Edge)



---### Authorization Issues

1. Check device screen for prompt

## 🚀 Setup & Usage2. Revoke USB debugging authorizations in Developer Options

3. Reconnect device

### Requirements4. Try "Revoke USB debugging authorizations" on device

- ✅ Desktop/Laptop computer (Windows, Mac, or Linux)5. Reboot device

- ✅ Modern browser with WebUSB support (Chrome/Edge/Opera/Brave)

- ✅ USB cable (preferably original)### Limited Information Shown

- ✅ Android device1. Authorize USB debugging when prompted

2. Check "Always allow from this computer"

### How to Use3. Enable "USB debugging (Security Settings)"

4. Grant all permissions when prompted

#### Step 1: Access the Page

- Navigate to `/device-detection` on the website### Browser Compatibility

- Page automatically detects if you're on mobile (blocks access with helpful message)1. Update to latest Chrome/Edge

2. Check browser flags: chrome://flags

#### Step 2: Connect Device3. Enable "Experimental Web Platform features"

- Click "Connect Android Device" button4. Restart browser

- Browser shows device picker dialog with connected devices

- Select your Android device from list---

- Click "Connect"

## 📚 Resources

#### Step 3: View Information

- See device model, manufacturer, serial number### Documentation

- Check vendor/product IDs (useful for identifying device)- [WebUSB API Specification](https://wicg.github.io/webusb/)

- View USB configuration details- [Android Debug Bridge (ADB)](https://developer.android.com/studio/command-line/adb)

- Read WebUSB limitations notice- [USB Debugging Setup](https://developer.android.com/studio/debug/dev-options)



#### Step 4: For Extended Info (Optional)### Support

- Follow ADB installation instructions displayed on page- For issues, contact: support@itservicesfreetown.com

- Enable USB debugging on your Android device- Report bugs on GitHub

- Run provided ADB commands in terminal/command prompt- Feature requests welcome

- Get detailed Android system information

---

---

**Version:** 2.0  

## 📊 Information Display**Last Updated:** October 27, 2025  

**Compatibility:** Chrome 61+, Edge 79+, Opera 48+, Brave  

The page shows information in organized sections:**Platform:** Desktop/Laptop only


### 1. **Connected Device Status**
- Device name (product name)
- Connection status indicator
- Vendor information
- Quick disconnect button

### 2. **Available Device Information (WebUSB)**
Displays in a clean 2-column grid:
- **Model:** Device product name
- **Manufacturer:** Company name
- **Serial Number:** Unique device identifier
- **Vendor ID:** USB vendor identifier (hex)
- **Product ID:** USB product identifier (hex)
- **USB Version:** USB protocol version
- **Device Class:** USB device class code
- **Configurations:** Number of USB configurations

### 3. **WebUSB Limitations Notice** (Orange-bordered section)
- Clear explanation of API constraints
- Why WebUSB cannot access Android system info
- ADB installation guide with download link
- Example ADB commands ready to copy
- Links to official documentation

---

## 🔒 Privacy & Security

- ✅ **No Data Collection**: All processing happens locally in your browser
- ✅ **No Server Communication**: Device info never leaves your computer
- ✅ **Browser Sandboxed**: WebUSB runs in secure browser environment
- ✅ **User Authorization Required**: You must explicitly grant access to each device
- ✅ **Temporary Connection**: Connection closes when you leave the page
- ✅ **No Tracking**: No analytics or tracking of device information

---

## 💡 Tips & Best Practices

1. ✅ **Use Original USB Cable**: Better connection stability and faster data transfer
2. ✅ **Try Different USB Ports**: If device not detected, try another port
3. ✅ **Check Browser Compatibility**: Use Chrome/Edge/Brave for best results
4. ✅ **Grant Permissions**: Allow USB access when browser prompts
5. ✅ **Install ADB for Extended Info**: Required for professional-level device information
6. ✅ **Enable USB Debugging**: Only needed for ADB, not for WebUSB
7. ✅ **Keep Device Unlocked**: Some USB modes require unlocked screen

---

## 🐛 Troubleshooting

### Issue: Device Not Appearing in Picker?

**Possible Causes & Solutions:**
- ✅ Try different USB cable (preferably original)
- ✅ Try different USB port on computer
- ✅ Restart browser and try again
- ✅ Check if device is in correct USB mode (MTP/PTP)
- ✅ Update USB drivers (Windows users)
- ✅ Check browser console for errors (F12)

### Issue: "No Compatible Devices Found"?

**Possible Causes & Solutions:**
- ✅ Verify it's an Android device (iOS not supported)
- ✅ Check USB connection is secure
- ✅ Try reconnecting device
- ✅ Unlock device screen
- ✅ Change USB mode on device (Settings → USB)

### Issue: Want IMEI, Android Version, Battery Info?

**Solution:**
This information **cannot be accessed via WebUSB** due to browser security limitations. You must:

1. Install ADB tools (guide on page)
2. Enable USB debugging on device
3. Authorize computer on device
4. Run ADB commands (provided on page)

### Issue: "Desktop Required" Message?

**Reason:** You're accessing from a mobile device

**Solution:** Use a desktop/laptop computer

**Why:** WebUSB requires physical USB connection between computer and Android device

---

## 📚 Resources

### Official Documentation
- [WebUSB API Specification](https://wicg.github.io/webusb/)
- [MDN WebUSB Documentation](https://developer.mozilla.org/en-US/docs/Web/API/USB)
- [Android Debug Bridge Guide](https://developer.android.com/studio/command-line/adb)
- [USB Device Class Codes](https://www.usb.org/defined-class-codes)

### Downloads
- [ADB Platform Tools](https://developer.android.com/studio/releases/platform-tools)
- [Google USB Driver (Windows)](https://developer.android.com/studio/run/win-usb)
- [Samsung USB Drivers](https://developer.samsung.com/mobile/android-usb-driver.html)

### Tutorials
- [Enable USB Debugging](https://developer.android.com/studio/debug/dev-options)
- [ADB Commands Cheat Sheet](https://gist.github.com/Pulimet/5013acf2cd5b28e55036c82c91bd56d8)
- [WebUSB for Arduino](https://github.com/webusb/arduino) (similar concept)

---

## 🔄 Future Possibilities

While current WebUSB API limitations prevent full ADB access in a browser, potential future enhancements could include:

### Possible (with separate application):
1. **Native ADB Integration** - Desktop application with full ADB support
2. **Automated Device Tests** - Battery, screen, sensors, etc.
3. **Device History Tracking** - Remember previously connected devices
4. **Batch Device Processing** - Process multiple devices sequentially

### Not Possible (browser security restrictions):
1. ❌ **Full ADB in Browser** - Cannot execute shell commands
2. ❌ **Trigger USB Debug Auth** - Cannot prompt authorization
3. ❌ **Access System Properties** - Requires ADB protocol
4. ❌ **Read IMEI/Battery** - Protected Android APIs

---

## 🤔 FAQ

### Q: Why can't I see IMEI, Android version, battery info?
**A:** WebUSB can only access USB descriptors (hardware info). For Android system info, you need ADB tools installed on your computer.

### Q: Do I need to enable USB debugging for this tool?
**A:** No, USB debugging is NOT required for WebUSB. It's only required if you want to use ADB commands for extended info.

### Q: Will this work on my iPhone?
**A:** No, this tool is designed for Android devices only. Apple devices use different protocols.

### Q: Can this tool damage my device?
**A:** No, this tool only reads information. It cannot modify, flash, or damage your device.

### Q: Why doesn't this work in Firefox/Safari?
**A:** Firefox and Safari don't support the WebUSB API yet. Use Chrome, Edge, Opera, or Brave.

### Q: Is my device information sent to a server?
**A:** No, all information stays in your browser. Nothing is sent to any server.

### Q: Can I use this on my phone/tablet?
**A:** No, this requires a physical USB connection between a computer and Android device.

---

## 📝 Version History

**v2.0** - October 27, 2025
- Updated documentation to reflect accurate WebUSB limitations
- Added comprehensive ADB installation guide
- Included example ADB commands for extended device info
- Clarified what can and cannot be accessed via WebUSB
- Added detailed troubleshooting section

**v1.0** - October 26, 2025
- Initial release with WebUSB device detection
- Mobile device detection and blocking
- Basic USB descriptor information display

---

**💡 Remember:** This web tool provides **basic USB information**. For professional-level device details (IMEI, Android version, battery, etc.), install **ADB tools** and follow the guide on the page.
