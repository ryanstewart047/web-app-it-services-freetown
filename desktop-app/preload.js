const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  checkADB: () => ipcRenderer.invoke('check-adb'),
  runCommand: (command) => ipcRenderer.invoke('run-adb-command', command),
  getDeviceList: () => ipcRenderer.invoke('get-device-list'),
  getAllDeviceInfo: () => ipcRenderer.invoke('get-all-device-info'),
  exportDeviceInfo: (data, format) => ipcRenderer.invoke('export-device-info', data, format)
});
