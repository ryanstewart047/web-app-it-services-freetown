import { NextResponse } from 'next/server'
import { createOffer, updateOffer, deactivateOffer, getOfferForAdmin } from '@/lib/offer-storage'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { title, description, imageUrl, buttonText, buttonLink, buttonColor, backgroundColor, textColor, badgeColor, termsText, isActive } = await request.json()

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
    const sanitizedTermsText = termsText ? termsText.trim().replace(/[<>]/g, '') : termsText;

    // Check if offer exists (get for admin to see inactive offers too)
    const currentOffer = await getOfferForAdmin()

    let success
    if (currentOffer) {
      // Update existing offer (use sanitized values)
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
        termsText: sanitizedTermsText,
        isActive,
      })
    } else {
      // Create new offer (use sanitized values)
      await createOffer(sanitizedTitle, sanitizedDescription, imageUrl, sanitizedButtonText, buttonLink, buttonColor, backgroundColor, textColor, badgeColor, sanitizedTermsText)
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
