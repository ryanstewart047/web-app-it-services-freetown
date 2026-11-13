import jsPDF from 'jspdf'

export interface BrandColors {
  primary?: string
  secondary?: string
  accent?: string
}

export interface QuestionnaireData {
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
  brandColors?: string | BrandColors | null
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
  '200-500': '$200 – $500 (Starter / Landing Page)',
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

/**
 * Builds a styled, multi-page PDF document for a website development questionnaire
 */
export function generateQuestionnairePDF(
  data: QuestionnaireData,
  options?: { submissionId?: string; isBlankForm?: boolean }
): jsPDF {
  const isBlank = options?.isBlankForm ?? false
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function drawHeader() {
    // Navy top bar
    doc.setFillColor(4, 14, 64) // #040e40
    doc.rect(0, 0, pageWidth, 30, 'F')

    // Red accent line
    doc.setFillColor(239, 68, 68) // #ef4444
    doc.rect(0, 30, pageWidth, 2.5, 'F')

    // ── BridgeTech Shield Logo Emblem ──
    doc.setFillColor(239, 68, 68) // Red outer shield
    doc.roundedRect(margin, 5.5, 14, 18, 2, 2, 'F')
    doc.setFillColor(4, 14, 64) // Navy inner shield
    doc.roundedRect(margin + 1, 6.5, 12, 16, 1.5, 1.5, 'F')
    // B (white) and S (red) monogram
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('B', margin + 3, 17.5)
    doc.setTextColor(239, 68, 68)
    doc.text('S', margin + 7.5, 17.5)

    // Header brand typography next to shield
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('BridgeTech', margin + 18, 13)

    doc.setTextColor(239, 68, 68)
    doc.setFontSize(9)
    doc.text('IT SERVICES', margin + 46, 13)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(203, 213, 225)
    doc.text(
      isBlank
        ? 'WEBSITE DEVELOPMENT CLIENT DISCOVERY QUESTIONNAIRE'
        : 'WEBSITE PROJECT BRIEF & TECHNICAL SPECIFICATION',
      margin + 18,
      19
    )

    // Meta details on the right
    doc.setFontSize(8)
    doc.setTextColor(200, 210, 230)
    const dateStr = data.createdAt
      ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    doc.text(`Date: ${dateStr}`, pageWidth - margin, 12, { align: 'right' })

    if (options?.submissionId) {
      doc.text(`Ref: #${options.submissionId.slice(-8).toUpperCase()}`, pageWidth - margin, 18, { align: 'right' })
    } else if (isBlank) {
      doc.text('Standard Client Intake Form', pageWidth - margin, 18, { align: 'right' })
    }

    y = 40
  }

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage()
      // Mini header for continuation pages
      doc.setFillColor(4, 14, 64)
      doc.rect(0, 0, pageWidth, 13, 'F')
      doc.setFillColor(239, 68, 68)
      doc.rect(0, 13, pageWidth, 1.5, 'F')

      // Mini shield emblem
      doc.setFillColor(239, 68, 68)
      doc.roundedRect(margin, 2, 7, 9, 1, 1, 'F')
      doc.setFillColor(4, 14, 64)
      doc.roundedRect(margin + 0.5, 2.5, 6, 8, 0.8, 0.8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(255, 255, 255)
      doc.text('B', margin + 1.5, 8)
      doc.setTextColor(239, 68, 68)
      doc.text('S', margin + 3.8, 8)

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('BridgeTech IT Services  •  Website Project Brief', margin + 10, 8.5)

      y = 22
    }
  }

  function sectionHeader(title: string, iconNumber: string) {
    checkPageBreak(14)
    // Section header badge
    doc.setFillColor(4, 14, 64)
    doc.roundedRect(margin, y, 6, 6, 1, 1, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(iconNumber, margin + 3, y + 4.2, { align: 'center' })

    doc.setTextColor(4, 14, 64)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(title.toUpperCase(), margin + 9, y + 4.5)

    // Underline rule
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.4)
    doc.line(margin, y + 7.5, pageWidth - margin, y + 7.5)

    y += 11
  }

  function fieldRow(label: string, value: string | boolean | undefined | null) {
    checkPageBreak(9)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105) // slate-600
    doc.text(label, margin, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42) // slate-900

    let valStr = ''
    if (typeof value === 'boolean') {
      valStr = value ? 'YES' : 'NO'
    } else {
      valStr = value && String(value).trim() ? String(value).trim() : '—'
    }

    const lines = doc.splitTextToSize(valStr, contentWidth - 65)
    doc.text(lines, margin + 65, y)
    y += Math.max(lines.length * 4.5, 6)
  }

  function fieldTextBlock(label: string, text: string | undefined | null, blankPlaceholderLines = 3) {
    checkPageBreak(16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105)
    doc.text(label, margin, y)
    y += 4.5

    if (isBlank) {
      for (let i = 0; i < blankPlaceholderLines; i++) {
        checkPageBreak(7)
        doc.setDrawColor(203, 213, 225)
        doc.setLineWidth(0.2)
        doc.line(margin, y + 4, pageWidth - margin, y + 4)
        y += 6
      }
      y += 2
      return
    }

    const content = text && text.trim() ? text.trim() : 'None provided'
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(15, 23, 42)

    // Soft background box
    const lines = doc.splitTextToSize(content, contentWidth - 6)
    const boxHeight = lines.length * 4 + 4
    checkPageBreak(boxHeight + 2)

    doc.setFillColor(248, 250, 252) // slate-50
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.2)
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'S')

    doc.text(lines, margin + 3, y + 4)
    y += boxHeight + 3
  }

  function featureGrid(features: { label: string; checked: boolean }[]) {
    checkPageBreak(25)
    const colWidth = contentWidth / 2
    let curX = margin

    features.forEach((feat, i) => {
      if (i > 0 && i % 2 === 0) {
        y += 6
        curX = margin
      } else if (i % 2 !== 0) {
        curX = margin + colWidth
      }
      checkPageBreak(7)

      // Box indicator
      if (feat.checked) {
        doc.setFillColor(239, 68, 68) // Red check
        doc.roundedRect(curX, y - 3, 4, 4, 0.8, 0.8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6.5)
        doc.text('v', curX + 1.2, y - 0.3)
      } else {
        doc.setDrawColor(203, 213, 225)
        doc.setLineWidth(0.3)
        doc.roundedRect(curX, y - 3, 4, 4, 0.8, 0.8, 'S')
      }

      doc.setTextColor(feat.checked ? 4 : 100, feat.checked ? 14 : 116, feat.checked ? 64 : 139)
      doc.setFont('helvetica', feat.checked ? 'bold' : 'normal')
      doc.setFontSize(8.5)
      doc.text(feat.label, curX + 6, y)
    })
    y += 8
  }

  // ── Render ──
  drawHeader()

  // 1. ORGANISATION & CONTACT
  sectionHeader('1. Organisation & Client Details', '1')
  fieldRow('Organisation / Website Name:', isBlank ? '__________________________________________' : data.organizationName)
  fieldRow('Contact Person:', isBlank ? '__________________________________________' : data.contactName)
  fieldRow('Email Address:', isBlank ? '__________________________________________' : data.email)
  fieldRow('Phone / WhatsApp:', isBlank ? '__________________________________________' : data.phone)
  fieldRow('Preferred Contact Channel:', isBlank ? '[ ] WhatsApp  [ ] Phone  [ ] Email' : (data.preferredContactMethod ? data.preferredContactMethod.toUpperCase() : 'WHATSAPP'))
  fieldTextBlock('Primary Purpose & Goals of the Website:', isBlank ? '' : data.websitePurpose, 3)

  // 2. BRAND & CONTENT ASSETS
  sectionHeader('2. Brand Assets & Content Readiness', '2')
  fieldRow('Website Type / Architecture:', isBlank ? '[ ] Static  [ ] Dynamic/CMS  [ ] E-Commerce  [ ] Portfolio' : (SITE_TYPE_LABELS[data.siteType] || data.siteType))
  fieldRow('Estimated Page Count:', isBlank ? '[ ] 1 Landing  [ ] 3-5 Pages  [ ] 6-10 Pages  [ ] 10+ Pages' : (PAGE_COUNT_LABELS[data.pageCount || ''] || data.pageCount || 'Not specified'))

  // Domain handling
  let domainStr = '—'
  if (isBlank) {
    domainStr = '[ ] Owned  [ ] Need Registration ($15-$50/yr)  [ ] Unsure'
  } else if (data.domainStatus === 'need-domain') {
    domainStr = data.existingDomain
      ? `Needs Registration: ${data.existingDomain} (Extra Cost)`
      : 'We do not have a domain yet (Needs Registration - Extra Cost)'
  } else if (data.domainStatus === 'have-domain' || data.hasExistingDomain) {
    domainStr = data.existingDomain ? `Already Owned: ${data.existingDomain}` : 'Already Owned'
  } else {
    domainStr = 'Not Sure Yet / Guidance Needed'
  }
  fieldRow('Domain Status:', domainStr)

  // Brand colors & assets
  fieldRow('Has Existing Brand Assets / Logo:', isBlank ? '[ ] Yes   [ ] No' : data.hasExistingBranding)
  if (data.brandColors || isBlank) {
    let colorsDisplay = isBlank ? 'Primary: #_____  Secondary: #_____  Accent: #_____' : ''
    if (!isBlank && data.brandColors) {
      if (typeof data.brandColors === 'object') {
        colorsDisplay = `Primary: ${data.brandColors.primary || '—'}  |  Secondary: ${data.brandColors.secondary || '—'}  |  Accent: ${data.brandColors.accent || '—'}`
      } else {
        try {
          const parsed = JSON.parse(data.brandColors)
          if (typeof parsed === 'object') {
            colorsDisplay = `Primary: ${parsed.primary || '—'}  |  Secondary: ${parsed.secondary || '—'}  |  Accent: ${parsed.accent || '—'}`
          } else {
            colorsDisplay = String(data.brandColors)
          }
        } catch {
          colorsDisplay = String(data.brandColors)
        }
      }
    }
    fieldRow('Brand Color Palette:', colorsDisplay)
  }
  if (data.brandingDescription || isBlank) {
    fieldTextBlock('Brand Style Guide & Logo Notes:', isBlank ? '' : data.brandingDescription, 2)
  }

  // Photos & content
  fieldRow('Has High-Quality Photos Ready:', isBlank ? '[ ] Yes   [ ] No' : data.hasHighQualityPhotos)
  if (data.photosDescription || isBlank) {
    fieldTextBlock('Photo Assets Description:', isBlank ? '' : data.photosDescription, 2)
  }
  fieldRow('Written Content / Copy Ready:', isBlank ? '[ ] Yes   [ ] No' : data.hasContent)
  if (data.contentDescription || isBlank) {
    fieldTextBlock('Content Outline & Readiness:', isBlank ? '' : data.contentDescription, 2)
  }

  // Add-on service requests
  fieldRow('Developer to Write Copy / Content:', isBlank ? '[ ] Yes (Add-on extra cost)   [ ] No' : (data.wantsContentWriting ? 'YES (Specialized Add-on)' : 'NO (Client provides)'))
  fieldRow('Developer to Design Custom Graphics:', isBlank ? '[ ] Yes (Add-on extra cost)   [ ] No' : (data.wantsGraphicDesign ? 'YES (Specialized Add-on)' : 'NO (Client provides)'))

  // 3. TECHNICAL REQUIREMENTS
  sectionHeader('3. Technical Requirements & Functionality', '3')
  if (isBlank) {
    const blankFeatures = [
      { label: '[ ] Content Management (CMS)', checked: false },
      { label: '[ ] E-Commerce / Online Store', checked: false },
      { label: '[ ] Online Booking / Appointments', checked: false },
      { label: '[ ] Multi-language Support', checked: false },
      { label: '[ ] SEO Optimization Package', checked: false },
      { label: '[ ] Cloud Hosting & Email Server', checked: false },
      { label: '[ ] Client Self-Maintenance', checked: false },
    ]
    featureGrid(blankFeatures)
  } else {
    const features = [
      { label: 'Content Management (CMS)', checked: Boolean(data.needsCMS) },
      { label: 'E-Commerce / Online Store', checked: Boolean(data.needsEcommerce) },
      { label: 'Online Booking / Appointments', checked: Boolean(data.needsBooking) },
      { label: 'Multi-language Support', checked: Boolean(data.needsMultilingual) },
      { label: 'SEO Optimization Package', checked: Boolean(data.needsSEO) },
      { label: 'Cloud Hosting & Email Setup', checked: Boolean(data.needsHosting) },
      { label: 'Client Self-Maintenance', checked: Boolean(data.canMaintainSelf) },
    ]
    featureGrid(features)
  }
  fieldTextBlock('Third-Party Integrations (WhatsApp, Maps, Payments, CRM):', isBlank ? '' : data.integrations, 2)

  // 4. AUDIENCE, BUDGET & SCHEDULE
  sectionHeader('4. Target Audience, Budget & Timeline', '4')
  fieldRow('Budget Range:', isBlank ? '[ ] $200-$500  [ ] $500-$1k  [ ] $1k-$3k  [ ] $3k-$10k  [ ] $10k+  [ ] Flexible' : (BUDGET_LABELS[data.budgetRange || ''] || data.budgetRange || 'Not specified'))
  fieldRow('Target Delivery Timeline:', isBlank ? '[ ] ASAP (<2wks)  [ ] 1 Month  [ ] 2-3 Months  [ ] Flexible' : (TIMELINE_LABELS[data.timeline || ''] || data.timeline || 'Not specified'))
  if (data.targetDeadline || isBlank) {
    fieldRow('Specific Launch Deadline:', isBlank ? '__________________________________________' : data.targetDeadline)
  }
  fieldTextBlock('Target Audience Description:', isBlank ? '' : data.targetAudience, 2)
  fieldTextBlock('Competitor or Inspiration Websites:', isBlank ? '' : data.competitors, 2)
  fieldTextBlock('Social Media Links / Handles:', isBlank ? '' : data.socialMediaLinks, 1)
  fieldTextBlock('Additional Project Notes / Special Requests:', isBlank ? '' : data.additionalNotes, 3)

  // Extra cost advisory note at bottom
  checkPageBreak(16)
  doc.setFillColor(254, 252, 232) // yellow-50
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'F')
  doc.setDrawColor(254, 240, 138) // yellow-200
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(133, 77, 14) // yellow-800
  doc.text('IMPORTANT NOTICE ON ADD-ON SERVICES:', margin + 3, y + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'Domain name registration ($15-$50/yr), professional copywriting, and custom graphic design are specialized add-on services',
    margin + 3,
    y + 8.5
  )
  doc.text(
    'that incur additional fees beyond standard base website development. Pricing will be itemized clearly in your custom quote.',
    margin + 3,
    y + 12
  )

  // ── Footer on all pages ──
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184) // slate-400
    doc.text(
      'BridgeTech IT Services  •  #1 Regent Highway, Jui Junction, Freetown  •  +232 33 399 391  •  info@itservicesfreetown.com',
      margin,
      pageHeight - 7.5
    )
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' })
  }

  return doc
}

/**
 * Convenience helper to download the PDF for a filled submission
 */
export function downloadQuestionnairePDF(
  data: QuestionnaireData,
  options?: { submissionId?: string; filename?: string }
) {
  const doc = generateQuestionnairePDF(data, { submissionId: options?.submissionId })
  const orgSlug = (data.organizationName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_')
  const defaultName = `Website_Project_Brief_${orgSlug}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(options?.filename || defaultName)
}

/**
 * Convenience helper to download a blank printable questionnaire form
 */
export function downloadBlankQuestionnairePDF(filename = 'BridgeTech_Website_Development_Questionnaire.pdf') {
  const blankData: QuestionnaireData = {
    organizationName: '',
    contactName: '',
    email: '',
    websitePurpose: '',
    siteType: 'unsure',
    hasExistingDomain: false,
    hasExistingBranding: false,
    hasHighQualityPhotos: false,
    hasContent: false,
    canMaintainSelf: false,
    needsCMS: false,
    needsEcommerce: false,
    needsBooking: false,
    needsMultilingual: false,
    needsSEO: false,
  }
  const doc = generateQuestionnairePDF(blankData, { isBlankForm: true })
  doc.save(filename)
}
