import { NextRequest, NextResponse } from 'next/server';

import {
  getAnalyticsData,
  getRepairByTrackingId,
  updateRepair,
  createRepair,
  deleteRepair,
  generateTrackingId
} from '@/lib/server/analytics-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId');
    const status = searchParams.get('status');

    // If trackingId is provided, return specific repair
    if (trackingId) {
      const repair = await getRepairByTrackingId(trackingId);
      if (!repair) {
        return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
      }
      return NextResponse.json(repair);
    }

    const data = await getAnalyticsData();
    const repairs = status
      ? data.repairs.filter((repair) => repair.status === status)
      : data.repairs;

    const totalRepairs = data.repairs.length;
    const statusCounts = data.repairs.reduce((acc, repair) => {
      acc[repair.status] = (acc[repair.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedRepairs = data.repairs.filter((repair) =>
      repair.status === 'completed' && repair.estimatedCompletion
    );

    const averageCompletionTime = completedRepairs.reduce((total, repair) => {
      const submission = new Date(repair.submissionDate).getTime();
      const completion = new Date(repair.estimatedCompletion as string).getTime();
      return total + Math.max(0, completion - submission);
    }, 0);

    const totalRevenue = data.repairs
      .filter((repair) => repair.status === 'completed' && typeof repair.totalCost === 'number')
      .reduce((sum, repair) => sum + (repair.totalCost ?? 0), 0);

    const mapRepairForResponse = (repair: any) => ({
      ...repair,
      issueSummary: repair.issueDescription,
      submissionDate: new Date(repair.submissionDate).toLocaleDateString(),
      estimatedCompletion: repair.estimatedCompletion ? new Date(repair.estimatedCompletion).toLocaleDateString() : undefined,
      lastUpdated: repair.lastUpdated ? new Date(repair.lastUpdated).toLocaleDateString() : undefined
    });

    const recentRepairs = [...repairs]
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
      .slice(0, 20)
      .map(mapRepairForResponse);

    const allRepairs = repairs.map(mapRepairForResponse);

    const averageCompletionDays = completedRepairs.length
      ? Math.round(averageCompletionTime / completedRepairs.length / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      totalRepairs,
      statusCounts,
      averageCompletionDays,
      totalRevenue,
      recentRepairs,
      allRepairs
    });
  } catch (error) {
    console.error('Error retrieving repair analytics:', error);
    return NextResponse.json({ error: 'Failed to retrieve repair analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (data.action === 'create') {
      const trackingId = typeof data.trackingId === 'string' && data.trackingId.trim()
        ? data.trackingId.trim()
        : generateTrackingId();

      const repair = await createRepair({
        trackingId,
        customerName: data.customerName || 'Unknown',
        email: data.email || '',
        phone: data.phone || '',
        deviceType: data.deviceType || 'Unknown Device',
        issueDescription: data.issueDescription || 'No description provided',
        notes: data.notes || '',
        totalCost: typeof data.totalCost === 'number' ? data.totalCost : undefined,
        estimatedCompletion: data.estimatedCompletion,
        status: data.status,
        serviceType: data.serviceType,
        deviceModel: data.deviceModel,
        address: data.address
      });

      return NextResponse.json({
        success: true,
        trackingId: trackingId,
        repair,
        message: 'Repair booking created successfully'
      });
    } else if (data.action === 'update') {
      const updated = await updateRepair({
        trackingId: data.trackingId,
        status: data.status,
        notes: data.notes,
        estimatedCompletion: data.estimatedCompletion,
        totalCost: typeof data.totalCost === 'number' ? data.totalCost : undefined
      });

      if (!updated) {
        return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        repair: updated,
        message: 'Repair updated successfully'
      });

    } else if (data.action === 'delete') {
      const deleted = await deleteRepair(data.trackingId);

      if (!deleted) {
        return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        deletedRepair: deleted,
        message: 'Repair deleted successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing repair request:', error);
    return NextResponse.json({ error: 'Failed to process repair request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const updated = await updateRepair({
      trackingId: data.trackingId,
      status: data.status,
      notes: data.notes,
      estimatedCompletion: data.estimatedCompletion,
      totalCost: typeof data.totalCost === 'number' ? data.totalCost : undefined
    });

    if (!updated) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      repair: updated,
      message: 'Repair status updated successfully'
    });
  } catch (error) {
    console.error('Error updating repair status:', error);
    return NextResponse.json({ error: 'Failed to update repair status' }, { status: 500 });
  }
}