// Global state
let deviceData = null;

// DOM Elements
const statusBar = {
  adb: document.getElementById('adbStatus'),
  device: document.getElementById('deviceStatus')
};

const warnings = {
  adb: document.getElementById('adbWarning'),
  noDevice: document.getElementById('noDeviceWarning')
};

const states = {
  loading: document.getElementById('loadingState'),
  deviceInfo: document.getElementById('deviceInfo')
};

const buttons = {
  refresh: document.getElementById('refreshBtn'),
  recheckAdb: document.getElementById('recheckAdbBtn'),
  exportJson: document.getElementById('exportJsonBtn'),
  exportTxt: document.getElementById('exportTxtBtn')
};

// Initialize app
async function initialize() {
  console.log('Initializing app...');
  
  // Check ADB installation
  const adbCheck = await window.electronAPI.checkADB();
  
  if (!adbCheck.installed) {
    showADBWarning();
    return;
  }
  
  updateADBStatus('Installed ✓', 'success');
  warnings.adb.style.display = 'none';
  
  // Check for connected devices
  await checkDevices();
}

// Check for connected devices
async function checkDevices() {
  const deviceList = await window.electronAPI.getDeviceList();
  
  if (!deviceList.success) {
    updateDeviceStatus('Error checking devices', 'error');
    return;
  }
  
  // Parse device list
  const lines = deviceList.output.split('\n');
  const devices = lines.filter(line => 
    line.includes('device') && 
    !line.includes('List of devices') &&
    !line.trim().endsWith('offline') &&
    !line.trim().endsWith('unauthorized')
  );
  
  if (devices.length === 0) {
    showNoDeviceWarning();
    return;
  }
  
  // Device found!
  warnings.noDevice.style.display = 'none';
  const deviceInfo = devices[0].split(/\s+/)[0];
  updateDeviceStatus(`Connected (${deviceInfo})`, 'success');
  
  // Gather device information
  await gatherDeviceInfo();
}

// Gather all device information
async function gatherDeviceInfo() {
  states.loading.style.display = 'block';
  states.deviceInfo.style.display = 'none';
  
  try {
    const result = await window.electronAPI.getAllDeviceInfo();
    
    if (result.success) {
      deviceData = result.data;
      displayDeviceInfo(result.data);
      states.loading.style.display = 'none';
      states.deviceInfo.style.display = 'block';
    } else {
      console.error('Failed to get device info:', result.error);
      states.loading.style.display = 'none';
      alert('Failed to gather device information. Make sure USB debugging is enabled and authorized.');
    }
  } catch (error) {
    console.error('Error gathering device info:', error);
    states.loading.style.display = 'none';
    alert('An error occurred while gathering device information.');
  }
}

// Display device information
function displayDeviceInfo(data) {
  // Helper function to clean and format values
  const cleanValue = (value) => {
    if (!value || value === 'N/A' || value.trim() === '') return '-';
    return value.trim();
  };
  
  const formatMemory = (memStr) => {
    if (!memStr || memStr === 'N/A') return '-';
    const match = memStr.match(/(\d+)\s*kB/);
    if (match) {
      const kb = parseInt(match[1]);
      const gb = (kb / 1024 / 1024).toFixed(2);
      return `${gb} GB (${(kb / 1024).toFixed(0)} MB)`;
    }
    return memStr;
  };
  
  const formatStorage = (storageStr) => {
    if (!storageStr || storageStr === 'N/A') return '-';
    const lines = storageStr.split('\n');
    if (lines.length > 1) {
      const parts = lines[1].trim().split(/\s+/);
      if (parts.length >= 4) {
        const used = parts[2];
        const available = parts[3];
        return `Used: ${used}, Available: ${available}`;
      }
    }
    return storageStr;
  };
  
  const formatBattery = (batteryStr, key) => {
    if (!batteryStr || batteryStr === 'N/A') return '-';
    const match = batteryStr.match(/:\s*(.+)/);
    if (match) {
      let value = match[1].trim();
      
      // Convert battery values to readable format
      if (key === 'batteryLevel') return `${value}%`;
      if (key === 'batteryTemp') {
        const temp = parseInt(value) / 10;
        return `${temp}°C`;
      }
      if (key === 'batteryVoltage') {
        const voltage = parseInt(value) / 1000;
        return `${voltage.toFixed(2)}V`;
      }
      if (key === 'batteryHealth') {
        const healthMap = { '2': 'Good', '3': 'Overheat', '4': 'Dead', '5': 'Over voltage', '6': 'Unspecified failure', '7': 'Cold' };
        return healthMap[value] || value;
      }
      if (key === 'batteryStatus') {
        const statusMap = { '1': 'Unknown', '2': 'Charging', '3': 'Discharging', '4': 'Not charging', '5': 'Full' };
        return statusMap[value] || value;
      }
      
      return value;
    }
    return batteryStr;
  };
  
  const parseIMEI = (imeiStr) => {
    if (!imeiStr || imeiStr === 'N/A') return '-';
    
    // Try to extract IMEI from the hex output
    const numbers = imeiStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const imei = numbers.join('').substring(0, 15);
      if (imei.length === 15) return imei;
    }
    
    return 'Unable to retrieve';
  };
  
  // Basic Information
  document.getElementById('model').textContent = cleanValue(data.model);
  document.getElementById('manufacturer').textContent = cleanValue(data.manufacturer);
  document.getElementById('brand').textContent = cleanValue(data.brand);
  document.getElementById('device').textContent = cleanValue(data.device);
  document.getElementById('serialNumber').textContent = cleanValue(data.serialNumber);
  
  // IMEI Information
  document.getElementById('imei1').textContent = parseIMEI(data.imei1);
  document.getElementById('imei2').textContent = parseIMEI(data.imei2);
  
  // Android Information
  document.getElementById('androidVersion').textContent = cleanValue(data.androidVersion);
  document.getElementById('sdkVersion').textContent = cleanValue(data.sdkVersion);
  document.getElementById('buildId').textContent = cleanValue(data.buildId);
  document.getElementById('buildNumber').textContent = cleanValue(data.buildNumber);
  document.getElementById('securityPatch').textContent = cleanValue(data.securityPatch);
  
  // Hardware Information
  document.getElementById('cpuAbi').textContent = cleanValue(data.cpuAbi);
  document.getElementById('hardware').textContent = cleanValue(data.hardware);
  document.getElementById('board').textContent = cleanValue(data.board);
  document.getElementById('bootloader').textContent = cleanValue(data.bootloader);
  
  // Display Information
  document.getElementById('screenSize').textContent = cleanValue(data.screenSize);
  document.getElementById('screenDensity').textContent = cleanValue(data.screenDensity);
  const resolution = data.screenResolution?.match(/init=(\d+x\d+)/);
  document.getElementById('screenResolution').textContent = resolution ? resolution[1] : '-';
  
  // Memory Information
  document.getElementById('ramTotal').textContent = formatMemory(data.ramTotal);
  document.getElementById('ramAvailable').textContent = formatMemory(data.ramAvailable);
  document.getElementById('ramFree').textContent = formatMemory(data.ramFree);
  
  // Storage Information
  document.getElementById('storageInternal').textContent = formatStorage(data.storageInternal);
  document.getElementById('storageSystem').textContent = formatStorage(data.storageSystem);
  document.getElementById('storageSdcard').textContent = formatStorage(data.storageSdcard);
  
  // Battery Information
  document.getElementById('batteryLevel').textContent = formatBattery(data.batteryLevel, 'batteryLevel');
  document.getElementById('batteryHealth').textContent = formatBattery(data.batteryHealth, 'batteryHealth');
  document.getElementById('batteryStatus').textContent = formatBattery(data.batteryStatus, 'batteryStatus');
  document.getElementById('batteryTemp').textContent = formatBattery(data.batteryTemp, 'batteryTemp');
  document.getElementById('batteryVoltage').textContent = formatBattery(data.batteryVoltage, 'batteryVoltage');
  document.getElementById('batteryTech').textContent = formatBattery(data.batteryTech, 'batteryTech');
  
  // Network Information
  document.getElementById('wifiMac').textContent = cleanValue(data.wifiMac);
  document.getElementById('ipAddress').textContent = cleanValue(data.ipAddress);
  
  // Additional Information
  document.getElementById('locale').textContent = cleanValue(data.locale);
  document.getElementById('timezone').textContent = cleanValue(data.timezone);
  document.getElementById('uptime').textContent = cleanValue(data.uptime);
  document.getElementById('fingerprint').textContent = cleanValue(data.fingerprint);
}

// Status updates
function updateADBStatus(text, type) {
  statusBar.adb.textContent = text;
  statusBar.adb.style.color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b';
}

function updateDeviceStatus(text, type) {
  statusBar.device.textContent = text;
  statusBar.device.style.color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b';
}

// Show warnings
function showADBWarning() {
  updateADBStatus('Not Installed ✗', 'error');
  warnings.adb.style.display = 'flex';
  warnings.noDevice.style.display = 'none';
  states.loading.style.display = 'none';
  states.deviceInfo.style.display = 'none';
}

function showNoDeviceWarning() {
  updateDeviceStatus('No device connected', 'error');
  warnings.noDevice.style.display = 'flex';
  states.loading.style.display = 'none';
  states.deviceInfo.style.display = 'none';
}

// Export functions
async function exportAsJSON() {
  if (!deviceData) return;
  
  const result = await window.electronAPI.exportDeviceInfo(deviceData, 'json');
  
  if (result.success && !result.canceled) {
    alert(`Device information exported successfully to:\n${result.path}`);
  }
}

async function exportAsTXT() {
  if (!deviceData) return;
  
  const result = await window.electronAPI.exportDeviceInfo(deviceData, 'txt');
  
  if (result.success && !result.canceled) {
    alert(`Device information exported successfully to:\n${result.path}`);
  }
}

// Event listeners
buttons.refresh.addEventListener('click', () => {
  initialize();
});

buttons.recheckAdb.addEventListener('click', () => {
  initialize();
});

buttons.exportJson.addEventListener('click', exportAsJSON);
buttons.exportTxt.addEventListener('click', exportAsTXT);

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initialize();
});
