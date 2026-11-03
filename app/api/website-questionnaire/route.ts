import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Required field validation
    const required = ['organizationName', 'contactName', 'email', 'websitePurpose', 'siteType']
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const submission = await prisma.websiteQuestionnaire.create({
      data: {
        organizationName:    String(body.organizationName).trim(),
        contactName:         String(body.contactName).trim(),
        email:               String(body.email).trim().toLowerCase(),
        phone:               body.phone ? String(body.phone).trim() : null,
        websitePurpose:      String(body.websitePurpose).trim(),
        siteType:            String(body.siteType).trim(),
        hasExistingDomain:   Boolean(body.hasExistingDomain),
        existingDomain:      body.existingDomain ? String(body.existingDomain).trim() : null,
        hasExistingBranding: Boolean(body.hasExistingBranding),
        brandingDescription: body.brandingDescription ? String(body.brandingDescription).trim() : null,
        hasContent:          Boolean(body.hasContent),
        contentDescription:  body.contentDescription ? String(body.contentDescription).trim() : null,
        hasHighQualityPhotos:Boolean(body.hasHighQualityPhotos),
        photosDescription:   body.photosDescription ? String(body.photosDescription).trim() : null,
        canMaintainSelf:     Boolean(body.canMaintainSelf),
        needsCMS:            Boolean(body.needsCMS),
        needsEcommerce:      Boolean(body.needsEcommerce),
        needsBooking:        Boolean(body.needsBooking),
        needsMultilingual:   Boolean(body.needsMultilingual),
        integrations:        body.integrations ? String(body.integrations).trim() : null,
        targetAudience:      body.targetAudience ? String(body.targetAudience).trim() : null,
        competitors:         body.competitors ? String(body.competitors).trim() : null,
        budgetRange:         body.budgetRange || null,
        timeline:            body.timeline || null,
        needsSEO:            Boolean(body.needsSEO),
        socialMediaLinks:    body.socialMediaLinks ? String(body.socialMediaLinks).trim() : null,
        additionalNotes:     body.additionalNotes ? String(body.additionalNotes).trim() : null,
        inspirationUrls:     body.inspirationUrls ? String(body.inspirationUrls).trim() : null,
        status:              'new',
      },
    })

    return NextResponse.json({ success: true, id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('[Website Questionnaire POST]', error)
    return NextResponse.json({ error: 'Failed to submit questionnaire. Please try again.' }, { status: 500 })
  }
}
