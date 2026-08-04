import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'invoices_fallback.json')

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readFallback(): any[] {
  try {
    if (fs.existsSync(FALLBACK_FILE)) return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf-8'))
  } catch {}
  return []
}

function writeFallback(data: any[]) {
  try {
    ensureDir(FALLBACK_FILE)
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) { console.error('Fallback write error:', e) }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    const status = searchParams.get('status') || 'all'
    let invoices: any[] = []

    try {
      invoices = await prisma.invoice.findMany({
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
    } catch {
      invoices = readFallback()
      if (status !== 'all') invoices = invoices.filter((i: any) => i.status === status)
      if (search) invoices = invoices.filter((i: any) =>
        [i.clientName, i.clientCompany, i.invoiceNumber].some((v: any) => v?.toLowerCase().includes(search))
      )
    }
    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    if (!data.invoiceNumber || !data.clientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
      items: data.items,
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
    try {
      const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: data.invoiceNumber } })
      saved = existing
        ? await prisma.invoice.update({ where: { invoiceNumber: data.invoiceNumber }, data: payload })
        : await prisma.invoice.create({ data: payload })
    } catch {
      const fallback = readFallback()
      const idx = fallback.findIndex((i: any) => i.invoiceNumber === data.invoiceNumber)
      const obj = {
        id: idx >= 0 ? fallback[idx].id : `inv_${Date.now()}`,
        ...payload,
        createdAt: idx >= 0 ? fallback[idx].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      idx >= 0 ? (fallback[idx] = obj) : fallback.unshift(obj)
      writeFallback(fallback)
      saved = obj
    }
    return NextResponse.json({ success: true, invoice: saved })
  } catch (error) {
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
    } catch {
      const fallback = readFallback().filter((i: any) => i.invoiceNumber !== invoiceNumber)
      writeFallback(fallback)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
