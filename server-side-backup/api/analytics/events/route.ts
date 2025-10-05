import { NextRequest, NextResponse } from 'next/server';

interface CustomEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  userId?: string;
  eventName: string;
  data: Record<string, any>;
  path: string;
  category: string;
  value?: number;
}

// In-memory storage
const customEvents: CustomEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const event: CustomEvent = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      sessionId: data.sessionId,
      userId: data.userId,
      eventName: data.eventName,
      data: data.data || {},
      path: data.path,
      category: data.category || 'general',
      value: data.value
    };
    
    customEvents.push(event);
    
    // Keep only last 10,000 events
    if (customEvents.length > 10000) {
      customEvents.splice(0, customEvents.length - 10000);
    }
    
    return NextResponse.json({ 
      success: true, 
      eventId: event.id 
    });
  } catch (error) {
    console.error('Error recording custom event:', error);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventName = searchParams.get('eventName');
    const category = searchParams.get('category');
    const days = parseInt(searchParams.get('days') || '7');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let filteredEvents = customEvents.filter(
      event => new Date(event.timestamp) >= startDate
    );
    
    if (eventName) {
      filteredEvents = filteredEvents.filter(e => e.eventName === eventName);
    }
    
    if (category) {
      filteredEvents = filteredEvents.filter(e => e.category === category);
    }
    
    const analytics = {
      totalEvents: filteredEvents.length,
      uniqueSessions: new Set(filteredEvents.map(e => e.sessionId)).size,
      eventsByName: getEventsByName(filteredEvents),
      eventsByCategory: getEventsByCategory(filteredEvents),
      topEvents: getTopEvents(filteredEvents),
      eventTrends: getEventTrends(filteredEvents, days),
      recentEvents: filteredEvents.slice(-50).reverse()
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function generateId(): string {
  return 'evt_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getEventsByName(events: CustomEvent[]) {
  const nameCount = new Map<string, number>();
  events.forEach(event => {
    nameCount.set(event.eventName, (nameCount.get(event.eventName) || 0) + 1);
  });
  
  return Object.fromEntries(nameCount);
}

function getEventsByCategory(events: CustomEvent[]) {
  const categoryCount = new Map<string, number>();
  events.forEach(event => {
    categoryCount.set(event.category, (categoryCount.get(event.category) || 0) + 1);
  });
  
  return Object.fromEntries(categoryCount);
}

function getTopEvents(events: CustomEvent[]) {
  const eventStats = new Map<string, {
    count: number;
    totalValue: number;
    uniqueSessions: Set<string>;
    averageValue: number;
  }>();
  
  events.forEach(event => {
    const existing = eventStats.get(event.eventName);
    if (existing) {
      existing.count++;
      existing.totalValue += event.value || 0;
      existing.uniqueSessions.add(event.sessionId);
    } else {
      eventStats.set(event.eventName, {
        count: 1,
        totalValue: event.value || 0,
        uniqueSessions: new Set([event.sessionId]),
        averageValue: 0
      });
    }
  });
  
  eventStats.forEach(stats => {
    stats.averageValue = stats.count > 0 ? stats.totalValue / stats.count : 0;
  });
  
  return Array.from(eventStats.entries())
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 10)
    .map(([eventName, stats]) => ({
      eventName,
      count: stats.count,
      uniqueSessions: stats.uniqueSessions.size,
      totalValue: stats.totalValue,
      averageValue: stats.averageValue
    }));
}

function getEventTrends(events: CustomEvent[], days: number) {
  const dateCount = new Map<string, number>();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateCount.set(dateStr, 0);
  }
  
  events.forEach(event => {
    const dateStr = event.timestamp.split('T')[0];
    if (dateCount.has(dateStr)) {
      dateCount.set(dateStr, dateCount.get(dateStr)! + 1);
    }
  });
  
  return Array.from(dateCount.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}