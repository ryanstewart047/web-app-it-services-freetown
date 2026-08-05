import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const FALLBACK_FILE = path.join(process.cwd(), 'data', 'legal_documents_fallback.json')

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
  } catch (e) {
    console.error('Fallback write error:', e)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    let docs = readFallback()
    if (search) {
      docs = docs.filter((d: any) =>
        [d.docNumber, d.signerName, d.recipientCompany, d.docType]
          .some((v: any) => v?.toLowerCase().includes(search))
      )
    }
    return NextResponse.json(docs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch legal documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    if (!data.signerName || !data.docType) {
      return NextResponse.json({ error: 'Signer name and Document type are required' }, { status: 400 })
    }

    const payload = {
      id: data.id || `doc_${Date.now()}`,
      docNumber: data.docNumber || `AUTH-${Date.now().toString().slice(-6)}`,
      docType: data.docType || 'authorization_letter',
      title: data.title || 'LETTER OF AUTHORIZATION',
      companyName: data.companyName || 'BridgeTech IT Services',
      companyAddress: data.companyAddress || '15 Siaka Stevens Street, Freetown, Sierra Leone',
      companyPhone: data.companyPhone || '+232 78 000 000 / +232 76 000 000',
      companyEmail: data.companyEmail || 'info@itservicesfreetown.com',
      signerName: data.signerName,
      signerRole: data.signerRole || 'Founder & Managing Director',
      signerEmail: data.signerEmail || '',
      signerPhone: data.signerPhone || '',
      recipientCompany: data.recipientCompany || 'TO WHOM IT MAY CONCERN',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      authorizationScope: data.authorizationScope || [],
      customDetails: data.customDetails || '',
      signatureDataUrl: data.signatureDataUrl || '',
      status: data.status || 'active',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docs = readFallback()
    const idx = docs.findIndex((d: any) => d.id === payload.id)
    if (idx >= 0) {
      docs[idx] = payload
    } else {
      docs.unshift(payload)
    }
    writeFallback(docs)

    return NextResponse.json({ success: true, document: payload })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    const docs = readFallback().filter((d: any) => d.id !== id)
    writeFallback(docs)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
