'use client';

import { useState } from 'react';
import { Download, Apple, Windows, Linux } from 'lucide-react';

export default function DownloadAppPage() {
  const [selectedOS, setSelectedOS] = useState('windows');
  const [downloadError, setDownloadError] = useState('');
  const [downloadingFile, setDownloadingFile] = useState('');

  const downloadLinks = {
    windows: [
      { name: 'Windows Installer', file: 'IT.Services.Device.Detector.Setup.1.1.0.exe', size: '73.4 MB' },
      { name: 'Windows Portable', file: 'IT.Services.Device.Detector.1.1.0.exe', size: '73.1 MB' },
    ],
    mac: [
      { name: 'macOS (Intel)', file: 'IT.Services.Device.Detector-1.1.0-x64.dmg', size: 'Coming soon' },
      { name: 'macOS (Apple Silicon)', file: 'IT.Services.Device.Detector-1.1.0-arm64.dmg', size: 'Coming soon' },
    ],
    linux: [
      { name: 'Linux AppImage', file: 'IT.Services.Device.Detector-1.1.0.AppImage', size: 'Coming soon' },
      { name: 'Linux Debian', file: 'it-services-device-detector_1.1.0_amd64.deb', size: 'Coming soon' },
    ],
  };

  const handleDownload = async (fileName) => {
    setDownloadingFile(fileName);
    setDownloadError('');
    
    try {
      const url = `https://github.com/ryanstewart047/web-app-it-services-freetown/releases/download/v1.1.0/${fileName}`;
      
      // Check if the release exists
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok || response.status === 302 || response.status === 301) {
        // File found, open in new tab
        window.open(url, '_blank');
      } else if (response.status === 404) {
        setDownloadError('Release files are not yet available. Please check back soon or contact support.');
      } else {
        setDownloadError('Error downloading file. Please try again later.');
      }
    } catch (error) {
      setDownloadError('Release files are being prepared. Please check back soon or contact support at support@itservicesfreetown.com');
    } finally {
      setDownloadingFile('');
    }
  };

  const currentOS = downloadLinks[selectedOS];
  const platforms = [
    { id: 'windows', label: 'Windows', icon: Windows, color: 'text-blue-600' },
    { id: 'mac', label: 'macOS', icon: Apple, color: 'text-gray-900' },
    { id: 'linux', label: 'Linux', icon: Linux, color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Download Our App</h1>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setSelectedOS(id)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedOS === id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <Icon className={`w-10 h-10 mx-auto mb-3 ${color}`} />
                <p className="font-semibold text-gray-900">{label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Available Downloads</h3>
          
          {downloadError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">{downloadError}</p>
            </div>
          )}
          
          <div className="space-y-3">
            {currentOS.map((version, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">{version.name}</p>
                  <p className="text-sm text-gray-500">{version.size}</p>
                </div>
                <button
                  onClick={() => handleDownload(version.file)}
                  disabled={downloadingFile === version.file}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                    downloadingFile === version.file
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-[#040e40] text-white hover:from-red-700 hover:to-[#0a1a5c]'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {downloadingFile === version.file ? 'Downloading...' : 'Download'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Need help?</strong> Contact us at <a href="mailto:support@itservicesfreetown.com" className="text-blue-600 hover:underline">support@itservicesfreetown.com</a> or call <a href="tel:+23233399391" className="text-blue-600 hover:underline">+232 33 399391</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
