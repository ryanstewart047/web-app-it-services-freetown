import { NextRequest, NextResponse } from 'next/server';

interface VisitorRecord {
  id: string;
  sessionId: string;
  page: string;
  referrer: string;
  userAgent: string;
  country: string;
  device: string;
  timestamp: string;
}

interface SessionRecord {
  id: string;
  startTime: string;
  lastActivity: string;
  pageViews: number;
  duration: number;
}

interface VisitorAnalyticsState {
  visitors: VisitorRecord[];
  sessions: Map<string, SessionRecord>;
  pageViews: Map<string, number>;
  trafficSources: Map<string, number>;
  countries: Map<string, number>;
  devices: Map<string, number>;
}

// In-memory storage for analytics (in production, you'd use a database)
const analyticsData: VisitorAnalyticsState = {
  visitors: [],
  sessions: new Map(),
  pageViews: new Map(),
  trafficSources: new Map(),
  countries: new Map(),
  devices: new Map(),
};

export async function GET() {
  try {
    // Calculate analytics from stored data
  const totalVisitors = analyticsData.visitors.length;
  const uniqueVisitors = new Set(analyticsData.visitors.map((visitor) => visitor.sessionId)).size;
    const totalSessions = analyticsData.sessions.size;
    
    // Calculate bounce rate (sessions with only 1 page view)
    let singlePageSessions = 0;
    analyticsData.sessions.forEach((session) => {
      if (session.pageViews === 1) singlePageSessions++;
    });
    const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions * 100).toFixed(1) : "0.0";

    // Top pages
    const topPages = Array.from(analyticsData.pageViews.entries())
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Traffic sources
    const trafficSources = Array.from(analyticsData.trafficSources.entries())
      .map(([source, visits]) => ({ source, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Device breakdown
    const deviceBreakdown = Array.from(analyticsData.devices.entries())
      .map(([device, count]) => ({
        device,
        count,
        percentage: totalVisitors > 0 ? ((count / totalVisitors) * 100).toFixed(1) : "0.0"
      }))
      .sort((a, b) => b.count - a.count);

    // Country breakdown
    const countryBreakdown = Array.from(analyticsData.countries.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalVisitors > 0 ? ((count / totalVisitors) * 100).toFixed(1) : "0.0"
      }))
      .sort((a, b) => b.count - a.count);

    // Recent visitors (last 10)
    const recentVisitors = analyticsData.visitors
      .slice(-10)
      .reverse()
      .map((visitor) => ({
        ...visitor,
        timestamp: new Date(visitor.timestamp).toLocaleString(),
      }));

    // Average session duration
    let totalDuration = 0;
    let sessionsWithDuration = 0;
    analyticsData.sessions.forEach((session) => {
      if (session.duration > 0) {
        totalDuration += session.duration;
        sessionsWithDuration++;
      }
    });
    const averageSessionDuration = sessionsWithDuration > 0 ? Math.round(totalDuration / sessionsWithDuration) : 0;

    return NextResponse.json({
      totalVisitors,
      uniqueVisitors,
      totalSessions,
      averageSessionDuration,
      bounceRate: bounceRate + "%",
      topPages,
      trafficSources,
      deviceBreakdown,
      countryBreakdown,
      recentVisitors
    });
  } catch (error) {
    console.error('Error retrieving visitor analytics:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Extract device info
    const deviceType = data.device?.type || 'Unknown';
    
    // Create visitor record
    const visitor: VisitorRecord = {
      id: `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: typeof data.sessionId === 'string' && data.sessionId.length ? data.sessionId : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      page: data.path || data.page || '/',
      referrer: data.referrer || 'direct',
      userAgent: data.userAgent || 'unknown',
      country: data.country || 'Unknown',
      device: deviceType,
      timestamp: new Date().toISOString(),
    };

    analyticsData.visitors.push(visitor);

    // Update page views
    const currentViews = analyticsData.pageViews.get(visitor.page) || 0;
    analyticsData.pageViews.set(visitor.page, currentViews + 1);

    // Update traffic sources
  const source = visitor.referrer === 'direct' ? 'Direct' : new URL(visitor.referrer || 'http://direct').hostname;
    const currentSourceViews = analyticsData.trafficSources.get(source) || 0;
    analyticsData.trafficSources.set(source, currentSourceViews + 1);

    // Update countries
    const currentCountryViews = analyticsData.countries.get(visitor.country) || 0;
    analyticsData.countries.set(visitor.country, currentCountryViews + 1);

    // Update devices
    const currentDeviceViews = analyticsData.devices.get(visitor.device) || 0;
    analyticsData.devices.set(visitor.device, currentDeviceViews + 1);

    // Update or create session
    if (analyticsData.sessions.has(visitor.sessionId)) {
      const session = analyticsData.sessions.get(visitor.sessionId);
      if (session) {
        session.pageViews += 1;
        session.lastActivity = new Date().toISOString();
        if (session.startTime) {
          session.duration = Date.now() - new Date(session.startTime).getTime();
        }
        analyticsData.sessions.set(visitor.sessionId, session);
      }
    } else {
      analyticsData.sessions.set(visitor.sessionId, {
        id: visitor.sessionId,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        pageViews: 1,
        duration: 0
      });
    }

    return NextResponse.json({ 
      success: true, 
      visitorId: visitor.id,
      message: 'Visitor tracked successfully' 
    });
  } catch (error) {
    console.error('Error recording visitor:', error);
    return NextResponse.json({ error: 'Failed to record visitor' }, { status: 500 });
  }
}