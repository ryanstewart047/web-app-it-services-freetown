import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Read optional `since` timestamp from the request body.
    // If provided, only import source records created AFTER this date.
    // This is the "high-watermark" that prevents deleted leads from
    // being re-imported on subsequent syncs.
    let sinceDate: Date | undefined = undefined
    try {
      const body = await request.json()
      if (body?.since) {
        sinceDate = new Date(body.since)
        // Validate the date is sensible
        if (isNaN(sinceDate.getTime())) sinceDate = undefined
      }
    } catch {
      // No body or invalid JSON – treat as first-time full sync
    }

    const dateFilter = sinceDate ? { gt: sinceDate } : undefined
    let syncCount = 0

    // 1. Sync from Customers (source: appointment)
    const customers = await prisma.customer.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined
    })
    for (const c of customers) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: c.email.toLowerCase() }
      })
      if (!exists) {
        await prisma.emailLead.create({
          data: {
            email: c.email.toLowerCase().trim(),
            name: c.name.trim(),
            phone: c.phone.trim(),
            source: 'appointment',
            createdAt: c.createdAt
          }
        })
        syncCount++
      }
    }

    // 2. Sync from Orders (source: order)
    const orders = await prisma.order.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined
    })
    for (const o of orders) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: o.customerEmail.toLowerCase() }
      })
      if (!exists) {
        await prisma.emailLead.create({
          data: {
            email: o.customerEmail.toLowerCase().trim(),
            name: o.customerName.trim(),
            phone: o.customerPhone.trim(),
            source: 'order',
            createdAt: o.createdAt
          }
        })
        syncCount++
      }
    }

    // 3. Sync from Receipts (source: receipt)
    const receipts = await prisma.receipt.findMany({
      where: {
        customerEmail: { not: null },
        ...(dateFilter ? { createdAt: dateFilter } : {})
      }
    })
    for (const r of receipts) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: r.customerEmail!.toLowerCase() }
      })
      if (!exists) {
        await prisma.emailLead.create({
          data: {
            email: r.customerEmail!.toLowerCase().trim(),
            name: r.customerName.trim(),
            phone: r.customerPhone.trim(),
            source: 'receipt',
            createdAt: r.createdAt
          }
        })
        syncCount++
      }
    }

    // 4. Sync from Donations (source: donation)
    const donations = await prisma.donation.findMany({
      where: {
        email: { not: null },
        ...(dateFilter ? { createdAt: dateFilter } : {})
      }
    })
    for (const d of donations) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: d.email!.toLowerCase() }
      })
      if (!exists) {
        await prisma.emailLead.create({
          data: {
            email: d.email!.toLowerCase().trim(),
            name: d.name.trim(),
            phone: d.phone?.trim() || null,
            source: 'donation',
            createdAt: d.createdAt
          }
        })
        syncCount++
      }
    }

    // 5. Sync from Technicians (source: forum)
    const technicians = await prisma.technician.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined
    })
    for (const t of technicians) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: t.email.toLowerCase() }
      })
      if (!exists) {
        await prisma.emailLead.create({
          data: {
            email: t.email.toLowerCase().trim(),
            name: t.name.trim(),
            phone: t.phone.trim(),
            source: 'forum',
            createdAt: t.createdAt
          }
        })
        syncCount++
      }
    }

    return NextResponse.json({
      success: true,
      syncCount,
      syncedAt: new Date().toISOString(),
      incremental: !!sinceDate
    })
  } catch (error) {
    console.error('[EmailLead Sync] Error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
