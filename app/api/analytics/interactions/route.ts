import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for interactions (in production, use a database)
const interactions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const interaction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      timestamp: new Date().toISOString(),
    };

    interactions.push(interaction);

    // Keep only last 1000 interactions
    if (interactions.length > 1000) {
      interactions.splice(0, interactions.length - 1000);
    }

    return NextResponse.json({ 
      success: true, 
      interactionId: interaction.id,
      message: 'Interaction tracked successfully' 
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      totalInteractions: interactions.length,
      recentInteractions: interactions.slice(-10)
    });
  } catch (error) {
    console.error('Error retrieving interactions:', error);
    return NextResponse.json({ error: 'Failed to retrieve interactions' }, { status: 500 });
  }
}
