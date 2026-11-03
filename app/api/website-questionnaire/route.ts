import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendQuestionnaireNotifications } from '@/lib/website-questionnaire-email'

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

    // Send automatic client receipt & admin notification email
    sendQuestionnaireNotifications({
      submissionId: submission.id,
      organizationName: submission.organizationName,
      contactName: submission.contactName,
      email: submission.email,
      phone: submission.phone,
      websitePurpose: submission.websitePurpose,
      siteType: submission.siteType,
      hasExistingDomain: submission.hasExistingDomain,
      existingDomain: submission.existingDomain,
      hasExistingBranding: submission.hasExistingBranding,
      brandingDescription: submission.brandingDescription,
      hasHighQualityPhotos: submission.hasHighQualityPhotos,
      photosDescription: submission.photosDescription,
      hasContent: submission.hasContent,
      contentDescription: submission.contentDescription,
      canMaintainSelf: submission.canMaintainSelf,
      needsCMS: submission.needsCMS,
      needsEcommerce: submission.needsEcommerce,
      needsBooking: submission.needsBooking,
      needsMultilingual: submission.needsMultilingual,
      needsSEO: submission.needsSEO,
      integrations: submission.integrations,
      targetAudience: submission.targetAudience,
      competitors: submission.competitors,
      budgetRange: submission.budgetRange,
      timeline: submission.timeline,
      socialMediaLinks: submission.socialMediaLinks,
      inspirationUrls: submission.inspirationUrls,
      additionalNotes: submission.additionalNotes,
      createdAt: submission.createdAt.toISOString(),
    }).catch(err => {
      console.error('[Questionnaire Auto-Email Background]', err)
    })

    return NextResponse.json({ success: true, id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('[Website Questionnaire POST]', error)
    return NextResponse.json({ error: 'Failed to submit questionnaire. Please try again.' }, { status: 500 })
  }
}
