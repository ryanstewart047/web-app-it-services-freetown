import { NextResponse } from 'next/server'
import { createOffer, updateOffer, deactivateOffer, getOfferForAdmin } from '@/lib/offer-storage'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('[Offer Manage] Starting offer save...')
    const { title, description, imageUrl, buttonText, buttonLink, buttonColor, backgroundColor, textColor, badgeColor, badgeText, termsText, isActive } = await request.json()

    console.log('[Offer Manage] Received data:', { title, badgeText, isActive })

    // SERVER-SIDE VALIDATION - Prevent XSS and invalid data ✅
    
    // Title validation (3-100 characters)
    if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title must be 3-100 characters' },
        { status: 400 }
      )
    }

    // Description validation (10-500 characters)
    if (!description || typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'Description must be 10-500 characters' },
        { status: 400 }
      )
    }

    // Image URL validation (optional but must be valid if provided)
    if (imageUrl && imageUrl.trim()) {
      try {
        const url = new URL(imageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'Invalid image URL - must be HTTP or HTTPS' },
          { status: 400 }
        );
      }
    }

    // Button URL validation (optional but must be valid if provided)
    if (buttonLink && buttonLink.trim()) {
      try {
        const url = new URL(buttonLink);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'Invalid button URL - must be HTTP or HTTPS' },
          { status: 400 }
        );
      }
    }

    // Sanitize inputs to prevent XSS
    const sanitizedTitle = title.trim().replace(/[<>]/g, '');
    const sanitizedDescription = description.trim().replace(/[<>]/g, '');
    const sanitizedButtonText = buttonText ? buttonText.trim().replace(/[<>]/g, '') : buttonText;
    const sanitizedBadgeText = badgeText ? badgeText.trim().replace(/[<>]/g, '').toUpperCase() : "TODAY'S OFFER";
    const sanitizedTermsText = termsText ? termsText.trim().replace(/[<>]/g, '') : termsText;

    // Check if offer exists (get for admin to see inactive offers too)
    console.log('[Offer Manage] Checking for existing offer...')
    const currentOffer = await getOfferForAdmin()
    console.log('[Offer Manage] Current offer exists:', !!currentOffer)

    let success
    if (currentOffer) {
      // Update existing offer (use sanitized values)
      console.log('[Offer Manage] Updating existing offer...')
      success = await updateOffer({
        title: sanitizedTitle,
        description: sanitizedDescription,
        imageUrl,
        buttonText: sanitizedButtonText,
        buttonLink,
        buttonColor,
        backgroundColor,
        textColor,
        badgeColor,
        badgeText: sanitizedBadgeText,
        termsText: sanitizedTermsText,
        isActive,
      })
      console.log('[Offer Manage] Update result:', success)
    } else {
      // Create new offer (use sanitized values)
      console.log('[Offer Manage] Creating new offer...')
      await createOffer(sanitizedTitle, sanitizedDescription, imageUrl, sanitizedButtonText, buttonLink, buttonColor, backgroundColor, textColor, badgeColor, sanitizedBadgeText, sanitizedTermsText)
      success = true
      console.log('[Offer Manage] Create completed')
    }

    if (success) {
      console.log('[Offer Manage] ✅ Offer saved successfully')
      return NextResponse.json({ success: true })
    } else {
      console.error('[Offer Manage] ❌ Save failed')
      return NextResponse.json(
        { success: false, error: 'Failed to save offer to storage' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in offer manage API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
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
