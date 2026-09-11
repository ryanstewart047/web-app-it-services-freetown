import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import {
  loadTrackRecordSettings,
  saveTrackRecordSettings,
  getTrackRecordData,
  TrackRecordSettings,
} from '@/lib/server/track-record-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const settings = await loadTrackRecordSettings();
    const liveData = await getTrackRecordData();

    return NextResponse.json(
      {
        settings,
        liveData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[AdminTrackRecord API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve track record settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    const patch: Partial<TrackRecordSettings> = {};

    if (typeof body.offlineDevices === 'number') {
      patch.offlineDevices = Math.max(0, Math.floor(body.offlineDevices));
    }
    if (typeof body.offlineCustomers === 'number') {
      patch.offlineCustomers = Math.max(0, Math.floor(body.offlineCustomers));
    }
    if (typeof body.baselineDevices === 'number') {
      patch.baselineDevices = Math.max(0, Math.floor(body.baselineDevices));
    }
    if (typeof body.baselineCustomers === 'number') {
      patch.baselineCustomers = Math.max(0, Math.floor(body.baselineCustomers));
    }
    if (typeof body.successRate === 'number') {
      patch.successRate = Math.min(100, Math.max(0, Math.floor(body.successRate)));
    }
    if (typeof body.responseTimeHours === 'number') {
      patch.responseTimeHours = Math.max(0, Number(body.responseTimeHours));
    }

    const updatedSettings = await saveTrackRecordSettings(patch);
    const updatedLiveData = await getTrackRecordData();

    return NextResponse.json(
      {
        success: true,
        message: 'Track record settings updated successfully',
        settings: updatedSettings,
        liveData: updatedLiveData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[AdminTrackRecord API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update track record settings' },
      { status: 500 }
    );
  }
}
