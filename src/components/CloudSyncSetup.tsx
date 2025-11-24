'use client';
import React, { useState, useEffect } from 'react';
import { 
  getCloudSyncConfig, 
  saveCloudSyncConfig, 
  syncToCloud, 
  syncFromCloud,
  isCloudSyncConfigured,
  getSyncStatus,
  type CloudSyncConfig 
} from '../../lib/cloud-sync';

interface CloudSyncSetupProps {
  onSyncComplete?: () => void;
}

export default function CloudSyncSetup({ onSyncComplete }: CloudSyncSetupProps) {
  const [config, setConfig] = useState<CloudSyncConfig>({ enabled: false });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<any>({});
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const currentConfig = getCloudSyncConfig();
    setConfig(currentConfig);
    setSyncStatus(getSyncStatus());
  }, []);

  const handleConfigChange = (field: keyof CloudSyncConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveConfig = () => {
    try {
      saveCloudSyncConfig(config);
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setSyncStatus(getSyncStatus());
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving configuration' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const testCloudSync = async () => {
    setIsLoading(true);
    setMessage({ type: 'info', text: 'Testing cloud connection...' });

    try {
      // Try to fetch from cloud first (read-only test)
      const result = await syncFromCloud();
      
      if (result.success) {
        setMessage({ type: 'success', text: `Cloud sync test successful! ${result.message}` });
        setSyncStatus(getSyncStatus());
        if (onSyncComplete) onSyncComplete();
      } else {
        setMessage({ type: 'error', text: `Cloud sync test failed: ${result.message}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Cloud sync test failed: Network error' });
    }

    setIsLoading(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const manualSync = async (direction: 'up' | 'down') => {
    setIsLoading(true);
    
    try {
      if (direction === 'up') {
        // Get local bookings and push to cloud
        const bookings = JSON.parse(localStorage.getItem('its_bookings') || '[]');
        const result = await syncToCloud(bookings);
        setMessage({ 
          type: result.success ? 'success' : 'error', 
          text: result.message 
        });
      } else {
        // Pull from cloud
        const result = await syncFromCloud();
        if (result.success && result.data) {
          // Merge with local data
          const existingBookings = JSON.parse(localStorage.getItem('its_bookings') || '[]');
          const existingIds = new Set(existingBookings.map((b: any) => b.trackingId));
          const newBookings = result.data.filter((booking: any) => !existingIds.has(booking.trackingId));
          
          if (newBookings.length > 0) {
            const mergedBookings = [...existingBookings, ...newBookings];
            localStorage.setItem('its_bookings', JSON.stringify(mergedBookings));
            setMessage({ 
              type: 'success', 
              text: `Successfully synced ${newBookings.length} new bookings from cloud` 
            });
            if (onSyncComplete) onSyncComplete();
          } else {
            setMessage({ type: 'info', text: 'No new bookings to sync from cloud' });
          }
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
      setSyncStatus(getSyncStatus());
    } catch (error) {
      setMessage({ type: 'error', text: 'Manual sync failed: Network error' });
    }

    setIsLoading(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const scanAllDevices = async () => {
    setIsLoading(true);
    setMessage({ type: 'info', text: 'Scanning for bookings on all devices...' });
    
    try {
      // Force a comprehensive cloud pull
      const result = await syncFromCloud();
      if (result.success && result.data) {
        const existingBookings = JSON.parse(localStorage.getItem('its_bookings') || '[]');
        const existingIds = new Set(existingBookings.map((b: any) => b.trackingId));
        const newBookings = result.data.filter((booking: any) => !existingIds.has(booking.trackingId));
        
        if (newBookings.length > 0) {
          const mergedBookings = [...existingBookings, ...newBookings];
          localStorage.setItem('its_bookings', JSON.stringify(mergedBookings));
          setMessage({ 
            type: 'success', 
            text: `Found ${newBookings.length} bookings from other devices!` 
          });
          if (onSyncComplete) onSyncComplete();
        } else {
          setMessage({ 
            type: 'info', 
            text: 'No new bookings found. Mobile bookings might not be syncing to cloud yet.' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Could not access cloud data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Device scan failed: Network error' });
    }
    
    setIsLoading(false);
    setTimeout(() => setMessage(null), 8000);
  };

  const isConfigured = isCloudSyncConfigured();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Cloud Sync {isConfigured ? '✅' : '⚠️'}
        </h3>
        <button
          onClick={() => setShowSetup(!showSetup)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {showSetup ? 'Hide Setup' : 'Setup'}
        </button>
      </div>

      {/* Status Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="text-sm text-gray-600">
          <div>Status: {config.enabled ? 
            (isConfigured ? '🟢 Active' : '🟡 Configured but incomplete') : 
            '🔴 Disabled'
          }</div>
          {syncStatus.lastSyncUp && (
            <div>Last Upload: {new Date(syncStatus.lastSyncUp).toLocaleString()}</div>
          )}
          {syncStatus.lastSyncDown && (
            <div>Last Download: {new Date(syncStatus.lastSyncDown).toLocaleString()}</div>
          )}
        </div>
      </div>

      {/* Setup Form (collapsible) */}
      {showSetup && (
        <div className="space-y-4 mb-4 p-4 border border-gray-200 rounded-md">
          <div className="text-sm text-gray-600 mb-3">
            <p><strong>Setup Instructions:</strong></p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Go to <a href="https://gist.github.com" target="_blank" rel="noopener noreferrer" className="text-red-600 underline">GitHub Gist</a></li>
              <li>Create a new public gist with filename: <code className="bg-gray-100 px-1">its-bookings.json</code></li>
              <li>Add initial content: <code className="bg-gray-100 px-1">{`{"bookings":[],"lastUpdated":"","version":0}`}</code></li>
              <li>Copy the Gist ID from the URL (after /gist/)</li>
              <li>Create a GitHub personal access token with &quot;gist&quot; permission</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Gist ID
            </label>
            <input
              type="text"
              value={config.gistId || ''}
              onChange={(e) => handleConfigChange('gistId', e.target.value)}
              placeholder="e.g., abc123def456ghi789"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Access Token
            </label>
            <input
              type="password"
              value={config.accessToken || ''}
              onChange={(e) => handleConfigChange('accessToken', e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableSync"
              checked={config.enabled}
              onChange={(e) => handleConfigChange('enabled', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="enableSync" className="text-sm text-gray-700">
              Enable automatic cloud synchronization
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={saveConfig}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Save Configuration
            </button>
            <button
              onClick={testCloudSync}
              disabled={isLoading || !config.gistId}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Sync Controls */}
      {isConfigured && (
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => manualSync('up')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Syncing...' : '⬆️ Push to Cloud'}
          </button>
          <button
            onClick={() => manualSync('down')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Syncing...' : '⬇️ Pull from Cloud'}
          </button>
          <button
            onClick={scanAllDevices}
            disabled={isLoading}
            className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 transition-colors text-sm"
          >
            📱 Scan Devices
          </button>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-800' :
          message.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* How it works info */}
      {!showSetup && (
        <div className="mt-4 text-xs text-gray-500">
          <p><strong>How it works:</strong> Bookings are automatically synced to/from GitHub Gist. 
          When customers book on any device, data is pushed to cloud. 
          Admin panel automatically pulls new bookings on load.</p>
        </div>
      )}
    </div>
  );
}