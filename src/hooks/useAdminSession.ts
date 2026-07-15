import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseAdminSessionOptions {
  idleTimeout?: number; // in milliseconds
  warningTime?: number; // in milliseconds before timeout to show warning
  onIdle?: () => void;
  onWarning?: () => void;
}

/**
 * Hook to manage admin session with auto-logout on inactivity
 * @param options Configuration options
 * @returns Object with session state and controls
 */
export function useAdminSession(options: UseAdminSessionOptions = {}) {
  const {
    idleTimeout = 5 * 60 * 1000, // 5 minutes default
    warningTime = 30 * 1000, // 30 seconds warning default
    onIdle,
    onWarning
  } = options;

  const router = useRouter();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowIdleWarning(false);
    };

    // Track user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity every 10 seconds
    const idleCheckInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      if (timeSinceLastActivity >= idleTimeout) {
        // Auto-logout
        console.log('[Admin Session] Auto-logout due to inactivity');
        setIsActive(false);
        
        if (onIdle) {
          onIdle();
        } else {
          // Default behavior: clear session and redirect
          handleAutoLogout();
        }
      } else if (timeSinceLastActivity >= idleTimeout - warningTime && !showIdleWarning) {
        // Show warning
        setShowIdleWarning(true);
        if (onWarning) {
          onWarning();
        }
      }
    }, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(idleCheckInterval);
    };
  }, [lastActivity, showIdleWarning, idleTimeout, warningTime, onIdle, onWarning]);

  const handleAutoLogout = () => {
    // Clear any admin session data
    if (typeof window !== 'undefined') {
      // Clear sessionStorage
      sessionStorage.removeItem('admin_authenticated');
      sessionStorage.removeItem('admin_session');
      
      // Clear any auth cookies by calling the logout endpoint
      fetch('/api/admin/auth', { method: 'DELETE' }).catch(console.error);
    }
    
    // Show alert and redirect
    alert('Session expired due to inactivity. Please log in again.');
    router.push('/admin');
    router.refresh();
  };

  const resetSession = () => {
    setLastActivity(Date.now());
    setShowIdleWarning(false);
    setIsActive(true);
  };

  const getRemainingTime = () => {
    const elapsed = Date.now() - lastActivity;
    const remaining = Math.max(0, idleTimeout - elapsed);
    return Math.floor(remaining / 1000); // Return in seconds
  };

  return {
    isActive,
    showIdleWarning,
    lastActivity,
    resetSession,
    getRemainingTime,
    handleAutoLogout
  };
}
