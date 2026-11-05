import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if database is configured
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes('YOUR_PASSWORD_HERE') || dbUrl.includes('YOUR_HOST_HERE')) {
      return NextResponse.json({ 
        error: 'Database not configured',
        syncedCount: 0 
      }, { status: 503 });
    }

    let syncedCount = 0;

    // 1. Link or sync existing Repair records in the database
    const unsyncedRepairs = await prisma.repair.findMany({
      where: { appointmentId: null },
      include: { customer: true }
    });

    for (const repair of unsyncedRepairs) {
      try {
        // Check if an appointment already exists for this customer (to prevent doubling)
        const existingApp = await prisma.appointment.findFirst({
          where: {
            customerId: repair.customerId,
            deviceType: repair.deviceType || undefined,
          }
        });

        if (existingApp) {
          // Link existing appointment to the repair instead of creating a duplicate
          await prisma.repair.update({
            where: { id: repair.id },
            data: { appointmentId: existingApp.id }
          });
          continue;
        }

        // Only create if no appointment exists at all for this repair
        const appointment = await prisma.appointment.create({
          data: {
            customerId: repair.customerId,
            deviceType: repair.deviceType || 'Unknown',
            deviceModel: repair.deviceModel || 'Unknown',
            issueDescription: repair.issueDescription || 'No description',
            serviceType: repair.serviceType || 'General Repair',
            preferredDate: repair.createdAt ? repair.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            preferredTime: '09:00',
            status: repair.status === 'received' ? 'pending' : repair.status,
            createdAt: repair.createdAt || new Date()
          }
        });

        await prisma.repair.update({
          where: { id: repair.id },
          data: { appointmentId: appointment.id }
        });

        syncedCount++;
      } catch (err) {
        console.error(`Failed to sync repair ${repair.id} to appointment:`, err);
      }
    }

    // 2. Process any client-side localStorage bookings passed in the request body
    const body = await request.json().catch(() => ({}));
    const localBookings = Array.isArray(body.localBookings) ? body.localBookings : [];

    for (const booking of localBookings) {
      if (!booking || !booking.email) continue;

      try {
        const customerEmail = booking.email.trim();
        const customerName = (booking.customerName || 'Unknown').trim();
        const customerPhone = (booking.phone || '').trim();
        const customerAddress = booking.address?.trim();
        const issueDescription = (booking.issueDescription || booking.issue || 'No description').trim();

        // Find or create customer
        let customer = await prisma.customer.findUnique({
          where: { email: customerEmail }
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              address: customerAddress
            }
          });
        }

        // Check if an appointment already exists for this customer with similar device / date
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            customerId: customer.id,
            deviceType: booking.deviceType || undefined,
          }
        });

        if (existingAppointment) {
          // If there's a Repair with matching trackingId, link it to existing appointment
          if (booking.trackingId) {
            const matchingRepair = await prisma.repair.findUnique({
              where: { trackingId: booking.trackingId }
            });

            if (matchingRepair && !matchingRepair.appointmentId) {
              await prisma.repair.update({
                where: { id: matchingRepair.id },
                data: { appointmentId: existingAppointment.id }
              });
            }
          }
          continue;
        }

        const newAppointment = await prisma.appointment.create({
          data: {
            customerId: customer.id,
            deviceType: booking.deviceType || 'Unknown',
            deviceModel: booking.deviceModel || 'Unknown',
            issueDescription: issueDescription,
            serviceType: booking.serviceType || 'General Repair',
            preferredDate: booking.preferredDate || new Date().toISOString().split('T')[0],
            preferredTime: booking.preferredTime || '09:00',
            status: booking.status === 'received' ? 'pending' : (booking.status || 'pending')
          }
        });

        // If there's a Repair with matching trackingId, link it
        if (booking.trackingId) {
          const matchingRepair = await prisma.repair.findUnique({
            where: { trackingId: booking.trackingId }
          });

          if (matchingRepair && !matchingRepair.appointmentId) {
            await prisma.repair.update({
              where: { id: matchingRepair.id },
              data: { appointmentId: newAppointment.id }
            });
          }
        }

        syncedCount++;
      } catch (err) {
        console.error('Failed to sync local booking:', err);
      }
    }

    // 3. Database Cleanup Pass: Permanently remove any duplicate appointment records
    try {
      const allAppointments = await prisma.appointment.findMany({
        orderBy: { createdAt: 'desc' }
      });

      const seen = new Set<string>();
      const duplicatesToDelete: string[] = [];

      for (const app of allAppointments) {
        const sig = `${app.customerId}__${(app.deviceType || '').toLowerCase().trim()}__${(app.preferredDate || '').trim()}`;
        if (seen.has(sig)) {
          duplicatesToDelete.push(app.id);
        } else {
          seen.add(sig);
        }
      }

      if (duplicatesToDelete.length > 0) {
        await prisma.appointment.deleteMany({
          where: { id: { in: duplicatesToDelete } }
        });
      }
    } catch (cleanupErr) {
      console.warn('Duplicate cleanup notice:', cleanupErr);
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully synchronized booking records.`
    });
  } catch (error) {
    console.error('Error in appointment sync endpoint:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
