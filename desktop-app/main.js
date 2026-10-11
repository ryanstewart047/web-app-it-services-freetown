const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execFilePromise = util.promisify(execFile);
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800, minWidth: 900, minHeight: 600,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
    icon: path.join(__dirname, 'assets', 'icon.png'), titleBarStyle: 'default', backgroundColor: '#1a1a2e',
  });
  mainWindow.loadFile('index.html');
  if (process.argv.includes('--dev')) mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('com.itservices.devicedetector');
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

function runAdb(args) { return execFilePromise('adb', args, { windowsHide: true, maxBuffer: 2 * 1024 * 1024, timeout: 15000 }); }
function isSafeSerial(serial) { return typeof serial === 'string' && /^[A-Za-z0-9._:-]+$/.test(serial); }
function parseDeviceList(output) {
  return output.split(/\r?\n/).slice(1).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [serial, state, ...details] = line.split(/\s+/);
    return { serial, state: state || 'unknown', details: details.join(' ') };
  });
}

ipcMain.handle('check-adb', async () => {
  try { const { stdout } = await runAdb(['version']); return { success: true, installed: true, version: stdout.trim() }; }
  catch (error) { return { success: false, installed: false, error: error.message }; }
});

ipcMain.handle('get-device-list', async () => {
  try { const { stdout } = await runAdb(['devices', '-l']); return { success: true, devices: parseDeviceList(stdout) }; }
  catch (error) { return { success: false, error: error.message, devices: [] }; }
});

ipcMain.handle('get-all-device-info', async (_event, serial) => {
  if (!isSafeSerial(serial)) return { success: false, error: 'Choose a valid connected device.' };
  const commands = {
    model: ['shell', 'getprop', 'ro.product.model'], manufacturer: ['shell', 'getprop', 'ro.product.manufacturer'], brand: ['shell', 'getprop', 'ro.product.brand'], device: ['shell', 'getprop', 'ro.product.device'], serialNumber: ['get-serialno'],
    androidVersion: ['shell', 'getprop', 'ro.build.version.release'], sdkVersion: ['shell', 'getprop', 'ro.build.version.sdk'], buildId: ['shell', 'getprop', 'ro.build.id'], buildNumber: ['shell', 'getprop', 'ro.build.display.id'], securityPatch: ['shell', 'getprop', 'ro.build.version.security_patch'],
    imei1: ['shell', 'getprop', 'persist.radio.imei'], imei2: ['shell', 'getprop', 'persist.radio.imei2'], imeiSimple: ['shell', 'dumpsys', 'iphonesubinfo'], cpuAbi: ['shell', 'getprop', 'ro.product.cpu.abi'], hardware: ['shell', 'getprop', 'ro.hardware'], board: ['shell', 'getprop', 'ro.product.board'],
    usbVendor: ['shell', 'sh', '-c', 'cat /sys/class/android_usb/android0/idVendor 2>/dev/null'], usbProduct: ['shell', 'sh', '-c', 'cat /sys/class/android_usb/android0/idProduct 2>/dev/null'], frpPartition: ['shell', 'getprop', 'ro.frp.pst'], frpState: ['shell', 'settings', 'get', 'secure', 'secure_frp_mode'],
    screenDensity: ['shell', 'wm', 'density'], screenSize: ['shell', 'wm', 'size'], screenResolution: ['shell', 'dumpsys', 'window', 'displays'], ramTotal: ['shell', 'cat', '/proc/meminfo'], storageInternal: ['shell', 'df', '-h', '/data'], storageSystem: ['shell', 'df', '-h', '/system'], storageSdcard: ['shell', 'df', '-h', '/sdcard'],
    battery: ['shell', 'dumpsys', 'battery'], wifiMac: ['shell', 'sh', '-c', 'cat /sys/class/net/wlan0/address 2>/dev/null || cat /sys/class/net/eth0/address 2>/dev/null'], ipAddress: ['shell', 'ip', 'route'], bootloader: ['shell', 'getprop', 'ro.bootloader'], fingerprint: ['shell', 'getprop', 'ro.build.fingerprint'], locale: ['shell', 'getprop', 'persist.sys.locale'], timezone: ['shell', 'getprop', 'persist.sys.timezone'], uptime: ['shell', 'uptime'],
  };
  const entries = await Promise.all(Object.entries(commands).map(async ([key, args]) => {
    try { const { stdout } = await runAdb(['-s', serial, ...args]); return [key, stdout.trim() || 'N/A']; }
    catch { return [key, 'N/A']; }
  }));
  return { success: true, data: Object.fromEntries(entries), serial, collectedAt: new Date().toISOString() };
});

ipcMain.handle('export-device-info', async (_event, data, format) => {
  if (!['json', 'txt', 'csv'].includes(format)) return { success: false, error: 'Unsupported export format.' };
  try {
    const result = await dialog.showSaveDialog(mainWindow, { title: 'Export Device Information', defaultPath: `device-info-${Date.now()}.${format}`, filters: [{ name: format.toUpperCase(), extensions: [format] }, { name: 'All Files', extensions: ['*'] }] });
    if (result.canceled || !result.filePath) return { success: false, canceled: true };
    const entries = Object.entries(data);
    const content = format === 'json' ? JSON.stringify(data, null, 2) : format === 'csv' ? ['Field,Value', ...entries.map(([key, value]) => `"${key.replace(/"/g, '""')}","${String(value).replace(/"/g, '""')}"`)].join('\n') : entries.map(([key, value]) => `${key}: ${value}`).join('\n');
    fs.writeFileSync(result.filePath, content, 'utf8');
    return { success: true, path: result.filePath };
  } catch (error) { return { success: false, error: error.message }; }
});
