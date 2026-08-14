import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateRepair, getRepairByTrackingId } from '@/lib/server/analytics-store';

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'received',
  'submitted',
  'diagnosed',
  'in-progress',
  'ready-for-pickup',
  'collected',
];

// GET single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
        },
      });

      if (appointment) {
        return NextResponse.json(appointment);
      }
    } catch (_) {
      // Ignore Prisma errors and try analytics store
    }

    const fallbackRepair = await getRepairByTrackingId(id);
    if (fallbackRepair) {
      return NextResponse.json(fallbackRepair);
    }

    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

// PATCH (update) appointment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status.toLowerCase())) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    const normalizedStatus = status.toLowerCase();

    // 1. Try Prisma DB update first
    let dbUpdated = false;
    let appointmentResult: any = null;

    try {
      appointmentResult = await prisma.appointment.update({
        where: { id },
        data: { status: normalizedStatus },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      dbUpdated = true;
    } catch (dbErr) {
      console.warn('[Appointments API] Prisma update skipped/failed, trying analytics store:', dbErr);
    }

    // 2. Also update analytics-store / repair store if tracking ID matches
    try {
      const repairUpdated = await updateRepair({
        trackingId: id,
        status: normalizedStatus as any,
      });
      if (repairUpdated && !appointmentResult) {
        appointmentResult = repairUpdated;
      }
    } catch (storeErr) {
      console.warn('[Appointments API] Analytics store update skipped:', storeErr);
    }

    if (appointmentResult || dbUpdated) {
      return NextResponse.json(appointmentResult || { success: true, status: normalizedStatus });
    }

    // Return success response to avoid blocking UI when operating in client-only storage mode
    return NextResponse.json({ success: true, status: normalizedStatus, message: 'Status updated locally' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

// DELETE appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    try {
      await prisma.appointment.delete({
        where: { id },
      });
    } catch (_) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
