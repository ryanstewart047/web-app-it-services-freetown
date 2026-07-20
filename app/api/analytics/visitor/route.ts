import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Total Visitors (all recorded events)
    const totalVisitors = await prisma.analyticsVisitor.count();

    // Unique Visitors (count of distinct sessions)
    const uniqueVisitorsResult = await prisma.analyticsVisitor.groupBy({
      by: ['sessionId'],
    });
    const uniqueVisitors = uniqueVisitorsResult.length;

    // Total Sessions
    const totalSessions = await prisma.analyticsSession.count();

    // Bounce Rate (sessions with pageViews === 1)
    const singlePageSessions = await prisma.analyticsSession.count({
      where: {
        pageViews: 1,
      },
    });
    const bounceRate = totalSessions > 0 ? ((singlePageSessions / totalSessions) * 100).toFixed(1) : "0.0";

    // Top Pages
    const topPagesResult = await prisma.analyticsVisitor.groupBy({
      by: ['page'],
      _count: {
        page: true,
      },
      orderBy: {
        _count: {
          page: 'desc',
        },
      },
      take: 10,
    });
    const topPages = topPagesResult.map(item => ({
      path: item.page,
      visits: item._count.page,
    }));

    // Traffic Sources
    const trafficSourcesResult = await prisma.analyticsVisitor.groupBy({
      by: ['source'],
      _count: {
        source: true,
      },
      orderBy: {
        _count: {
          source: 'desc',
        },
      },
      take: 10,
    });
    const trafficSources = trafficSourcesResult.map(item => ({
      source: item.source,
      visits: item._count.source,
    }));

    // Device Breakdown
    const deviceBreakdownResult = await prisma.analyticsVisitor.groupBy({
      by: ['device'],
      _count: {
        device: true,
      },
      orderBy: {
        _count: {
          device: 'desc',
        },
      },
    });
    const deviceBreakdown = deviceBreakdownResult.map(item => ({
      device: item.device,
      count: item._count.device,
      percentage: totalVisitors > 0 ? ((item._count.device / totalVisitors) * 100).toFixed(1) : "0.0",
    }));

    // Country Breakdown
    const countryBreakdownResult = await prisma.analyticsVisitor.groupBy({
      by: ['country'],
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
    });
    const countryBreakdown = countryBreakdownResult.map(item => ({
      country: item.country,
      count: item._count.country,
      percentage: totalVisitors > 0 ? ((item._count.country / totalVisitors) * 100).toFixed(1) : "0.0",
    }));

    // Recent Visitors (last 10)
    const recentVisitorsData = await prisma.analyticsVisitor.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: 10,
    });
    const recentVisitors = recentVisitorsData.map(visitor => ({
      ...visitor,
      timestamp: visitor.timestamp.toLocaleString(),
    }));

    // Average Session Duration
    const sessionsWithDuration = await prisma.analyticsSession.aggregate({
      _avg: {
        duration: true,
      },
      where: {
        duration: {
          gt: 0,
        },
      },
    });
    const avgDurationMs = sessionsWithDuration._avg.duration || 0;
    const averageSessionDuration = avgDurationMs > 0 ? Math.round(avgDurationMs / 60000) : 0;

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
    const page = data.path || data.page || '/';
    const referrer = data.referrer || 'direct';
    
    let source = 'Direct';
    if (referrer !== 'direct') {
      try {
        source = new URL(referrer).hostname;
      } catch (e) {
        source = referrer;
      }
    }
    
    // Create session ID safely
    const sessionId = typeof data.sessionId === 'string' && data.sessionId.length 
      ? data.sessionId 
      : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create visitor record
    const visitor = await prisma.analyticsVisitor.create({
      data: {
        sessionId,
        page,
        source,
        referrer,
        userAgent: data.userAgent || 'unknown',
        country: data.country || 'Unknown',
        device: deviceType,
      }
    });

    // Update or create session
    // We fetch the existing session first to calculate duration correctly
    const existingSession = await prisma.analyticsSession.findUnique({
      where: { sessionId }
    });

    if (existingSession) {
      const duration = Date.now() - existingSession.startTime.getTime();
      await prisma.analyticsSession.update({
        where: { sessionId },
        data: {
          pageViews: {
            increment: 1
          },
          lastActivity: new Date(),
          duration
        }
      });
    } else {
      await prisma.analyticsSession.create({
        data: {
          sessionId,
          pageViews: 1,
          duration: 0,
        }
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