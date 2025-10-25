import { NextResponse } from 'next/server'
import { getCurrentOffer } from '@/lib/offer-storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const offer = await getCurrentOffer()
    
    return NextResponse.json({ 
      success: true, 
      offer 
    })
  } catch (error) {
    console.error('Error in offer API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offer' },
      { status: 500 }
    )
  }
}
