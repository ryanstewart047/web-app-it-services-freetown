'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppointmentStatus from '@/components/AppointmentStatus';
import TrackingDebug from '@/components/TrackingDebug';
import { usePageLoader } from '@/hooks/usePageLoader';
import LoadingOverlay from '@/components/LoadingOverlay';
import PageBanner from '@/components/PageBanner';

const SESSION_KEY = 'its_track_session';
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function getSession(): { trackingId: string; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 5 minutes of inactivity
    if (Date.now() - data.timestamp > IDLE_TIMEOUT) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function saveSession(trackingId: string) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ trackingId, timestamp: Date.now() })); } catch {}
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

export default function TrackRepair() {
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 1400
  });
  
  const [trackingId, setTrackingId] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [browserSupport, setBrowserSupport] = useState(true);
  const lastActivityRef = useRef(Date.now());

  // Restore session on mount & setup inactivity timer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasLocalStorage = typeof Storage !== 'undefined' && !!window.localStorage;
    setBrowserSupport(hasLocalStorage);
    if (!hasLocalStorage) {
      console.warn('localStorage not supported on this device/browser');
    }

    // Restore previous session if still valid
    const session = getSession();
    if (session) {
      setTrackingId(session.trackingId);
      setShowStatus(true);
    }

    // Track user activity for idle timeout
    const touchActivity = () => {
      lastActivityRef.current = Date.now();
      // Keep session timestamp fresh while user is active
      const s = getSession();
      if (s) saveSession(s.trackingId);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, touchActivity, { passive: true }));

    // Check idle every 30 seconds
    const idleCheck = setInterval(() => {
      if (Date.now() - lastActivityRef.current > IDLE_TIMEOUT && showStatus) {
        clearSession();
        setShowStatus(false);
        setTrackingId('');
      }
    }, 30_000);

    return () => {
      events.forEach(e => document.removeEventListener(e, touchActivity));
      clearInterval(idleCheck);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (trackingId.trim()) {
      console.log('Submitting tracking ID:', trackingId);
      saveSession(trackingId.trim());
      setShowStatus(true);
      setRefreshKey(k => k + 1);
    }
  };

  const resetSearch = () => {
    clearSession();
    setTrackingId('');
    setShowStatus(false);
  };

  const handleRefresh = () => {
    // Re-mount AppointmentStatus to re-fetch data — keeps tracking ID intact
    setRefreshKey(k => k + 1);
    // Touch session timestamp
    if (trackingId) saveSession(trackingId);
  };

  if (isLoading) {
    return <LoadingOverlay progress={progress} variant="modern" />;
  }

  return (
    <>
      {/* Hero Section */}
      <PageBanner
        title="Track Your Repair"
        subtitle="Enter your tracking ID to see real-time updates on your device repair status"
        icon="fas fa-search"
      />

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
                  onClick={handleRefresh}
                  className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-300"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh Status
                </button>
              </div>
              
              <AppointmentStatus key={refreshKey} trackingId={trackingId} />
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
