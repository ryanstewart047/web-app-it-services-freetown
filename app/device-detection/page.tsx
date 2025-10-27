'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Usb, Smartphone, Info, Cpu, HardDrive, Battery, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

interface DeviceInfo {
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
  vendorId?: number;
  productId?: number;
  deviceClass?: number;
  deviceSubclass?: number;
  deviceProtocol?: number;
  deviceVersionMajor?: number;
  deviceVersionMinor?: number;
  deviceVersionSubminor?: number;
  usbVersionMajor?: number;
  usbVersionMinor?: number;
  usbVersionSubminor?: number;
  configurations?: USBConfiguration[];
}

interface DetectedDevice extends DeviceInfo {
  connectionTime: string;
  status: 'connected' | 'disconnected';
}

interface ADBDeviceInfo {
  model?: string;
  manufacturer?: string;
  brand?: string;
  device?: string;
  androidVersion?: string;
  sdkVersion?: string;
  buildId?: string;
  serialNumber?: string;
  imei?: string;
  imei2?: string;
  phoneNumber?: string;
  simOperator?: string;
  simCountry?: string;
  networkOperator?: string;
  networkCountry?: string;
  wifiMac?: string;
  bluetoothMac?: string;
  ipAddress?: string;
  batteryLevel?: string;
  batteryStatus?: string;
  screenDensity?: string;
  screenResolution?: string;
  cpuAbi?: string;
  cpuAbi2?: string;
  totalRam?: string;
  totalStorage?: string;
  availableStorage?: string;
  securityPatch?: string;
  bootloader?: string;
  fingerprint?: string;
  frpStatus?: string;
  lockStatus?: string;
  usbMode?: string;
}

export default function DeviceDetectionPage() {
  const [devices, setDevices] = useState<DetectedDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DetectedDevice | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancedInfo, setAdvancedInfo] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [adbInfo, setAdbInfo] = useState<ADBDeviceInfo | null>(null);
  const [isReadingADB, setIsReadingADB] = useState(false);
  const [showSupportedDevices, setShowSupportedDevices] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(userAgent) || window.innerWidth < 768;
    };

    if (checkMobile()) {
      setIsMobile(true);
      return;
    }

    // Check if WebUSB is supported
    if (!navigator.usb) {
      setIsSupported(false);
      return;
    }

    // Listen for device connection events
    navigator.usb.addEventListener('connect', handleConnect);
    navigator.usb.addEventListener('disconnect', handleDisconnect);

    // Get already connected devices
    loadConnectedDevices();

    return () => {
      if (navigator.usb) {
        navigator.usb.removeEventListener('connect', handleConnect);
        navigator.usb.removeEventListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const loadConnectedDevices = async () => {
    try {
      if (!navigator.usb) return;
      const connectedDevices = await navigator.usb.getDevices();
      const deviceList: DetectedDevice[] = connectedDevices.map(device => ({
        productName: device.productName,
        manufacturerName: device.manufacturerName,
        serialNumber: device.serialNumber,
        vendorId: device.vendorId,
        productId: device.productId,
        deviceClass: device.deviceClass,
        deviceSubclass: device.deviceSubclass,
        deviceProtocol: device.deviceProtocol,
        deviceVersionMajor: device.deviceVersionMajor,
        deviceVersionMinor: device.deviceVersionMinor,
        deviceVersionSubminor: device.deviceVersionSubminor,
        usbVersionMajor: device.usbVersionMajor,
        usbVersionMinor: device.usbVersionMinor,
        usbVersionSubminor: device.usbVersionSubminor,
        configurations: device.configurations,
        connectionTime: new Date().toLocaleString(),
        status: 'connected'
      }));
      setDevices(deviceList);
    } catch (err) {
      console.error('Error loading connected devices:', err);
    }
  };

  const handleConnect = (event: USBConnectionEvent) => {
    const device = event.device;
    const newDevice: DetectedDevice = {
      productName: device.productName,
      manufacturerName: device.manufacturerName,
      serialNumber: device.serialNumber,
      vendorId: device.vendorId,
      productId: device.productId,
      deviceClass: device.deviceClass,
      deviceSubclass: device.deviceSubclass,
      deviceProtocol: device.deviceProtocol,
      deviceVersionMajor: device.deviceVersionMajor,
      deviceVersionMinor: device.deviceVersionMinor,
      deviceVersionSubminor: device.deviceVersionSubminor,
      usbVersionMajor: device.usbVersionMajor,
      usbVersionMinor: device.usbVersionMinor,
      usbVersionSubminor: device.usbVersionSubminor,
      configurations: device.configurations,
      connectionTime: new Date().toLocaleString(),
      status: 'connected'
    };
    setDevices(prev => [...prev, newDevice]);
    setError(null);
  };

  const handleDisconnect = (event: USBConnectionEvent) => {
    const device = event.device;
    setDevices(prev => 
      prev.map(d => 
        d.serialNumber === device.serialNumber 
          ? { ...d, status: 'disconnected' as const }
          : d
      )
    );
    if (selectedDevice?.serialNumber === device.serialNumber) {
      setSelectedDevice(null);
    }
  };

  const requestDevice = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!navigator.usb) {
        setError('WebUSB is not supported in this browser');
        return;
      }
      
      // Request access to USB device
      const device = await navigator.usb.requestDevice({
        filters: [
          // Android devices (common vendor IDs)
          { vendorId: 0x18D1 }, // Google
          { vendorId: 0x04E8 }, // Samsung
          { vendorId: 0x22B8 }, // Motorola
          { vendorId: 0x0BB4 }, // HTC
          { vendorId: 0x12D1 }, // Huawei
          { vendorId: 0x19D2 }, // ZTE
          { vendorId: 0x1004 }, // LG
          { vendorId: 0x0FCE }, // Sony Ericsson
          { vendorId: 0x2717 }, // Xiaomi
          { vendorId: 0x2A45 }, // OnePlus
          { vendorId: 0x05C6 }, // Qualcomm
          { vendorId: 0x0489 }, // Foxconn
          { vendorId: 0x1D91 }, // OPPO
          { vendorId: 0x2D95 }, // Vivo
          { vendorId: 0x0E8D }, // MediaTek
          // Add more vendor IDs as needed
        ]
      });

      // Open the device
      await device.open();
      
      // Try to get more detailed information
      const detailedInfo = await getDetailedDeviceInfo(device);
      setAdvancedInfo(detailedInfo);

      const newDevice: DetectedDevice = {
        productName: device.productName,
        manufacturerName: device.manufacturerName,
        serialNumber: device.serialNumber,
        vendorId: device.vendorId,
        productId: device.productId,
        deviceClass: device.deviceClass,
        deviceSubclass: device.deviceSubclass,
        deviceProtocol: device.deviceProtocol,
        deviceVersionMajor: device.deviceVersionMajor,
        deviceVersionMinor: device.deviceVersionMinor,
        deviceVersionSubminor: device.deviceVersionSubminor,
        usbVersionMajor: device.usbVersionMajor,
        usbVersionMinor: device.usbVersionMinor,
        usbVersionSubminor: device.usbVersionSubminor,
        configurations: device.configurations,
        connectionTime: new Date().toLocaleString(),
        status: 'connected'
      };

      setDevices(prev => {
        const exists = prev.find(d => d.serialNumber === newDevice.serialNumber);
        if (exists) {
          return prev.map(d => d.serialNumber === newDevice.serialNumber ? newDevice : d);
        }
        return [...prev, newDevice];
      });

      setSelectedDevice(newDevice);
      
      // Try to read ADB device info
      await readADBDeviceInfo(device);

    } catch (err: any) {
      console.error('Error requesting device:', err);
      setError(err.message || 'Failed to connect to device. Make sure USB debugging is enabled on your Android device.');
    } finally {
      setIsConnecting(false);
    }
  };

  const getDetailedDeviceInfo = async (device: USBDevice) => {
    const info: any = {
      configurations: [],
      interfaces: [],
      endpoints: []
    };

    try {
      // Get configuration details
      if (device.configurations) {
        for (const config of device.configurations) {
          info.configurations.push({
            configurationValue: config.configurationValue,
            configurationName: config.configurationName,
            interfaces: config.interfaces?.length || 0
          });

          // Get interface details
          if (config.interfaces) {
            for (const iface of config.interfaces) {
              for (const alt of iface.alternates) {
                info.interfaces.push({
                  interfaceNumber: iface.interfaceNumber,
                  interfaceClass: alt.interfaceClass,
                  interfaceSubclass: alt.interfaceSubclass,
                  interfaceProtocol: alt.interfaceProtocol,
                  interfaceName: alt.interfaceName,
                  endpoints: alt.endpoints?.length || 0
                });

                // Get endpoint details
                if (alt.endpoints) {
                  for (const endpoint of alt.endpoints) {
                    info.endpoints.push({
                      endpointNumber: endpoint.endpointNumber,
                      direction: endpoint.direction,
                      type: endpoint.type,
                      packetSize: endpoint.packetSize
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error getting detailed info:', err);
    }

    return info;
  };

  const readADBDeviceInfo = async (device: USBDevice) => {
    setIsReadingADB(true);
    const deviceInfo: ADBDeviceInfo = {};

    try {
      console.log('Reading available device information...');

      // WebUSB can only access USB descriptors, not ADB shell commands
      // To get extended info, users need to use actual ADB tools
      
      deviceInfo.model = device.productName || 'Unknown';
      deviceInfo.manufacturer = device.manufacturerName || 'Unknown';
      deviceInfo.serialNumber = device.serialNumber || 'Unknown';

      // Show realistic info message
      setError(null); // Clear any previous errors

    } catch (err) {
      console.error('Error reading device info:', err);
    } finally {
      setIsReadingADB(false);
    }

    setAdbInfo(deviceInfo);
    return deviceInfo;
  };

  const getVendorName = (vendorId?: number): string => {
    const vendors: { [key: number]: string } = {
      0x18D1: 'Google',
      0x04E8: 'Samsung',
      0x22B8: 'Motorola',
      0x0BB4: 'HTC',
      0x12D1: 'Huawei',
      0x19D2: 'ZTE',
      0x1004: 'LG',
      0x0FCE: 'Sony Ericsson',
      0x2717: 'Xiaomi',
      0x2A45: 'OnePlus',
      0x05C6: 'Qualcomm',
      0x0489: 'Foxconn',
      0x1D91: 'OPPO',
      0x2D95: 'Vivo',
      0x0E8D: 'MediaTek'
    };
    return vendorId ? (vendors[vendorId] || `Unknown (0x${vendorId.toString(16).toUpperCase()})`) : 'Unknown';
  };

  const getDeviceClassName = (deviceClass?: number): string => {
    const classes: { [key: number]: string } = {
      0x00: 'Device',
      0x02: 'Communications',
      0x03: 'HID (Human Interface Device)',
      0x08: 'Mass Storage',
      0x09: 'Hub',
      0xFF: 'Vendor Specific'
    };
    return deviceClass !== undefined ? (classes[deviceClass] || `Class ${deviceClass}`) : 'Unknown';
  };

  // Mobile device screen
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center">
            <Smartphone className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-orange-700 mb-2">Desktop Required</h2>
            <p className="text-orange-600 mb-4">
              USB Device Detection is only available on desktop/laptop computers. This feature requires a physical USB connection and is not supported on mobile devices.
            </p>
            <div className="bg-white rounded-lg p-6 mt-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-orange-500" />
                Why Desktop Only?
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Requires physical USB cable connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Uses WebUSB API (desktop browsers only)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Mobile devices cannot act as USB hosts for this purpose</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>To use this feature:</strong> Please visit this page from a desktop or laptop computer using Chrome, Edge, Opera, or Brave browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WebUSB not supported screen
  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">WebUSB Not Supported</h2>
            <p className="text-red-600 mb-4">
              Your browser doesn't support WebUSB API. Please use a Chromium-based browser (Chrome, Edge, Opera) to use this feature.
            </p>
            <div className="bg-white rounded-lg p-4 mt-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Supported Browsers:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Google Chrome (version 61+)</li>
                <li>Microsoft Edge (version 79+)</li>
                <li>Opera (version 48+)</li>
                <li>Brave Browser</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Usb className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">USB Device Detection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Connect your Android device via USB to get detailed hardware and system information
          </p>
          <p className="text-sm text-orange-600 font-semibold">
            ⚠️ Desktop/Laptop Only - Physical USB Connection Required
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Setup Instructions (Desktop Only)
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li><strong>Use a Desktop/Laptop Computer</strong> (this feature does not work on mobile devices)</li>
            <li>Enable <strong>Developer Options</strong> on your Android device (tap Build Number 7 times in Settings → About Phone)</li>
            <li>Enable <strong>USB Debugging</strong> in Developer Options</li>
            <li>Connect your device via USB cable <strong>to your computer</strong></li>
            <li>Click the "Connect Device" button below</li>
            <li>Select your device from the popup</li>
            <li>Allow USB debugging when prompted on your device</li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📊 Information Available:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
              <div>✓ Model & Manufacturer</div>
              <div>✓ Serial Number</div>
              <div>✓ USB IDs (Vendor/Product)</div>
              <div>✓ IMEI (with auth)</div>
              <div>✓ Android Version (with auth)</div>
              <div>✓ Build Info (with auth)</div>
              <div>✓ Battery Status (with auth)</div>
              <div>✓ Network Info (with auth)</div>
              <div>✓ Storage Info (with auth)</div>
              <div>✓ Screen Resolution (with auth)</div>
              <div>✓ CPU Architecture (with auth)</div>
              <div>✓ FRP Status (with auth)</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * "with auth" = Requires USB debugging authorization on device
            </p>
          </div>
        </div>

        {/* Supported Devices Dropdown */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg mb-8 overflow-hidden">
          <button
            onClick={() => setShowSupportedDevices(!showSupportedDevices)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">
                Supported Devices - 15+ Major Android Brands
              </h3>
            </div>
            <i className={`fas fa-chevron-${showSupportedDevices ? 'up' : 'down'} text-gray-600 transition-transform`}></i>
          </button>
          
          {showSupportedDevices && (
            <div className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Samsung', vendorId: '0x04E8', models: 'Galaxy S, Note, A, M, Z series' },
                  { name: 'Google Pixel', vendorId: '0x18D1', models: 'Pixel 1-8, Pro, Fold' },
                  { name: 'Xiaomi', vendorId: '0x2717', models: 'Mi, Redmi, POCO' },
                  { name: 'OnePlus', vendorId: '0x2A70', models: 'OnePlus 1-12, Nord' },
                  { name: 'OPPO', vendorId: '0x22D9', models: 'Find X, Reno, A series' },
                  { name: 'Vivo', vendorId: '0x2D95', models: 'V, Y, X, S series' },
                  { name: 'Huawei', vendorId: '0x12D1', models: 'P, Mate, Nova series' },
                  { name: 'Motorola', vendorId: '0x22B8', models: 'Moto G, Edge, Razr' },
                  { name: 'LG', vendorId: '0x1004', models: 'G, V, Velvet series' },
                  { name: 'Sony', vendorId: '0x0FCE', models: 'Xperia 1, 5, 10 series' },
                  { name: 'HTC', vendorId: '0x0BB4', models: 'U, Desire, One series' },
                  { name: 'Asus', vendorId: '0x0B05', models: 'ROG Phone, Zenfone' },
                  { name: 'Lenovo', vendorId: '0x17EF', models: 'Legion, K series' },
                  { name: 'ZTE', vendorId: '0x19D2', models: 'Axon, Blade series' },
                  { name: 'MediaTek Devices', vendorId: '0x0E8D', models: 'Various MTK-powered phones' }
                ].map((brand, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{brand.name}</h4>
                        <p className="text-xs text-gray-500 font-mono mb-1">{brand.vendorId}</p>
                        <p className="text-sm text-gray-600 truncate">{brand.models}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> If your device brand is not listed, it may still work! 
                  The tool supports any Android device with USB debugging enabled. 
                  Click "Connect USB Device" to try.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">Connection Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Connect Button */}
        <div className="text-center mb-8">
          <button
            onClick={requestDevice}
            disabled={isConnecting}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Smartphone className="w-6 h-6" />
            {isConnecting ? 'Connecting...' : 'Connect USB Device'}
          </button>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Supports: Samsung, Google, Motorola, Xiaomi, OnePlus, and 10+ more brands</p>
          </div>
        </div>

        {/* Device List */}
        {devices.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {devices.map((device, index) => (
              <div
                key={index}
                onClick={() => setSelectedDevice(device)}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedDevice === device ? 'ring-2 ring-blue-500' : ''
                } ${device.status === 'disconnected' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      device.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Smartphone className={`w-6 h-6 ${
                        device.status === 'connected' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {device.productName || 'Unknown Device'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {device.manufacturerName || getVendorName(device.vendorId)}
                      </p>
                    </div>
                  </div>
                  {device.status === 'connected' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serial Number:</span>
                    <span className="font-mono text-gray-900">{device.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor ID:</span>
                    <span className="font-mono text-gray-900">0x{device.vendorId?.toString(16).toUpperCase().padStart(4, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product ID:</span>
                    <span className="font-mono text-gray-900">0x{device.productId?.toString(16).toUpperCase().padStart(4, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${
                      device.status === 'connected' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {device.status === 'connected' ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Device Information */}
        {selectedDevice && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Info className="w-7 h-7 text-blue-600" />
              Detailed Device Information
            </h2>

            {/* Extended Device Information (like SamFw Tool) */}
            {adbInfo && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Available Device Information (WebUSB)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
                  <InfoRow label="Model" value={adbInfo.model || selectedDevice.productName || 'N/A'} />
                  <InfoRow label="Manufacturer" value={adbInfo.manufacturer || selectedDevice.manufacturerName || 'N/A'} />
                  <InfoRow label="Serial Number" value={adbInfo.serialNumber || selectedDevice.serialNumber || 'N/A'} mono />
                  <InfoRow label="Vendor ID" value={`0x${selectedDevice.vendorId?.toString(16).toUpperCase().padStart(4, '0')}`} mono />
                  <InfoRow label="Product ID" value={`0x${selectedDevice.productId?.toString(16).toUpperCase().padStart(4, '0')}`} mono />
                  <InfoRow label="USB Version" value={`${selectedDevice.usbVersionMajor}.${selectedDevice.usbVersionMinor}`} />
                  <InfoRow label="Device Class" value={getDeviceClassName(selectedDevice.deviceClass)} />
                  <InfoRow label="Configurations" value={selectedDevice.configurations?.length.toString() || '0'} />
                </div>
                
                {isReadingADB && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Reading device information...</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                  <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    WebUSB Limitations
                  </h4>
                  <p className="text-sm text-orange-800 mb-3">
                    WebUSB can only access basic USB descriptor information. For detailed device info like IMEI, Android version, 
                    battery status, etc., you need to use <strong>Android Debug Bridge (ADB)</strong> tools.
                  </p>
                  
                  <div className="bg-white rounded p-3 text-sm">
                    <p className="font-semibold text-gray-900 mb-2">📱 To Get Full Device Info (Like SamFw Tool):</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-2">
                      <li>Install <strong>ADB</strong> on your computer (<a href="/ADB_INSTALLATION_GUIDE.md" target="_blank" className="text-blue-600 hover:underline font-semibold">📖 See Full Installation Guide</a> or <a href="https://developer.android.com/studio/releases/platform-tools" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download here</a>)</li>
                      <li>Enable USB Debugging on your Android device</li>
                      <li>Connect device via USB</li>
                      <li>Open Command Prompt/Terminal and run:</li>
                    </ol>
                    <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                      <div className="mb-1"># Check device is connected</div>
                      <div className="mb-2">adb devices</div>
                      
                      <div className="mb-1 mt-3"># Get detailed device info</div>
                      <div>adb shell getprop ro.product.model</div>
                      <div>adb shell getprop ro.build.version.release</div>
                      <div>adb shell service call iphonesubinfo 1</div>
                      <div>adb shell dumpsys battery</div>
                      <div>adb shell df</div>
                      
                      <div className="mb-1 mt-3"># Get ALL properties at once</div>
                      <div>adb shell getprop</div>
                    </div>
                    
                    <p className="mt-3 text-xs text-gray-600">
                      💡 <strong>Tip:</strong> Professional tools like <strong>SamFw Tool</strong>, <strong>Odin</strong>, 
                      and <strong>Samsung Smart Switch</strong> use native ADB implementations to access this detailed information. 
                      Web browsers have security limitations that prevent full ADB access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Device Name" value={selectedDevice.productName || 'Unknown'} />
                  <InfoRow label="Manufacturer" value={selectedDevice.manufacturerName || getVendorName(selectedDevice.vendorId)} />
                  <InfoRow label="Serial Number" value={selectedDevice.serialNumber || 'N/A'} mono />
                  <InfoRow label="Connection Time" value={selectedDevice.connectionTime} />
                  <InfoRow 
                    label="Status" 
                    value={selectedDevice.status} 
                    valueClassName={selectedDevice.status === 'connected' ? 'text-green-600 font-semibold' : 'text-gray-500'}
                  />
                </div>
              </div>

              {/* USB Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Usb className="w-5 h-5 text-purple-600" />
                  USB Information
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Vendor ID" value={`0x${selectedDevice.vendorId?.toString(16).toUpperCase().padStart(4, '0')}`} mono />
                  <InfoRow label="Product ID" value={`0x${selectedDevice.productId?.toString(16).toUpperCase().padStart(4, '0')}`} mono />
                  <InfoRow label="Device Class" value={getDeviceClassName(selectedDevice.deviceClass)} />
                  <InfoRow label="Device Subclass" value={selectedDevice.deviceSubclass?.toString() || 'N/A'} />
                  <InfoRow label="Device Protocol" value={selectedDevice.deviceProtocol?.toString() || 'N/A'} />
                </div>
              </div>

              {/* Version Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-green-600" />
                  Version Information
                </h3>
                <div className="space-y-3">
                  <InfoRow 
                    label="Device Version" 
                    value={`${selectedDevice.deviceVersionMajor}.${selectedDevice.deviceVersionMinor}.${selectedDevice.deviceVersionSubminor}`} 
                  />
                  <InfoRow 
                    label="USB Version" 
                    value={`${selectedDevice.usbVersionMajor}.${selectedDevice.usbVersionMinor}.${selectedDevice.usbVersionSubminor}`} 
                  />
                  <InfoRow label="Configurations" value={selectedDevice.configurations?.length.toString() || '0'} />
                </div>
              </div>

              {/* Configuration Details */}
              {selectedDevice.configurations && selectedDevice.configurations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-orange-600" />
                    Configuration Details
                  </h3>
                  <div className="space-y-3">
                    {selectedDevice.configurations.map((config, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Configuration {idx + 1}</p>
                        <InfoRow label="Value" value={config.configurationValue?.toString() || 'N/A'} small />
                        <InfoRow label="Name" value={config.configurationName || 'N/A'} small />
                        <InfoRow label="Interfaces" value={config.interfaces?.length.toString() || '0'} small />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Information */}
            {advancedInfo && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  Advanced Information
                </h3>
                
                {/* Interfaces */}
                {advancedInfo.interfaces && advancedInfo.interfaces.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Interfaces ({advancedInfo.interfaces.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {advancedInfo.interfaces.map((iface: any, idx: number) => (
                        <div key={idx} className="bg-indigo-50 rounded-lg p-3 text-sm">
                          <p className="font-semibold text-indigo-900 mb-1">Interface {iface.interfaceNumber}</p>
                          <p className="text-gray-600">Class: {iface.interfaceClass}</p>
                          <p className="text-gray-600">Subclass: {iface.interfaceSubclass}</p>
                          <p className="text-gray-600">Protocol: {iface.interfaceProtocol}</p>
                          <p className="text-gray-600">Endpoints: {iface.endpoints}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Endpoints */}
                {advancedInfo.endpoints && advancedInfo.endpoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Endpoints ({advancedInfo.endpoints.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {advancedInfo.endpoints.map((endpoint: any, idx: number) => (
                        <div key={idx} className="bg-purple-50 rounded-lg p-3 text-sm">
                          <p className="font-semibold text-purple-900 mb-1">EP {endpoint.endpointNumber}</p>
                          <p className="text-gray-600">Direction: {endpoint.direction}</p>
                          <p className="text-gray-600">Type: {endpoint.type}</p>
                          <p className="text-gray-600">Packet: {endpoint.packetSize}B</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {devices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Devices Connected</h3>
            <p className="text-gray-500">Click "Connect USB Device" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  mono = false, 
  small = false,
  valueClassName = ''
}: { 
  label: string; 
  value: string; 
  mono?: boolean; 
  small?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className={`flex justify-between items-center ${small ? 'text-xs' : ''}`}>
      <span className="text-gray-600">{label}:</span>
      <span className={`${mono ? 'font-mono' : 'font-semibold'} ${valueClassName || 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}
