import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get all active ads
    const ads = await prisma.customAd.findMany({
      where: { active: true }
    });

    if (ads.length === 0) {
      return NextResponse.json({ ad: null }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Pick a random ad
    const randomAd = ads[Math.floor(Math.random() * ads.length)];

    // Increment impressions in the background
    // We don't await this to keep the response fast
    prisma.customAd.update({
      where: { id: randomAd.id },
      data: { impressions: { increment: 1 } }
    }).catch(err => console.error('Failed to increment impressions:', err));

    const response = NextResponse.json({ ad: randomAd });

    // Add CORS headers so other websites can fetch the ad
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Ad Serve Error:', error);
    return NextResponse.json(
      { error: 'Failed to serve ad' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
