import { NextRequest, NextResponse } from 'next/server';

interface InteractionEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  userId?: string;
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'form_interaction';
  element: string;
  elementText: string;
  elementType: string;
  path: string;
  coordinates: { x: number; y: number };
  metadata: Record<string, any>;
}

interface HeatmapData {
  path: string;
  clicks: Array<{ x: number; y: number; count: number }>;
  scrollDepth: Record<string, number>;
  timeSpent: number;
}

// In-memory storage
const interactions: InteractionEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const interaction: InteractionEvent = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      sessionId: data.sessionId,
      userId: data.userId,
      type: data.type || 'click',
      element: data.element,
      elementText: data.elementText || '',
      elementType: data.elementType || '',
      path: data.path,
      coordinates: data.coordinates || { x: 0, y: 0 },
      metadata: data.metadata || {}
    };
    
    interactions.push(interaction);
    
    // Keep only last 50,000 interactions
    if (interactions.length > 50000) {
      interactions.splice(0, interactions.length - 50000);
    }
    
    return NextResponse.json({ 
      success: true, 
      interactionId: interaction.id 
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const days = parseInt(searchParams.get('days') || '7');
    const type = searchParams.get('type');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let filteredInteractions = interactions.filter(
      interaction => new Date(interaction.timestamp) >= startDate
    );
    
    if (path) {
      filteredInteractions = filteredInteractions.filter(i => i.path === path);
    }
    
    if (type) {
      filteredInteractions = filteredInteractions.filter(i => i.type === type);
    }
    
    const analytics = {
      totalInteractions: filteredInteractions.length,
      uniqueSessions: new Set(filteredInteractions.map(i => i.sessionId)).size,
      interactionsByType: getInteractionsByType(filteredInteractions),
      topElements: getTopElements(filteredInteractions),
      heatmapData: generateHeatmapData(filteredInteractions),
      userFlow: generateUserFlow(filteredInteractions),
      engagementMetrics: calculateEngagementMetrics(filteredInteractions),
      recentInteractions: filteredInteractions.slice(-100).reverse()
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching interaction analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function generateId(): string {
  return 'int_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getInteractionsByType(interactions: InteractionEvent[]) {
  const typeCount = new Map<string, number>();
  interactions.forEach(interaction => {
    typeCount.set(interaction.type, (typeCount.get(interaction.type) || 0) + 1);
  });
  
  return Object.fromEntries(typeCount);
}

function getTopElements(interactions: InteractionEvent[]) {
  const elementCount = new Map<string, {
    count: number;
    element: string;
    text: string;
    paths: Set<string>;
  }>();
  
  interactions.forEach(interaction => {
    const key = `${interaction.element}:${interaction.elementText}`;
    const existing = elementCount.get(key);
    
    if (existing) {
      existing.count++;
      existing.paths.add(interaction.path);
    } else {
      elementCount.set(key, {
        count: 1,
        element: interaction.element,
        text: interaction.elementText,
        paths: new Set([interaction.path])
      });
    }
  });
  
  return Array.from(elementCount.entries())
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 20)
    .map(([key, data]) => ({
      element: data.element,
      text: data.text,
      count: data.count,
      paths: Array.from(data.paths)
    }));
}

function generateHeatmapData(interactions: InteractionEvent[]): Record<string, HeatmapData> {
  const pathData = new Map<string, {
    clicks: Map<string, number>;
    totalTime: number;
    sessions: Set<string>;
  }>();
  
  interactions.forEach(interaction => {
    if (interaction.type === 'click') {
      const existing = pathData.get(interaction.path);
      const coordKey = `${Math.floor(interaction.coordinates.x / 10) * 10},${Math.floor(interaction.coordinates.y / 10) * 10}`;
      
      if (existing) {
        existing.clicks.set(coordKey, (existing.clicks.get(coordKey) || 0) + 1);
        existing.sessions.add(interaction.sessionId);
      } else {
        pathData.set(interaction.path, {
          clicks: new Map([[coordKey, 1]]),
          totalTime: 0,
          sessions: new Set([interaction.sessionId])
        });
      }
    }
  });
  
  const heatmapData: Record<string, HeatmapData> = {};
  
  pathData.forEach((data, path) => {
    const clicks = Array.from(data.clicks.entries()).map(([coord, count]) => {
      const [x, y] = coord.split(',').map(Number);
      return { x, y, count };
    });
    
    heatmapData[path] = {
      path,
      clicks,
      scrollDepth: {}, // Would need scroll tracking to populate
      timeSpent: data.totalTime / data.sessions.size
    };
  });
  
  return heatmapData;
}

function generateUserFlow(interactions: InteractionEvent[]) {
  const sessionFlows = new Map<string, string[]>();
  
  interactions.forEach(interaction => {
    const existing = sessionFlows.get(interaction.sessionId);
    if (existing) {
      // Only add if it's a different path
      if (existing[existing.length - 1] !== interaction.path) {
        existing.push(interaction.path);
      }
    } else {
      sessionFlows.set(interaction.sessionId, [interaction.path]);
    }
  });
  
  // Calculate most common flow patterns
  const flowPatterns = new Map<string, number>();
  
  sessionFlows.forEach(flow => {
    for (let i = 0; i < flow.length - 1; i++) {
      const pattern = `${flow[i]} → ${flow[i + 1]}`;
      flowPatterns.set(pattern, (flowPatterns.get(pattern) || 0) + 1);
    }
  });
  
  return Array.from(flowPatterns.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([pattern, count]) => ({ pattern, count }));
}

function calculateEngagementMetrics(interactions: InteractionEvent[]) {
  const sessionEngagement = new Map<string, {
    interactions: number;
    duration: number;
    pages: Set<string>;
    firstInteraction: Date;
    lastInteraction: Date;
  }>();
  
  interactions.forEach(interaction => {
    const sessionId = interaction.sessionId;
    const timestamp = new Date(interaction.timestamp);
    
    const existing = sessionEngagement.get(sessionId);
    if (existing) {
      existing.interactions++;
      existing.pages.add(interaction.path);
      existing.lastInteraction = timestamp;
    } else {
      sessionEngagement.set(sessionId, {
        interactions: 1,
        duration: 0,
        pages: new Set([interaction.path]),
        firstInteraction: timestamp,
        lastInteraction: timestamp
      });
    }
  });
  
  // Calculate duration for each session
  sessionEngagement.forEach(session => {
    session.duration = session.lastInteraction.getTime() - session.firstInteraction.getTime();
  });
  
  const sessions = Array.from(sessionEngagement.values());
  const totalSessions = sessions.length;
  
  if (totalSessions === 0) {
    return {
      averageInteractionsPerSession: 0,
      averageSessionDuration: 0,
      averagePagesPerSession: 0,
      engagementRate: 0,
      bounceRate: 0
    };
  }
  
  const totalInteractions = sessions.reduce((sum, s) => sum + s.interactions, 0);
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalPages = sessions.reduce((sum, s) => sum + s.pages.size, 0);
  
  const bounceSessions = sessions.filter(s => s.pages.size === 1 && s.interactions < 2).length;
  const engagedSessions = sessions.filter(s => s.interactions >= 3 || s.duration > 30000).length;
  
  return {
    averageInteractionsPerSession: totalInteractions / totalSessions,
    averageSessionDuration: totalDuration / totalSessions,
    averagePagesPerSession: totalPages / totalSessions,
    engagementRate: (engagedSessions / totalSessions) * 100,
    bounceRate: (bounceSessions / totalSessions) * 100
  };
}