import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { captureEmailLead } from '@/lib/email-leads'

const prisma = new PrismaClient()
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'invoices_fallback.json')
const TMP_FALLBACK_FILE = path.join('/tmp', 'invoices_fallback.json')

function ensureDir(filePath: string) {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
}

function readFallback(): any[] {
  // Try primary fallback file in project data dir
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const content = fs.readFileSync(FALLBACK_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}

  // Try /tmp fallback
  try {
    if (fs.existsSync(TMP_FALLBACK_FILE)) {
      const content = fs.readFileSync(TMP_FALLBACK_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}

  return []
}

function writeFallback(data: any[]) {
  let written = false
  try {
    ensureDir(FALLBACK_FILE)
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8')
    written = true
  } catch (e) {
    // Expected on read-only environments like Vercel Lambda
  }

  try {
    fs.writeFileSync(TMP_FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8')
    written = true
  } catch (e) {
    console.error('Fallback write error:', e)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    const status = searchParams.get('status') || 'all'
    let dbInvoices: any[] = []
    let fallbackInvoices = readFallback()

    try {
      dbInvoices = await prisma.invoice.findMany({
        where: {
          AND: [
            status !== 'all' ? { status } : {},
            search ? { OR: [
              { clientName: { contains: search, mode: 'insensitive' } },
              { clientCompany: { contains: search, mode: 'insensitive' } },
              { invoiceNumber: { contains: search, mode: 'insensitive' } },
            ]} : {}
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    } catch (e) {
      console.warn('Prisma fetch invoice fallback to local data:', e)
    }

    // Filter fallback invoices
    let filteredFallback = fallbackInvoices
    if (status !== 'all') filteredFallback = filteredFallback.filter((i: any) => i.status === status)
    if (search) filteredFallback = filteredFallback.filter((i: any) =>
      [i.clientName, i.clientCompany, i.invoiceNumber, i.companyName].some((v: any) => v?.toLowerCase().includes(search))
    )

    // Merge without duplicates (DB takes priority, fallback adds any missing)
    const seen = new Set<string>()
    const merged: any[] = []

    for (const inv of dbInvoices) {
      if (inv.invoiceNumber && !seen.has(inv.invoiceNumber)) {
        seen.add(inv.invoiceNumber)
        // If items has company metadata attached, extract it
        let itemsData = inv.items
        let companyInfo: any = {}
        if (itemsData && typeof itemsData === 'object' && !Array.isArray(itemsData) && (itemsData as any).itemsList) {
          companyInfo = (itemsData as any).companyInfo || {}
          itemsData = (itemsData as any).itemsList
        }
        merged.push({
          ...inv,
          items: itemsData,
          companyName: companyInfo.companyName || inv.companyName || undefined,
          companyTagline: companyInfo.companyTagline || inv.companyTagline || undefined,
          companyAddress: companyInfo.companyAddress || inv.companyAddress || undefined,
          companyCityCountry: companyInfo.companyCityCountry || inv.companyCityCountry || undefined,
          companyPhone: companyInfo.companyPhone || inv.companyPhone || undefined,
          companyEmail: companyInfo.companyEmail || inv.companyEmail || undefined,
          payTo: companyInfo.payTo || inv.payTo || undefined,
        })
      }
    }

    for (const inv of filteredFallback) {
      if (inv.invoiceNumber && !seen.has(inv.invoiceNumber)) {
        seen.add(inv.invoiceNumber)
        merged.push(inv)
      }
    }

    return NextResponse.json(merged)
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const invoiceNumber = data.invoiceNumber?.trim() || `INV-${Date.now()}`;
    const clientName = data.clientName?.trim() || data.clientCompany?.trim() || 'Valued Client';

    // Extract company info
    const companyInfo = {
      companyName: data.companyName || 'BridgeTech IT Services',
      companyTagline: data.companyTagline || 'Professional IT Services & Hardware Repairs',
      companyAddress: data.companyAddress || 'No 1 Regent Highway, Jui Junction, Freetown',
      companyCityCountry: data.companyCityCountry || 'Freetown, Sierra Leone',
      companyPhone: data.companyPhone || '+232 33 399 391 / +232 76 210 320',
      companyEmail: data.companyEmail || 'support@itservicesfreetown.com',
      payTo: data.payTo || data.companyName || 'BridgeTech IT Services',
    }

    // Clean items list
    const itemsList = Array.isArray(data.items) ? data.items : []

    // Pack items and company metadata so it survives Prisma Json field
    const itemsPayload = {
      itemsList: itemsList,
      companyInfo: companyInfo
    }

    const payload = {
      invoiceNumber: data.invoiceNumber,
      clientName: data.clientName,
      clientCompany: data.clientCompany || '',
      clientEmail: data.clientEmail || '',
      clientPhone: data.clientPhone || '',
      clientAddress: data.clientAddress || '',
      clientTaxId: data.clientTaxId || '',
      invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      paymentTerms: data.paymentTerms || 'Net 14',
      status: data.status || 'pending',
      items: itemsPayload,
      subtotal: parseFloat(data.subtotal || 0),
      taxRate: parseFloat(data.taxRate || 0),
      taxAmount: parseFloat(data.taxAmount || 0),
      discountAmount: parseFloat(data.discountAmount || 0),
      amountPaid: parseFloat(data.amountPaid || 0),
      totalAmount: parseFloat(data.totalAmount || 0),
      balanceDue: parseFloat(data.balanceDue || 0),
      notes: data.notes || '',
      paymentInstructions: data.paymentInstructions || ''
    }

    let saved: any = null

    // 1. Try Prisma DB Save
    try {
      const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: data.invoiceNumber } })
      saved = existing
        ? await prisma.invoice.update({ where: { invoiceNumber: data.invoiceNumber }, data: payload })
        : await prisma.invoice.create({ data: payload })
    } catch (dbErr) {
      console.warn('Prisma invoice save failed, using local file backup:', dbErr)
    }

    // 2. Always update local fallback
    const fallback = readFallback()
    const idx = fallback.findIndex((i: any) => i.invoiceNumber === data.invoiceNumber)
    const obj = {
      id: saved?.id || (idx >= 0 ? fallback[idx].id : `inv_${Date.now()}`),
      ...payload,
      items: itemsList,
      ...companyInfo,
      createdAt: saved?.createdAt || (idx >= 0 ? fallback[idx].createdAt : new Date().toISOString()),
      updatedAt: new Date().toISOString()
    }

    if (idx >= 0) {
      fallback[idx] = obj
    } else {
      fallback.unshift(obj)
    }
    writeFallback(fallback)

    if (!saved) {
      saved = obj
    } else {
      saved = {
        ...saved,
        items: itemsList,
        ...companyInfo
      }
    }

    // Capture email lead silently if client email was provided
    if (data.clientEmail) {
      try {
        captureEmailLead({
          email: data.clientEmail,
          name: data.clientName,
          phone: data.clientPhone,
          source: 'invoice'
        })
      } catch {}
    }

    return NextResponse.json({ success: true, invoice: saved })
  } catch (error) {
    console.error('Invoice save route exception:', error)
    return NextResponse.json({ error: 'Failed to save invoice', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceNumber = searchParams.get('invoiceNumber')
    if (!invoiceNumber) return NextResponse.json({ error: 'Invoice number required' }, { status: 400 })

    try {
      await prisma.invoice.delete({ where: { invoiceNumber } })
    } catch (e) {
      console.warn('Prisma invoice delete failed or not found in DB:', e)
    }

    const fallback = readFallback().filter((i: any) => i.invoiceNumber !== invoiceNumber)
    writeFallback(fallback)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice delete error:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
