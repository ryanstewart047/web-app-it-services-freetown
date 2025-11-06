'use client';

import { useState, useEffect } from 'react';
import AppointmentStatus from '@/components/AppointmentStatus';
import TrackingDebug from '@/components/TrackingDebug';
import { usePageLoader } from '@/hooks/usePageLoader';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function TrackRepair() {
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 1400
  });
  
  const [trackingId, setTrackingId] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(true);

  // Check browser support for localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasLocalStorage = typeof Storage !== 'undefined' && !!window.localStorage;
      setBrowserSupport(hasLocalStorage);
      
      if (!hasLocalStorage) {
        console.warn('localStorage not supported on this device/browser');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (trackingId.trim()) {
      // Add mobile debugging
      console.log('Submitting tracking ID:', trackingId);
      console.log('localStorage available:', typeof Storage !== 'undefined');
      console.log('User agent:', navigator.userAgent);
      
      setShowStatus(true);
    }
  };

  const resetSearch = () => {
    setTrackingId('');
    setShowStatus(false);
  };

  if (isLoading) {
    return <LoadingOverlay progress={progress} variant="modern" />;
  }

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #040e40 100%)'}}>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <i className="fas fa-search text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
            Track Your Repair
          </h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
            Enter your tracking ID to see real-time updates on your device repair status
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {!showStatus ? (
            /* Search Form */
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{background: '#040e40'}}>
                  <i className="fas fa-clipboard-list text-white text-xl"></i>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Repair</h2>
                <p className="text-gray-600">Enter the tracking ID we provided when you booked your appointment</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" data-no-analytics="true">
                {/* Browser Support Warning */}
                {!browserSupport && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="text-yellow-800 font-semibold text-sm">Browser Compatibility Issue</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          Your browser may have limited support for tracking data storage. If you experience issues, 
                          try using a different browser or enabling JavaScript/cookies.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="trackingId" className="block text-sm font-semibold text-gray-700 mb-3">
                    <i className="fas fa-hashtag mr-2" style={{color: '#040e40'}}></i>
                    Tracking ID *
                  </label>
                  <input
                    type="text"
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all duration-300 text-lg placeholder-gray-400 font-mono"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#040e40';
                      e.target.style.boxShadow = '0 0 0 4px rgba(4, 14, 64, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Enter tracking ID (e.g., ITS-250926-1234)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Your tracking ID was provided via SMS or email when you booked
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center text-lg"
                  style={{background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)'}}
                >
                  <i className="fas fa-search mr-3"></i>
                  Track My Repair
                </button>
              </form>

              {/* Demo Tracking IDs */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-3">
                  <i className="fas fa-flask mr-2 text-blue-500"></i>
                  Try Demo Tracking IDs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setTrackingId('ITS-250926-1001')}
                    className="text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-300 border"
                  >
                    <div className="font-mono text-sm text-blue-600">ITS-250926-1001</div>
                    <div className="text-xs text-gray-600">iPhone 14 Screen Repair</div>
                  </button>
                  <button
                    onClick={() => setTrackingId('ITS-250926-1002')}
                    className="text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-300 border"
                  >
                    <div className="font-mono text-sm text-blue-600">ITS-250926-1002</div>
                    <div className="text-xs text-gray-600">MacBook Pro Diagnosis</div>
                  </button>
                  <button
                    onClick={() => setTrackingId('ITS-250926-1003')}
                    className="text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-300 border"
                  >
                    <div className="font-mono text-sm text-blue-600">ITS-250926-1003</div>
                    <div className="text-xs text-gray-600">Samsung Galaxy Repair</div>
                  </button>
                  <button
                    onClick={() => setTrackingId('ITS-250926-1004')}
                    className="text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-300 border"
                  >
                    <div className="font-mono text-sm text-blue-600">ITS-250926-1004</div>
                    <div className="text-xs text-gray-600">Dell Laptop Hardware Fix</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Status Display */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={resetSearch}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Search Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-300"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh Status
                </button>
              </div>
              
              <AppointmentStatus trackingId={trackingId} />
            </div>
          )}

          {/* Information Cards */}
          {/* ...existing code... */}
        </div>
      </div>

      {/* Debug Component for Mobile Testing */}
      <TrackingDebug />
    </>
  );
}
