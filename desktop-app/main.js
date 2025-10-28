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
    
    // IMEI Information (Multiple methods for compatibility)
    imei1: 'shell service call iphonesubinfo 1 | grep -o "[0-9a-f]\\{8\\}" | tail -c +3 | while read a; do echo -n $(printf "\\x${a:6:2}\\x${a:4:2}\\x${a:2:2}\\x${a:0:2}"); done',
    imei2: 'shell service call iphonesubinfo 3 | grep -o "[0-9a-f]\\{8\\}" | tail -c +3 | while read a; do echo -n $(printf "\\x${a:6:2}\\x${a:4:2}\\x${a:2:2}\\x${a:0:2}"); done',
    imeiSimple: 'shell service call iphonesubinfo 1',
    
    // Hardware Info
    cpuAbi: 'shell getprop ro.product.cpu.abi',
    cpuAbi2: 'shell getprop ro.product.cpu.abi2',
    hardware: 'shell getprop ro.hardware',
    board: 'shell getprop ro.product.board',
    
    // Display Info
    screenDensity: 'shell wm density',
    screenSize: 'shell wm size',
    screenResolution: 'shell dumpsys window displays | grep "init="',
    
    // Memory Info
    ramTotal: 'shell cat /proc/meminfo | grep MemTotal',
    ramFree: 'shell cat /proc/meminfo | grep MemFree',
    ramAvailable: 'shell cat /proc/meminfo | grep MemAvailable',
    
    // Storage Info
    storageInternal: 'shell df /data',
    storageSystem: 'shell df /system',
    storageSdcard: 'shell df /sdcard',
    
    // Battery Info
    batteryLevel: 'shell dumpsys battery | grep level',
    batteryHealth: 'shell dumpsys battery | grep health',
    batteryStatus: 'shell dumpsys battery | grep status',
    batteryTemp: 'shell dumpsys battery | grep temperature',
    batteryVoltage: 'shell dumpsys battery | grep voltage',
    batteryTech: 'shell dumpsys battery | grep technology',
    
    // Network Info
    wifiMac: 'shell cat /sys/class/net/wlan0/address',
    ipAddress: 'shell ip addr show wlan0 | grep "inet " | cut -d\' \' -f6',
    
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
