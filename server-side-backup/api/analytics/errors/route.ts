import { NextRequest, NextResponse } from 'next/server';

interface ErrorReport {
  id: string;
  timestamp: string;
  type: 'javascript' | 'network' | 'console' | 'unhandled';
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  userAgent: string;
  sessionId: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: {
    path: string;
    referrer: string;
    timestamp: string;
    browserInfo: {
      language: string;
      cookieEnabled: boolean;
      onLine: boolean;
      platform: string;
    };
    viewport: {
      width: number;
      height: number;
    };
    performance: {
      memoryUsage?: number;
      connectionType?: string;
    };
  };
  resolved: boolean;
  resolutionNotes?: string;
}

interface ErrorAnalytics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
    affectedUsers: number;
  }>;
  errorTrends: Array<{
    date: string;
    count: number;
  }>;
  browserErrors: Record<string, number>;
  pageErrors: Record<string, number>;
  resolvedErrors: number;
  pendingErrors: number;
}

// In-memory storage
const errorReports: ErrorReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const errorReport: ErrorReport = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      type: data.type || 'javascript',
      message: data.message,
      stack: data.stack,
      url: data.url,
      lineNumber: data.lineNumber,
      columnNumber: data.columnNumber,
      userAgent: request.headers.get('user-agent') || '',
      sessionId: data.sessionId,
      userId: data.userId,
      severity: determineSeverity(data),
      context: {
        path: data.path || '',
        referrer: data.referrer || '',
        timestamp: data.timestamp || new Date().toISOString(),
        browserInfo: data.browserInfo || {},
        viewport: data.viewport || { width: 0, height: 0 },
        performance: data.performance || {}
      },
      resolved: false
    };
    
    errorReports.push(errorReport);
    
    // Keep only last 2,000 error reports
    if (errorReports.length > 2000) {
      errorReports.splice(0, errorReports.length - 2000);
    }
    
    // Log critical errors
    if (errorReport.severity === 'critical') {
      console.error('CRITICAL ERROR REPORTED:', {
        message: errorReport.message,
        path: errorReport.context.path,
        sessionId: errorReport.sessionId
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      errorId: errorReport.id,
      severity: errorReport.severity
    });
  } catch (error) {
    console.error('Error recording error report:', error);
    return NextResponse.json({ error: 'Failed to record error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let filteredErrors = errorReports.filter(
      error => new Date(error.timestamp) >= startDate
    );
    
    if (severity) {
      filteredErrors = filteredErrors.filter(error => error.severity === severity);
    }
    
    if (resolved !== null) {
      const isResolved = resolved === 'true';
      filteredErrors = filteredErrors.filter(error => error.resolved === isResolved);
    }
    
    const analytics: ErrorAnalytics = {
      totalErrors: filteredErrors.length,
      errorsByType: getErrorsByType(filteredErrors),
      errorsBySeverity: getErrorsBySeverity(filteredErrors),
      topErrors: getTopErrors(filteredErrors),
      errorTrends: getErrorTrends(filteredErrors, days),
      browserErrors: getBrowserErrors(filteredErrors),
      pageErrors: getPageErrors(filteredErrors),
      resolvedErrors: filteredErrors.filter(e => e.resolved).length,
      pendingErrors: filteredErrors.filter(e => !e.resolved).length
    };
    
    const response = {
      analytics,
      recentErrors: filteredErrors.slice(-50).reverse(),
      criticalErrors: filteredErrors.filter(e => e.severity === 'critical' && !e.resolved),
      errorResolutionRate: filteredErrors.length > 0 ? 
        (analytics.resolvedErrors / filteredErrors.length * 100).toFixed(1) : '0'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching error analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { errorId, resolved, resolutionNotes } = await request.json();
    
    const errorIndex = errorReports.findIndex(error => error.id === errorId);
    if (errorIndex === -1) {
      return NextResponse.json({ error: 'Error not found' }, { status: 404 });
    }
    
    errorReports[errorIndex].resolved = resolved;
    if (resolutionNotes) {
      errorReports[errorIndex].resolutionNotes = resolutionNotes;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Error status updated' 
    });
  } catch (error) {
    console.error('Error updating error status:', error);
    return NextResponse.json({ error: 'Failed to update error' }, { status: 500 });
  }
}

function generateId(): string {
  return 'err_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function determineSeverity(data: any): 'low' | 'medium' | 'high' | 'critical' {
  const message = data.message?.toLowerCase() || '';
  
  // Critical errors
  if (message.includes('chunk') && message.includes('failed') ||
      message.includes('network') && message.includes('error') ||
      message.includes('uncaught') && message.includes('exception') ||
      data.type === 'unhandled') {
    return 'critical';
  }
  
  // High severity
  if (message.includes('payment') ||
      message.includes('booking') ||
      message.includes('form') && message.includes('submit') ||
      message.includes('authentication')) {
    return 'high';
  }
  
  // Medium severity
  if (message.includes('api') ||
      message.includes('fetch') ||
      message.includes('async') ||
      data.type === 'network') {
    return 'medium';
  }
  
  return 'low';
}

function getErrorsByType(errors: ErrorReport[]) {
  const typeCount = new Map<string, number>();
  errors.forEach(error => {
    typeCount.set(error.type, (typeCount.get(error.type) || 0) + 1);
  });
  
  return Object.fromEntries(typeCount);
}

function getErrorsBySeverity(errors: ErrorReport[]) {
  const severityCount = new Map<string, number>();
  errors.forEach(error => {
    severityCount.set(error.severity, (severityCount.get(error.severity) || 0) + 1);
  });
  
  return Object.fromEntries(severityCount);
}

function getTopErrors(errors: ErrorReport[]) {
  const errorCount = new Map<string, {
    count: number;
    lastOccurred: string;
    users: Set<string>;
  }>();
  
  errors.forEach(error => {
    const key = error.message;
    const existing = errorCount.get(key);
    
    if (existing) {
      existing.count++;
      existing.users.add(error.sessionId);
      if (new Date(error.timestamp) > new Date(existing.lastOccurred)) {
        existing.lastOccurred = error.timestamp;
      }
    } else {
      errorCount.set(key, {
        count: 1,
        lastOccurred: error.timestamp,
        users: new Set([error.sessionId])
      });
    }
  });
  
  return Array.from(errorCount.entries())
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 10)
    .map(([message, data]) => ({
      message,
      count: data.count,
      lastOccurred: data.lastOccurred,
      affectedUsers: data.users.size
    }));
}

function getErrorTrends(errors: ErrorReport[], days: number) {
  const dateCount = new Map<string, number>();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateCount.set(dateStr, 0);
  }
  
  errors.forEach(error => {
    const dateStr = error.timestamp.split('T')[0];
    if (dateCount.has(dateStr)) {
      dateCount.set(dateStr, dateCount.get(dateStr)! + 1);
    }
  });
  
  return Array.from(dateCount.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function getBrowserErrors(errors: ErrorReport[]) {
  const browserCount = new Map<string, number>();
  
  errors.forEach(error => {
    const userAgent = error.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    browserCount.set(browser, (browserCount.get(browser) || 0) + 1);
  });
  
  return Object.fromEntries(browserCount);
}

function getPageErrors(errors: ErrorReport[]) {
  const pageCount = new Map<string, number>();
  
  errors.forEach(error => {
    const path = error.context.path || error.url;
    pageCount.set(path, (pageCount.get(path) || 0) + 1);
  });
  
  return Object.fromEntries(
    Array.from(pageCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  );
}