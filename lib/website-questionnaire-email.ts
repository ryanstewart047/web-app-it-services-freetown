import { sendEmail } from '@/lib/email'

export interface QuestionnaireEmailInput {
  submissionId: string
  organizationName: string
  contactName: string
  email: string
  phone?: string | null
  preferredContactMethod?: string | null
  websitePurpose: string
  siteType: string
  hasExistingDomain: boolean
  domainStatus?: string | null
  existingDomain?: string | null
  hasExistingBranding: boolean
  brandingDescription?: string | null
  brandColors?: string | null
  hasHighQualityPhotos: boolean
  photosDescription?: string | null
  hasContent: boolean
  contentDescription?: string | null
  wantsContentWriting?: boolean
  wantsGraphicDesign?: boolean
  pageCount?: string | null
  needsHosting?: boolean
  canMaintainSelf: boolean
  needsCMS: boolean
  needsEcommerce: boolean
  needsBooking: boolean
  needsMultilingual: boolean
  needsSEO: boolean
  integrations?: string | null
  targetAudience?: string | null
  competitors?: string | null
  budgetRange?: string | null
  timeline?: string | null
  targetDeadline?: string | null
  socialMediaLinks?: string | null
  inspirationUrls?: string | null
  additionalNotes?: string | null
  createdAt?: string
}

const SITE_TYPE_LABELS: Record<string, string> = {
  static: 'Static / Brochure Website',
  dynamic: 'Dynamic Content / CMS / Blog',
  ecommerce: 'E-Commerce / Online Store',
  portfolio: 'Portfolio / Creative Showcase',
  unsure: 'Needs Consultation / Not Sure Yet',
}

const BUDGET_LABELS: Record<string, string> = {
  '200-500': '$200 – $500 (Starter / Landing Page / Micro-site)',
  '500-1000': '$500 – $1,000 (Small Business / Brochure)',
  'under-1000': 'Under $1,000 (Starter / Basic)',
  '1000-3000': '$1,000 – $3,000 (Small Business)',
  '3000-10000': '$3,000 – $10,000 (Custom / Feature-Rich)',
  '10000+': '$10,000+ (Enterprise / Complex System)',
  flexible: 'Flexible / Open to Quote',
}

const TIMELINE_LABELS: Record<string, string> = {
  'urgent-2weeks': 'ASAP (< 2 Weeks)',
  '1-month': 'Within 1 Month',
  '2-3-months': '2 – 3 Months',
  flexible: 'Flexible / No Rush',
}

const PAGE_COUNT_LABELS: Record<string, string> = {
  '1-landing': '1 Page (Landing Page / One-Pager)',
  '3-5-pages': '3 – 5 Pages (Standard Business)',
  '6-10-pages': '6 – 10 Pages (Expanded Catalog / Sections)',
  '10-plus': '10+ Pages (Large Portal / Corporate)',
  unsure: 'Not Sure Yet / Guidance Needed',
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sends an automated confirmation email to the client and an internal notification to the admin team.
 */
export async function sendQuestionnaireNotifications(input: QuestionnaireEmailInput) {
  const refCode = input.submissionId.slice(-8).toUpperCase()
  const siteTypeFormatted = SITE_TYPE_LABELS[input.siteType] || input.siteType
  const budgetFormatted = BUDGET_LABELS[input.budgetRange || ''] || input.budgetRange || 'Flexible / To be discussed'
  const timelineFormatted = TIMELINE_LABELS[input.timeline || ''] || input.timeline || 'Flexible'
  const pageCountFormatted = PAGE_COUNT_LABELS[input.pageCount || ''] || input.pageCount || 'Not specified'

  // Domain display text
  let domainText = 'No domain specified'
  if (input.domainStatus === 'need-domain') {
    domainText = input.existingDomain
      ? `Needs New Registration (Requested: ${escapeHtml(input.existingDomain)})`
      : 'We do not have a domain name yet (Needs registration)'
  } else if (input.domainStatus === 'have-domain' || input.hasExistingDomain) {
    domainText = input.existingDomain
      ? `Already Owned: ${escapeHtml(input.existingDomain)}`
      : 'Client already owns a domain'
  } else if (input.domainStatus === 'unsure') {
    domainText = 'Guidance Needed (Not sure yet)'
  }

  // Parse brand colors if any
  let brandColorsFormatted = ''
  if (input.brandColors) {
    try {
      const parsed = JSON.parse(input.brandColors)
      if (typeof parsed === 'object') {
        const parts: string[] = []
        if (parsed.primary) parts.push(`Primary: ${parsed.primary}`)
        if (parsed.secondary) parts.push(`Secondary: ${parsed.secondary}`)
        if (parsed.accent) parts.push(`Accent: ${parsed.accent}`)
        brandColorsFormatted = parts.join(' | ')
      } else {
        brandColorsFormatted = String(input.brandColors)
      }
    } catch {
      brandColorsFormatted = String(input.brandColors)
    }
  }

  const featuresList: string[] = []
  if (input.needsCMS) featuresList.push('Content Management System (CMS)')
  if (input.needsEcommerce) featuresList.push('E-Commerce / Online Store & Payments')
  if (input.needsBooking) featuresList.push('Online Booking / Appointments')
  if (input.needsMultilingual) featuresList.push('Multi-language Support')
  if (input.needsSEO) featuresList.push('SEO Optimization Package')
  if (input.needsHosting) featuresList.push('Web Hosting & Business Email')
  if (input.canMaintainSelf) featuresList.push('Client Self-Maintenance')
  if (featuresList.length === 0) featuresList.push('Standard Presentation Website')

  const addOnServices: string[] = []
  if (input.domainStatus === 'need-domain') addOnServices.push('Domain Name Registration (Annual registry fee)')
  if (input.wantsContentWriting) addOnServices.push('Professional Copywriting & Content Writing')
  if (input.wantsGraphicDesign) addOnServices.push('Custom Graphic Design & Photo Editing')
  if (input.needsHosting) addOnServices.push('Cloud Hosting & Business Email Infrastructure')

  // ── 1. Client Confirmation Email HTML ──
  const clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt Confirmation - Website Project Brief</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="620px" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Navy Brand Header -->
          <tr>
            <td style="background-color: #040e40; padding: 32px 30px; text-align: center; border-bottom: 4px solid #ef4444;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">BRIDGETECH IT SERVICES</h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Website Development & Digital Solutions</p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; color: #047857; font-size: 15px; font-weight: 700;">
                  ✓ Project Brief Received Successfully
                </p>
                <p style="margin: 4px 0 0 0; color: #065f46; font-size: 12px;">
                  Reference ID: <strong style="font-family: monospace; letter-spacing: 1px;">#${refCode}</strong>
                </p>
              </div>

              <h2 style="margin: 0 0 12px 0; color: #040e40; font-size: 20px; font-weight: 700;">
                Hello ${escapeHtml(input.contactName)},
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                Thank you for submitting your website project brief for <strong>${escapeHtml(input.organizationName)}</strong>. We have received your specifications and our team is already reviewing your requirements.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                Below is a full receipt and summary of the specifications you submitted:
              </p>

              <!-- Summary Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 38%;"><strong>Organisation:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 600;">${escapeHtml(input.organizationName)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Contact Person:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a;">${escapeHtml(input.contactName)} (${escapeHtml(input.preferredContactMethod ? input.preferredContactMethod.toUpperCase() : 'WHATSAPP')})</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Email / Phone:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a;">${escapeHtml(input.email)} ${input.phone ? `• ${escapeHtml(input.phone)}` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Website Type:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 600;">${escapeHtml(siteTypeFormatted)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Estimated Page Count:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a;">${escapeHtml(pageCountFormatted)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Domain Status:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 600;">${domainText}</td>
                </tr>
                ${brandColorsFormatted ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Brand Colours:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-family: monospace;">${escapeHtml(brandColorsFormatted)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Budget Range:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 600; color: #047857;">${escapeHtml(budgetFormatted)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Target Timeline:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a;">${escapeHtml(timelineFormatted)}${input.targetDeadline ? ` (Deadline: ${escapeHtml(input.targetDeadline)})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Assets Readiness:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a;">
                    ${input.hasExistingBranding ? '✓ Has Branding' : '✗ Needs Branding'} • 
                    ${input.hasHighQualityPhotos ? '✓ Photos Ready' : '✗ Needs Photos'} • 
                    ${input.hasContent ? '✓ Copy Ready' : '✗ Needs Copywriting'}
                  </td>
                </tr>
                ${addOnServices.length > 0 ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Add-on Services Requested:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #b45309; font-weight: 600;">
                    ${addOnServices.map(s => `• ${escapeHtml(s)}`).join('<br>')}
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;"><strong>Features Required:</strong></td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a;">
                    ${featuresList.map(f => `<span style="display:inline-block; background-color:#e2e8f0; color:#1e293b; padding:2px 8px; border-radius:6px; font-size:11px; margin:2px 2px 2px 0;">${escapeHtml(f)}</span>`).join('')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; vertical-align: top;"><strong>Primary Purpose:</strong></td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; line-height: 1.5;">${escapeHtml(input.websitePurpose)}</td>
                </tr>
              </table>

              <!-- Add-on Costs Transparency Note -->
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #854d0e;">💡 Transparency Note Regarding Add-on Services:</p>
                <p style="margin: 6px 0 0 0; font-size: 12px; line-height: 1.6; color: #713f12;">
                  Please note that purchasing a domain name ($15–$50/yr registry fee), custom graphic design / photo retouching, and professional copywriting are specialized services that carry an extra fee beyond base website development. Our team will provide an itemized, transparent cost breakdown in your proposal.
                </p>
              </div>

              <!-- Next Steps Box -->
              <div style="background-color: #f8fafc; border-left: 4px solid #040e40; padding: 18px; border-radius: 8px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 10px 0; color: #040e40; font-size: 15px; font-weight: 700;">What Happens Next?</h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                  <li style="margin-bottom: 6px;"><strong>Technical Scope Analysis:</strong> Our lead developer reviews your functional needs and scope.</li>
                  <li style="margin-bottom: 6px;"><strong>Consultation & Clarification:</strong> We will contact you within <strong>1–2 business days</strong> via ${escapeHtml(input.preferredContactMethod || 'WhatsApp')} to discuss your timeline and specifics.</li>
                  <li><strong>Custom Proposal & Quote:</strong> We deliver a structured proposal with milestones, design mockups, and cost breakdown.</li>
                </ol>
              </div>

              <!-- Quick action / Call button -->
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="https://wa.me/23233399391?text=${encodeURIComponent(`Hello BridgeTech team, I just submitted website brief #${refCode} for ${input.organizationName}.`)}" style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; margin-right: 8px;">
                  Chat on WhatsApp
                </a>
                <a href="tel:+23233399391" style="display: inline-block; background-color: #040e40; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none;">
                  Call +232 33 399 391
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #040e40; padding: 24px 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #ffffff; font-weight: 600;">BridgeTech IT Services</p>
              <p style="margin: 0 0 6px 0;">#1 Regent Highway, Jui Junction, Freetown, Sierra Leone</p>
              <p style="margin: 0;">Phone: +232 33 399 391 • Email: info@itservicesfreetown.com • Web: www.itservicesfreetown.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  // ── 2. Admin Notification Email HTML ──
  const adminRecipient = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'support@itservicesfreetown.com'
  const adminHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; color: #1e293b; background: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
    <div style="background: #040e40; color: #fff; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 18px;">🔔 New Website Project Brief Received</h2>
      <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Ref: #${refCode} • ${new Date().toLocaleString()}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Organisation:</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${escapeHtml(input.organizationName)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Contact:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(input.contactName)} (${escapeHtml(input.preferredContactMethod || 'WhatsApp')})</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Phone:</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="tel:${escapeHtml(input.phone || '')}">${escapeHtml(input.phone || 'N/A')}</a></td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Site Type:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(siteTypeFormatted)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Page Count:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(pageCountFormatted)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Domain:</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">${domainText}</td></tr>
      ${brandColorsFormatted ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Brand Colours:</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-family: monospace;">${escapeHtml(brandColorsFormatted)}</td></tr>` : ''}
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Budget:</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #047857;">${escapeHtml(budgetFormatted)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748b;">Timeline:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(timelineFormatted)}</td></tr>
      ${addOnServices.length > 0 ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #b45309;">Add-on Requests:</td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #b45309; font-weight: 600;">${addOnServices.map(s => escapeHtml(s)).join(', ')}</td></tr>` : ''}
      <tr><td style="padding: 8px; color: #64748b; vertical-align: top;">Purpose:</td><td style="padding: 8px;">${escapeHtml(input.websitePurpose)}</td></tr>
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://www.itservicesfreetown.com/admin?tab=website-questionnaire" style="display: inline-block; background: #ef4444; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
        Open in Admin Console →
      </a>
    </div>
  </div>
</body>
</html>
  `

  // Send client confirmation
  const clientPromise = sendEmail({
    to: input.email,
    subject: `Receipt Confirmation: Website Project Brief #${refCode} - BridgeTech IT Services`,
    html: clientHtml,
    text: `Hello ${input.contactName},\n\nThank you for submitting your website project brief for ${input.organizationName} (Ref: #${refCode}).\n\nWe have received your specifications and our team will review them and reach out within 1-2 business days.\n\nNote: Domain registration, custom graphic design, and content writing are specialized add-on services that carry an extra fee.\n\nBridgeTech IT Services\nPhone: +232 33 399 391\ninfo@itservicesfreetown.com`,
  }).catch(err => {
    console.error('[Email Notification] Failed to send client receipt email:', err)
    return { success: false, error: String(err) }
  })

  // Send admin notification
  const adminPromise = sendEmail({
    to: adminRecipient,
    subject: `🔔 New Website Brief: ${input.organizationName} (${input.contactName})`,
    html: adminHtml,
    text: `New Website Project Brief received from ${input.contactName} (${input.organizationName}). Email: ${input.email}, Phone: ${input.phone || 'N/A'}. Budget: ${budgetFormatted}. Open admin: https://www.itservicesfreetown.com/admin?tab=website-questionnaire`,
  }).catch(err => {
    console.error('[Email Notification] Failed to send admin alert email:', err)
    return { success: false, error: String(err) }
  })

  const [clientRes, adminRes] = await Promise.all([clientPromise, adminPromise])
  console.log('[sendQuestionnaireNotifications] Outcome -> Client:', JSON.stringify(clientRes), 'Admin:', JSON.stringify(adminRes))
  return { clientRes, adminRes }
}
