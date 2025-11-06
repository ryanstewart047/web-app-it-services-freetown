'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsConfig {
  enabled: boolean;
  trackPageViews: boolean;
  trackClicks: boolean;
  trackFormInteractions: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
  sessionTimeout: number; // minutes
}

interface VisitorData {
  sessionId: string;
  timestamp: string;
  path: string;
  referrer: string;
  userAgent: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    screenResolution: string;
  };
  performance: {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
  };
  duration?: number;
}

class AnalyticsTracker {
  private config: AnalyticsConfig;
  private sessionId: string;
  private startTime: number;
  private lastActivity: number;
  private isInitialized: boolean = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      trackPageViews: true,
      trackClicks: true,
      trackFormInteractions: true,
      trackErrors: true,
      trackPerformance: true,
      sessionTimeout: 30,
      ...config
    };

    this.sessionId = this.getOrCreateSessionId();
    this.startTime = Date.now();
    this.lastActivity = Date.now();

    if (typeof window !== 'undefined' && this.config.enabled) {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;

    // Track page performance
    if (this.config.trackPerformance) {
      this.trackPerformance();
    }

    // Track errors
    if (this.config.trackErrors) {
      this.setupErrorTracking();
    }

    // Track user interactions
    if (this.config.trackClicks) {
      this.setupClickTracking();
    }

    // Track form interactions
    if (this.config.trackFormInteractions) {
      this.setupFormTracking();
    }

    // Setup session management
    this.setupSessionManagement();

    this.isInitialized = true;
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop' as const,
        browser: 'Unknown',
        os: 'Unknown',
        screenResolution: '0x0'
      };
    }

    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return {
      type: (isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop') as 'desktop' | 'mobile' | 'tablet',
      browser,
      os,
      screenResolution: `${screen.width}x${screen.height}`
    };
  }

  private async trackPerformance() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const performance = {
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            firstContentfulPaint: 0 // Will be set by paint observer
          };

          // Track the page view with performance data
          setTimeout(() => this.trackPageView(performance), 100);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Track First Contentful Paint
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          // Performance data will be included in page view tracking
        }
      }
    });

    paintObserver.observe({ entryTypes: ['paint'] });
  }

  private setupErrorTracking() {
    if (typeof window === 'undefined') return;

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        path: window.location.pathname,
        referrer: document.referrer,
        browserInfo: {
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          platform: navigator.platform
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandled',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        path: window.location.pathname,
        referrer: document.referrer,
        browserInfo: {
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          platform: navigator.platform
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    });
  }

  private setupClickTracking() {
    if (typeof window === 'undefined') return;

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const clickData = {
        timestamp: new Date().toISOString(),
        element: target.tagName.toLowerCase(),
        elementText: target.textContent?.slice(0, 100) || '',
        elementType: target.getAttribute('type') || '',
        path: window.location.pathname,
        sessionId: this.sessionId,
        coordinates: { x: event.clientX, y: event.clientY }
      };

      this.sendData('/api/analytics/interactions', clickData);
    });
  }

  private trackedForms = new Set<string>();

  private setupFormTracking() {
    if (typeof window === 'undefined') return;

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      
      // Skip tracking if form has data-no-analytics attribute
      if (form.getAttribute('data-no-analytics') === 'true') {
        console.log('[Analytics] Skipping form (data-no-analytics)');
        return;
      }
      
      // CRITICAL FIX: Only track forms with explicit data-form-type
      // This prevents tracking admin forms, login forms, and internal forms
      const formType = form.getAttribute('data-form-type');
      if (!formType || formType === 'unknown') {
        console.log('[Analytics] Skipping form (no data-form-type attribute)');
        return;
      }
      
      // Additional security: Skip admin and internal forms by URL
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin') || 
          currentPath.includes('/receipt') || 
          currentPath.includes('/track-repair')) {
        console.log('[Analytics] Skipping form (admin/internal path)');
        return;
      }
      
      const formData = new FormData(form);
      const fields: Record<string, any> = {};

      formData.forEach((value, key) => {
        fields[key] = value;
      });
      
      // Validate that we have actual data before tracking
      const hasData = Object.values(fields).some(value => 
        value && value.toString().trim().length > 0
      );
      
      if (!hasData) {
        console.log('[Analytics] Skipping empty form submission');
        return;
      }

      console.log('[Analytics] Tracking form submission:', formType);
      this.trackFormSubmission({
        formType,
        fields,
        success: true,
        completionTime: Date.now() - this.startTime,
        sessionId: this.sessionId,
        referrer: document.referrer
      });
    });

    // Track form view ONCE per form per session (on first interaction)
    // This prevents excessive API calls while still tracking engagement
    document.addEventListener('focusin', (event) => {
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement || 
          event.target instanceof HTMLSelectElement) {
        const form = event.target.closest('form');
        if (form) {
          // Skip tracking if form has data-no-analytics attribute
          if (form.getAttribute('data-no-analytics') === 'true') {
            return;
          }
          
          const formType = form.getAttribute('data-form-type');
          
          // Only track if:
          // 1. Form has a data-form-type attribute (intentional tracking)
          // 2. We haven't tracked this form type in this session yet
          // 3. Form type is not "unknown"
          if (formType && formType !== 'unknown' && !this.trackedForms.has(formType)) {
            this.trackedForms.add(formType);
            this.sendData('/api/analytics/forms', { formType }, 'PUT');
          }
        }
      }
    }, { once: false });
  }

  private setupSessionManagement() {
    if (typeof window === 'undefined') return;

    // Update last activity timestamp
    ['click', 'scroll', 'keypress', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.lastActivity = Date.now();
      }, { passive: true });
    });

    // Check for session timeout
    setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      const timeoutMs = this.config.sessionTimeout * 60 * 1000;
      
      if (timeSinceLastActivity > timeoutMs) {
        // Session expired, create new session
        this.sessionId = this.getOrCreateSessionId();
        this.startTime = Date.now();
        this.lastActivity = Date.now();
      }
    }, 60000); // Check every minute
  }

  public trackPageView(performance?: any) {
    if (!this.config.trackPageViews || typeof window === 'undefined') return;

    console.log('[Analytics] Tracking page view:', window.location.pathname);

    const visitorData: VisitorData = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      device: this.getDeviceInfo(),
      performance: performance || {
        loadTime: 0,
        domContentLoaded: 0,
        firstContentfulPaint: 0
      }
    };

    console.log('[Analytics] Sending visitor data:', visitorData);
    this.sendData('/api/analytics/visitor', visitorData);
  }

  public trackFormSubmission(data: any) {
    if (!this.config.trackFormInteractions) return;
    this.sendData('/api/analytics/forms', data);
  }

  public trackError(errorData: any) {
    if (!this.config.trackErrors) return;
    this.sendData('/api/analytics/errors', {
      ...errorData,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  public trackCustomEvent(eventName: string, data: any) {
    this.sendData('/api/analytics/events', {
      eventName,
      data,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      path: typeof window !== 'undefined' ? window.location.pathname : ''
    });
  }

  private async sendData(endpoint: string, data: any, method: string = 'POST') {
    if (typeof window === 'undefined') return;

    try {
      // Send to API endpoint for server-side tracking
      await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Also store in localStorage as backup
      const dataType = endpoint.split('/').pop() || 'general';
      const storageKey = `analytics_${dataType}`;
      
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existing.push({
        ...data,
        timestamp: new Date().toISOString(),
        method
      });
      
      // Keep only the latest 1000 entries per type
      if (existing.length > 1000) {
        existing.splice(0, existing.length - 1000);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existing));
      
      // Update aggregate counters
      if (dataType === 'visitor') {
        const totalVisitors = parseInt(localStorage.getItem('totalVisitors') || '0') + 1;
        localStorage.setItem('totalVisitors', totalVisitors.toString());
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  public destroy() {
    this.isInitialized = false;
    // Clean up event listeners would go here
  }
}

// Global analytics instance
let analyticsInstance: AnalyticsTracker | null = null;

export function useAnalytics(config?: Partial<AnalyticsConfig>) {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized.current) {
      analyticsInstance = new AnalyticsTracker(config);
      initialized.current = true;
    }

    return () => {
      if (analyticsInstance) {
        analyticsInstance.destroy();
        analyticsInstance = null;
      }
    };
  }, []);

  useEffect(() => {
    if (analyticsInstance && pathname) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        if (analyticsInstance) {
          analyticsInstance.trackPageView();
        }
      }, 100);
    }
  }, [pathname]);

  return {
    trackEvent: (eventName: string, data: any) => {
      analyticsInstance?.trackCustomEvent(eventName, data);
    },
    trackFormSubmission: (data: any) => {
      analyticsInstance?.trackFormSubmission(data);
    },
    trackError: (errorData: any) => {
      analyticsInstance?.trackError(errorData);
    }
  };
}

// Analytics Provider Component
export function AnalyticsProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode;
  config?: Partial<AnalyticsConfig>;
}) {
  useAnalytics(config);
  return <>{children}</>;
}

// Export the tracker class for advanced usage
export { AnalyticsTracker };
export type { AnalyticsConfig, VisitorData };