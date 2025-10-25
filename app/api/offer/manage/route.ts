import { NextResponse } from 'next/server'
import { createOffer, updateOffer, deactivateOffer, getOfferForAdmin } from '@/lib/offer-storage'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { title, description, imageUrl, isActive } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Check if offer exists (get for admin to see inactive offers too)
    const currentOffer = await getOfferForAdmin()

    let success
    if (currentOffer) {
      // Update existing offer
      success = await updateOffer({
        title,
        description,
        imageUrl,
        isActive,
      })
    } else {
      // Create new offer
      await createOffer(title, description, imageUrl)
      success = true
    }

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save offer' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in offer manage API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const success = await deactivateOffer()

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to deactivate offer' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deactivating offer:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
