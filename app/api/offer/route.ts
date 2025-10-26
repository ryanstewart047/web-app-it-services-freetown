import { NextResponse } from 'next/server'
import { getCurrentOffer } from '@/lib/offer-storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('[Offer API] GET request received')
    const offer = await getCurrentOffer()
    
    console.log('[Offer API] Offer retrieved:', offer ? offer.title : 'null')
    
    return NextResponse.json({ 
      success: true, 
      offer 
    })
  } catch (error) {
    console.error('[Offer API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offer' },
      { status: 500 }
    )
  }
}
