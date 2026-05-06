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
    let syncCount = 0

    // 1. Sync from Customers (source: appointment)
    const customers = await prisma.customer.findMany()
    for (const c of customers) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: c.email.toLowerCase(), source: 'appointment' }
      })
      if (!exists) {
        await prisma.emailLead.create({
          data: {
            email: c.email.toLowerCase().trim(),
            name: c.name.trim(),
            phone: c.phone.trim(),
            source: 'appointment',
            createdAt: c.createdAt // Preserve original date
          }
        })
        syncCount++
      }
    }

    // 2. Sync from Orders (source: order)
    const orders = await prisma.order.findMany()
    for (const o of orders) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: o.customerEmail.toLowerCase(), source: 'order' }
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
      where: { customerEmail: { not: null } }
    })
    for (const r of receipts) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: r.customerEmail!.toLowerCase(), source: 'receipt' }
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
      where: { email: { not: null } }
    })
    for (const d of donations) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: d.email!.toLowerCase(), source: 'donation' }
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
    const technicians = await prisma.technician.findMany()
    for (const t of technicians) {
      const exists = await prisma.emailLead.findFirst({
        where: { email: t.email.toLowerCase(), source: 'forum' }
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

    return NextResponse.json({ success: true, syncCount })
  } catch (error) {
    console.error('[EmailLead Sync] Error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
