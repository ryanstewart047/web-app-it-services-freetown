// Global Analytics Tracker for IT Services Freetown
// This script should be included on all pages to track user activity

(function() {
  'use strict';

  // Initialize tracking only once
  if (window.ITSAnalyticsLoaded) return;
  window.ITSAnalyticsLoaded = true;

  // Generate or get user ID
  function getUserId() {
    let userId = localStorage.getItem('its_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('its_user_id', userId);
    }
    return userId;
  }

  // Get session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('its_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('its_session_id', sessionId);
    }
    return sessionId;
  }

  // Analytics class
  function Analytics() {
    this.userId = getUserId();
    this.sessionId = getSessionId();
    
    // Initialize tracking data structure
    this.initializeStorage();
    
    // Start tracking
    this.startTracking();
  }

  Analytics.prototype.initializeStorage = function() {
    const keys = ['its_page_views', 'its_errors', 'its_form_submissions', 'its_performance'];
    
    keys.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  };

  Analytics.prototype.trackPageView = function() {
    try {
      const pageViews = JSON.parse(localStorage.getItem('its_page_views') || '[]');
      
      const pageView = {
        id: 'pv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: this.userId,
        sessionId: this.sessionId,
        page: window.location.pathname,
        title: document.title,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screen: {
          width: screen.width,
          height: screen.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
      
      pageViews.push(pageView);
      
      // Keep only last 1000 page views to prevent storage overflow
      if (pageViews.length > 1000) {
        pageViews.splice(0, pageViews.length - 1000);
      }
      
      localStorage.setItem('its_page_views', JSON.stringify(pageViews));
      
      console.log('📊 Page view tracked:', pageView.page);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  };

  Analytics.prototype.trackError = function(error, context = {}) {
    try {
      const errors = JSON.parse(localStorage.getItem('its_errors') || '[]');
      
      const errorEvent = {
        id: 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: this.userId,
        sessionId: this.sessionId,
        page: window.location.pathname,
        message: error.message || error,
        stack: error.stack || '',
        timestamp: new Date().toISOString(),
        context: context
      };
      
      errors.push(errorEvent);
      
      // Keep only last 500 errors
      if (errors.length > 500) {
        errors.splice(0, errors.length - 500);
      }
      
      localStorage.setItem('its_errors', JSON.stringify(errors));
      
      console.log('❌ Error tracked:', errorEvent.message);
    } catch (e) {
      console.error('Failed to track error:', e);
    }
  };

  Analytics.prototype.trackFormSubmission = function(formId, formData = {}) {
    try {
      const submissions = JSON.parse(localStorage.getItem('its_form_submissions') || '[]');
      
      const submission = {
        id: 'form_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: this.userId,
        sessionId: this.sessionId,
        page: window.location.pathname,
        formId: formId,
        timestamp: new Date().toISOString(),
        data: formData
      };
      
      submissions.push(submission);
      
      // Keep only last 200 submissions
      if (submissions.length > 200) {
        submissions.splice(0, submissions.length - 200);
      }
      
      localStorage.setItem('its_form_submissions', JSON.stringify(submissions));
      
      console.log('📝 Form submission tracked:', formId);
    } catch (error) {
      console.error('Failed to track form submission:', error);
    }
  };

  Analytics.prototype.trackPerformance = function() {
    try {
      if (!window.performance || !window.performance.timing) return;
      
      const performance = JSON.parse(localStorage.getItem('its_performance') || '[]');
      
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      
      const performanceData = {
        id: 'perf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: this.userId,
        sessionId: this.sessionId,
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        loadTime: loadTime,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: this.getFirstPaint(),
        coreWebVitals: this.getCoreWebVitals()
      };
      
      performance.push(performanceData);
      
      // Keep only last 200 performance metrics
      if (performance.length > 200) {
        performance.splice(0, performance.length - 200);
      }
      
      localStorage.setItem('its_performance', JSON.stringify(performance));
      
      console.log('⚡ Performance tracked:', loadTime + 'ms');
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  };

  Analytics.prototype.getFirstPaint = function() {
    try {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    } catch (error) {
      return null;
    }
  };

  Analytics.prototype.getCoreWebVitals = function() {
    const vitals = { lcp: null, fid: null, cls: null };
    
    try {
      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.lcp = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime;
            }
          });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
      }
    } catch (error) {
      console.log('Core Web Vitals not available');
    }
    
    return vitals;
  };

  Analytics.prototype.startTracking = function() {
    // Track initial page view
    this.trackPageView();
    
    // Track performance when page is loaded
    if (document.readyState === 'complete') {
      setTimeout(() => this.trackPerformance(), 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.trackPerformance(), 1000);
      });
    }
    
    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: 'Unhandled Promise Rejection: ' + event.reason,
        stack: event.reason?.stack || ''
      });
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        const formId = form.id || form.className || 'unknown-form';
        const formData = {};
        
        // Safely extract non-sensitive form data
        try {
          const formDataObj = new FormData(form);
          for (let [key, value] of formDataObj.entries()) {
            // Only track non-sensitive fields
            if (!key.toLowerCase().includes('password') && 
                !key.toLowerCase().includes('token') &&
                !key.toLowerCase().includes('secret')) {
              formData[key] = typeof value === 'string' ? value.substring(0, 100) : 'file';
            }
          }
        } catch (e) {
          formData.error = 'Could not extract form data';
        }
        
        this.trackFormSubmission(formId, formData);
      }
    });
    
    // Track page changes for SPAs
    let currentPath = window.location.pathname;
    setInterval(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    }, 1000);
  };

  // Initialize analytics
  const analytics = new Analytics();
  
  // Expose for manual tracking
  window.ITSAnalytics = {
    trackPageView: () => analytics.trackPageView(),
    trackError: (error, context) => analytics.trackError(error, context),
    trackFormSubmission: (formId, data) => analytics.trackFormSubmission(formId, data),
    trackCustomEvent: (eventName, data) => {
      try {
        const events = JSON.parse(localStorage.getItem('its_custom_events') || '[]');
        const event = {
          id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          userId: analytics.userId,
          sessionId: analytics.sessionId,
          page: window.location.pathname,
          eventName: eventName,
          data: data,
          timestamp: new Date().toISOString()
        };
        events.push(event);
        if (events.length > 300) {
          events.splice(0, events.length - 300);
        }
        localStorage.setItem('its_custom_events', JSON.stringify(events));
        console.log('🎯 Custom event tracked:', eventName);
      } catch (error) {
        console.error('Failed to track custom event:', error);
      }
    }
  };

  console.log('🚀 IT Services Analytics initialized');

})();