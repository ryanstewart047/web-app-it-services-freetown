import { NextResponse } from 'next/server';
import { getTrackRecordData } from '@/lib/server/track-record-store';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const data = await getTrackRecordData();
    return NextResponse.json(data);
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
      { status: 200 }
    );
  }
}
