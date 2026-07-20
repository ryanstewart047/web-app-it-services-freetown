const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    backgroundColor: '#1a1a2e'
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// ADB Command Handlers
ipcMain.handle('check-adb', async () => {
  try {
    const { stdout, stderr } = await execPromise('adb version');
    return { success: true, installed: true, version: stdout };
  } catch (error) {
    return { success: false, installed: false, error: error.message };
  }
});

ipcMain.handle('run-adb-command', async (event, command) => {
  try {
    const { stdout, stderr } = await execPromise(`adb ${command}`);
    return { success: true, output: stdout || stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-device-list', async () => {
  try {
    const { stdout } = await execPromise('adb devices -l');
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-all-device-info', async () => {
  const commands = {
    // Basic Info
    model: 'shell getprop ro.product.model',
    manufacturer: 'shell getprop ro.product.manufacturer',
    brand: 'shell getprop ro.product.brand',
    device: 'shell getprop ro.product.device',
    serialNumber: 'get-serialno',
    
    // Android Info
    androidVersion: 'shell getprop ro.build.version.release',
    sdkVersion: 'shell getprop ro.build.version.sdk',
    buildId: 'shell getprop ro.build.id',
    buildNumber: 'shell getprop ro.build.display.id',
    securityPatch: 'shell getprop ro.build.version.security_patch',
    
    // IMEI Information - Multiple robust methods
    imei1: 'shell getprop persist.radio.imei',
    imei2: 'shell getprop persist.radio.imei2',
    imeiSimple: 'shell dumpsys iphonesubinfo',
    
    // Hardware Info
    cpuAbi: 'shell getprop ro.product.cpu.abi',
    cpuAbi2: 'shell getprop ro.product.cpu.abi2',
    hardware: 'shell getprop ro.hardware',
    board: 'shell getprop ro.product.board',
    
    // USB Information (Native sysfs extraction)
    usbVendor: 'shell cat /sys/class/android_usb/android0/idVendor 2>/dev/null',
    usbProduct: 'shell cat /sys/class/android_usb/android0/idProduct 2>/dev/null',
    
    // FRP Status (Factory Reset Protection)
    frpPartition: 'shell getprop ro.frp.pst',
    frpState: 'shell settings get secure secure_frp_mode 2>/dev/null',
    
    // Display Info
    screenDensity: 'shell wm density',
    screenSize: 'shell wm size',
    screenResolution: 'shell dumpsys window displays | grep "init="',
    
    // Memory Info
    ramTotal: 'shell cat /proc/meminfo | grep MemTotal',
    ramFree: 'shell cat /proc/meminfo | grep MemFree',
    ramAvailable: 'shell cat /proc/meminfo | grep MemAvailable',
    
    // Storage Info
    storageInternal: 'shell df -h /data 2>/dev/null || shell df /data',
    storageSystem: 'shell df -h /system 2>/dev/null || shell df /system',
    storageSdcard: 'shell df -h /sdcard 2>/dev/null || shell df /sdcard',
    
    // Battery Info
    batteryLevel: 'shell dumpsys battery | grep level',
    batteryHealth: 'shell dumpsys battery | grep health',
    batteryStatus: 'shell dumpsys battery | grep status',
    batteryTemp: 'shell dumpsys battery | grep temperature',
    batteryVoltage: 'shell dumpsys battery | grep voltage',
    batteryTech: 'shell dumpsys battery | grep technology',
    
    // Network Info
    wifiMac: 'shell cat /sys/class/net/wlan0/address 2>/dev/null || shell cat /sys/class/net/eth0/address 2>/dev/null',
    ipAddress: 'shell ip route',
    
    // Additional Info
    bootloader: 'shell getprop ro.bootloader',
    fingerprint: 'shell getprop ro.build.fingerprint',
    locale: 'shell getprop persist.sys.locale',
    timezone: 'shell getprop persist.sys.timezone',
    uptime: 'shell uptime'
  };

  const results = {};
  
  for (const [key, command] of Object.entries(commands)) {
    try {
      const { stdout } = await execPromise(`adb ${command}`);
      results[key] = stdout.trim();
    } catch (error) {
      results[key] = 'N/A';
    }
  }
  
  return { success: true, data: results };
});

// Export device info to file
ipcMain.handle('export-device-info', async (event, data, format) => {
  const { dialog } = require('electron');
  
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Device Information',
      defaultPath: `device-info-${Date.now()}.${format}`,
      filters: [
        { name: format.toUpperCase(), extensions: [format] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      const fs = require('fs');
      let content;
      
      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
      } else if (format === 'txt') {
        content = Object.entries(data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }
      
      fs.writeFileSync(result.filePath, content);
      return { success: true, path: result.filePath };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
