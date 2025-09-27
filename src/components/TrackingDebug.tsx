'use client';

import { useState, useEffect } from 'react';
import { getAllBookings } from '@/lib/unified-booking-storage';

export default function TrackingDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bookings = getAllBookings();
      const info = {
        userAgent: navigator.userAgent,
        hasLocalStorage: typeof Storage !== 'undefined' && !!window.localStorage,
        bookingCount: bookings.length,
        bookingIds: bookings.map(b => b.trackingId),
        storageData: typeof window.localStorage !== 'undefined' ? 
          window.localStorage.getItem('its_bookings') : 'Not available'
      };
      setDebugInfo(info);
    }
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs opacity-50 hover:opacity-100"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-4 bg-black bg-opacity-90 text-white p-4 rounded-lg overflow-auto z-50 text-xs">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold">Tracking Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-white hover:text-red-400"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>User Agent:</strong>
          <div className="bg-gray-800 p-2 rounded mt-1 break-all">
            {debugInfo.userAgent}
          </div>
        </div>
        
        <div>
          <strong>LocalStorage Support:</strong> 
          <span className={debugInfo.hasLocalStorage ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasLocalStorage ? ' ✓ Available' : ' ✗ Not Available'}
          </span>
        </div>
        
        <div>
          <strong>Booking Count:</strong> {debugInfo.bookingCount}
        </div>
        
        <div>
          <strong>Available Tracking IDs:</strong>
          <div className="bg-gray-800 p-2 rounded mt-1">
            {debugInfo.bookingIds?.length > 0 ? (
              debugInfo.bookingIds.map((id: string, index: number) => (
                <div key={index} className="font-mono">{id}</div>
              ))
            ) : (
              <div className="text-yellow-400">No bookings found</div>
            )}
          </div>
        </div>
        
        <div>
          <strong>Raw Storage Data:</strong>
          <div className="bg-gray-800 p-2 rounded mt-1 max-h-40 overflow-auto">
            <pre>{debugInfo.storageData || 'No data'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}