import { NextResponse } from 'next/server'
import { getOfferForAdmin } from '@/lib/offer-storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const offer = await getOfferForAdmin()
    
    return NextResponse.json({ 
      success: true, 
      offer 
    })
  } catch (error) {
    console.error('Error in offer admin API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offer' },
      { status: 500 }
    )
  }
}
