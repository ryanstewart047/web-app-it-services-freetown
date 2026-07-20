import { NextRequest, NextResponse } from 'next/server';

interface VisitorData {
  sessionId: string;
  timestamp: string;
  path: string;
  referrer: string;
  userAgent: string;
  ip: string;
  country?: string;
  city?: string;
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

// In-memory storage (replace with database in production)
const visitorsData: VisitorData[] = [];
const sessionsData = new Map<string, { 
  firstVisit: string; 
  lastActivity: string; 
  pageViews: number; 
  totalDuration: number; 
}>();

export async function POST(request: NextRequest) {
  try {
    const data: VisitorData = await request.json();
    
    // Get real IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = forwarded ? forwarded.split(',')[0] : 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'unknown';
    
    // Parse User Agent for device info
    const userAgent = request.headers.get('user-agent') || '';
    const deviceInfo = parseUserAgent(userAgent);
    
    // Get geographical data (mock for now, use real service in production)
    const geoData = await getGeoLocation(realIp);
    
    const visitorEntry: VisitorData = {
      ...data,
      ip: realIp,
      userAgent,
      country: geoData.country,
      city: geoData.city,
      device: deviceInfo,
      timestamp: new Date().toISOString()
    };
    
    // Store visitor data
    visitorsData.push(visitorEntry);
    
    // Update session data
    const session = sessionsData.get(data.sessionId);
    if (session) {
      session.lastActivity = visitorEntry.timestamp;
      session.pageViews += 1;
      if (data.duration) {
        session.totalDuration += data.duration;
      }
    } else {
      sessionsData.set(data.sessionId, {
        firstVisit: visitorEntry.timestamp,
        lastActivity: visitorEntry.timestamp,
        pageViews: 1,
        totalDuration: data.duration || 0
      });
    }
    
    // Keep only last 10,000 entries to prevent memory overflow
    if (visitorsData.length > 10000) {
      visitorsData.splice(0, visitorsData.length - 10000);
    }
    
    return NextResponse.json({ success: true, message: 'Visitor data recorded' });
  } catch (error) {
    console.error('Error recording visitor data:', error);
    return NextResponse.json({ error: 'Failed to record data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const filteredData = visitorsData.filter(
      visitor => new Date(visitor.timestamp) >= startDate
    );
    
    // Calculate analytics
    const analytics = {
      totalVisitors: filteredData.length,
      uniqueVisitors: new Set(filteredData.map(v => v.sessionId)).size,
      totalSessions: sessionsData.size,
      averageSessionDuration: Array.from(sessionsData.values())
        .reduce((sum, session) => sum + session.totalDuration, 0) / sessionsData.size,
      topPages: getTopPages(filteredData),
      trafficSources: getTrafficSources(filteredData),
      deviceBreakdown: getDeviceBreakdown(filteredData),
      browserBreakdown: getBrowserBreakdown(filteredData),
      countryBreakdown: getCountryBreakdown(filteredData),
      hourlyTraffic: getHourlyTraffic(filteredData),
      averagePageLoadTime: filteredData.reduce((sum, v) => sum + v.performance.loadTime, 0) / filteredData.length,
      bounceRate: calculateBounceRate(),
      recentVisitors: filteredData.slice(-50).reverse()
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function parseUserAgent(userAgent: string) {
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
    type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    browser,
    os,
    screenResolution: 'Unknown'
  };
}

async function getGeoLocation(ip: string) {
  // Mock geo data - in production, use services like MaxMind, IPInfo, or similar
  if (ip === 'unknown' || ip.startsWith('192.168') || ip.startsWith('127.')) {
    return { country: 'Unknown', city: 'Unknown' };
  }
  
  try {
    // You can integrate with real geo services here
    return { country: 'Sierra Leone', city: 'Freetown' };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}

function getTopPages(data: VisitorData[]) {
  const pageCount = new Map<string, number>();
  data.forEach(visitor => {
    pageCount.set(visitor.path, (pageCount.get(visitor.path) || 0) + 1);
  });
  
  return Array.from(pageCount.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, visits: count }));
}

function getTrafficSources(data: VisitorData[]) {
  const sources = new Map<string, number>();
  data.forEach(visitor => {
    const source = visitor.referrer || 'Direct';
    const domain = source === 'Direct' ? 'Direct' : 
                   source.includes('google') ? 'Google' :
                   source.includes('facebook') ? 'Facebook' :
                   source.includes('twitter') ? 'Twitter' :
                   new URL(source).hostname;
    sources.set(domain, (sources.get(domain) || 0) + 1);
  });
  
  return Array.from(sources.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([source, count]) => ({ source, visits: count }));
}

function getDeviceBreakdown(data: VisitorData[]) {
  const devices = new Map<string, number>();
  data.forEach(visitor => {
    devices.set(visitor.device.type, (devices.get(visitor.device.type) || 0) + 1);
  });
  
  return Array.from(devices.entries())
    .map(([device, count]) => ({ device, count, percentage: (count / data.length * 100).toFixed(1) }));
}

function getBrowserBreakdown(data: VisitorData[]) {
  const browsers = new Map<string, number>();
  data.forEach(visitor => {
    browsers.set(visitor.device.browser, (browsers.get(visitor.device.browser) || 0) + 1);
  });
  
  return Array.from(browsers.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([browser, count]) => ({ browser, count, percentage: (count / data.length * 100).toFixed(1) }));
}

function getCountryBreakdown(data: VisitorData[]) {
  const countries = new Map<string, number>();
  data.forEach(visitor => {
    const country = visitor.country || 'Unknown';
    countries.set(country, (countries.get(country) || 0) + 1);
  });
  
  return Array.from(countries.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count, percentage: (count / data.length * 100).toFixed(1) }));
}

function getHourlyTraffic(data: VisitorData[]) {
  const hourlyCount = new Array(24).fill(0);
  data.forEach(visitor => {
    const hour = new Date(visitor.timestamp).getHours();
    hourlyCount[hour]++;
  });
  
  return hourlyCount.map((count, hour) => ({ hour, count }));
}

function calculateBounceRate() {
  let singlePageSessions = 0;
  sessionsData.forEach(session => {
    if (session.pageViews === 1) {
      singlePageSessions++;
    }
  });
  
  return sessionsData.size > 0 ? (singlePageSessions / sessionsData.size * 100).toFixed(1) : '0';
}