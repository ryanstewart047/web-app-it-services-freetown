import { NextResponse } from 'next/server'
import { getPublicShirleyGalleryItems } from '@/lib/shirley-gallery-storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await getPublicShirleyGalleryItems()
    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('[Shirley Gallery Public API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load gallery items.' },
      { status: 500 }
    )
  }
}
