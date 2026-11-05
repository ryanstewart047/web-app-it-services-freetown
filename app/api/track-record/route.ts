import { NextResponse } from 'next/server';
import { getTrackRecordData } from '@/lib/server/track-record-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getTrackRecordData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[TrackRecord API] Failed to fetch track record:', error);
    return NextResponse.json(
      {
        devices: 450,
        customers: 300,
        successRate: 98,
        responseTime: 2,
        error: 'Fallback to default baseline',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
