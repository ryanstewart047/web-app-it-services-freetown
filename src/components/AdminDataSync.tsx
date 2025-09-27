'use client';

import { useState } from 'react';
import { exportBookingsData, importBookingsData } from '@/lib/unified-booking-storage';

interface DataSyncProps {
  onSyncComplete: () => void;
}

export default function AdminDataSync({ onSyncComplete }: DataSyncProps) {
  const [showSync, setShowSync] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const data = exportBookingsData();
    setExportData(data);
    setMessage('Data exported successfully! Copy this data to share between devices.');
  };

  const handleImport = () => {
    if (!importData.trim()) {
      setMessage('Please paste data to import');
      return;
    }

    const result = importBookingsData(importData);
    setMessage(result.message);
    
    if (result.success && result.importedCount > 0) {
      setImportData('');
      onSyncComplete();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
    setMessage('Data copied to clipboard!');
  };

  if (!showSync) {
    return (
      <button
        onClick={() => setShowSync(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center text-sm"
      >
        <i className="fas fa-sync-alt mr-2"></i>
        Sync Data
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Data Synchronization</h3>
          <button
            onClick={() => setShowSync(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              Cross-Device Data Sync
            </h4>
            <p className="text-blue-700 text-sm">
              Use this tool to sync booking data between devices. Export data from one device 
              and import it on another to see all bookings in your admin panel.
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('Error') || message.includes('Invalid') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Export Data</h4>
            <p className="text-sm text-gray-600">
              Export booking data from this device to share with other devices.
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
            >
              <i className="fas fa-download mr-2"></i>
              Export Bookings
            </button>
            
            {exportData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Exported Data (copy this):
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                  >
                    <i className="fas fa-copy mr-1"></i>Copy
                  </button>
                </div>
                <textarea
                  value={exportData}
                  readOnly
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
              </div>
            )}
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Import Data</h4>
            <p className="text-sm text-gray-600">
              Paste exported data from another device to merge bookings.
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste exported data here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
            />
            <button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
            >
              <i className="fas fa-upload mr-2"></i>
              Import Bookings
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              <i className="fas fa-lightbulb mr-2"></i>
              How to Use
            </h4>
            <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
              <li>On the device with bookings: Click "Export Bookings"</li>
              <li>Copy the exported data</li>
              <li>On the admin device: Paste data in "Import Data" section</li>
              <li>Click "Import Bookings" to merge the data</li>
              <li>Refresh the admin dashboard to see all bookings</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}