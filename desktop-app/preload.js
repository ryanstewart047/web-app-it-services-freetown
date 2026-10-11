const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  checkADB: () => ipcRenderer.invoke('check-adb'),
  getDeviceList: () => ipcRenderer.invoke('get-device-list'),
  getAllDeviceInfo: (serial) => ipcRenderer.invoke('get-all-device-info', serial),
  exportDeviceInfo: (data, format) => ipcRenderer.invoke('export-device-info', data, format)
});
