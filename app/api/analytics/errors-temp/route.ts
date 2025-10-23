import { NextRequest, NextResponse } from 'next/server';

interface ErrorRecord {
  id: string;
  message: string;
  stack: string;
  page: string;
  userAgent: string;
  userId: string;
  severity: string;
  timestamp: string;
  status: 'pending' | 'resolved';
  count?: number;
}

interface ErrorAnalyticsState {
  errors: ErrorRecord[];
  errorCounts: Map<string, number>;
  affectedUsers: Map<string, Set<string>>;
}

// In-memory storage for error analytics
const errorAnalytics: ErrorAnalyticsState = {
  errors: [],
  errorCounts: new Map(),
  affectedUsers: new Map(),
};

export async function GET() {
  try {
    const totalErrors = errorAnalytics.errors.length;
  const resolvedErrors = errorAnalytics.errors.filter((error) => error.status === 'resolved').length;
    const pendingErrors = totalErrors - resolvedErrors;

    // Top errors by frequency
    const topErrors = Array.from(errorAnalytics.errorCounts.entries())
      .map(([message, count]) => ({
        message,
        count,
  affectedUsers: errorAnalytics.affectedUsers.get(message)?.size ?? 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Critical errors (recent high-impact errors)
    const criticalErrors = errorAnalytics.errors
      .filter((error) => error.severity === 'critical' || (error.count ?? 0) > 5)
      .slice(-5)
      .reverse()
      .map(error => ({
        ...error,
        timestamp: new Date(error.timestamp).toLocaleString()
      }));

    return NextResponse.json({
      analytics: {
        totalErrors,
        resolvedErrors,
        pendingErrors,
        topErrors,
        criticalErrors
      }
    });
  } catch (error) {
    console.error('Error retrieving error analytics:', error);
    return NextResponse.json({ error: 'Failed to retrieve error analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const errorRecord: ErrorRecord = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: data.message || 'Unknown error',
      stack: data.stack || '',
      page: data.page || '/',
      userAgent: data.userAgent || 'unknown',
      userId: data.userId || 'anonymous',
      severity: data.severity || 'medium',
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...data
    };

    errorAnalytics.errors.push(errorRecord);

    // Update error counts
    const currentCount = errorAnalytics.errorCounts.get(errorRecord.message) || 0;
    errorAnalytics.errorCounts.set(errorRecord.message, currentCount + 1);

    // Update affected users
    const users = errorAnalytics.affectedUsers.get(errorRecord.message) ?? new Set<string>();
    if (!users.has(errorRecord.userId)) {
      users.add(errorRecord.userId);
      errorAnalytics.affectedUsers.set(errorRecord.message, users);
    }

    return NextResponse.json({ 
      success: true, 
      errorId: errorRecord.id,
      message: 'Error recorded successfully' 
    });
  } catch (error) {
    console.error('Error recording error report:', error);
    return NextResponse.json({ error: 'Failed to record error' }, { status: 500 });
  }
}