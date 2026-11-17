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
  address?: string | null
  businessRegistration?: string | null
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
  '200-500': '$200 - $500 (Starter / Landing Page / Micro-site)',
  '500-1000': '$500 - $1,000 (Small Business / Brochure)',
  'under-1000': 'Under $1,000 (Starter / Basic)',
  '1000-3000': '$1,000 - $3,000 (Small Business / Growing Co.)',
  '3000-10000': '$3,000 - $10,000 (Custom / Feature-Rich / Store)',
  '10000+': '$10,000+ (Enterprise / Complex Platform)',
  flexible: 'Flexible / Open to Recommendations',
}

const TIMELINE_LABELS: Record<string, string> = {
  'urgent-2weeks': 'ASAP (< 2 Weeks) - Rush Turnaround',
  '1-month': 'Within 1 Month - Standard Delivery',
  '2-3-months': '2 - 3 Months - Phased Rollout',
  flexible: 'Flexible - No Hard Deadline',
}

const PAGE_COUNT_LABELS: Record<string, string> = {
  '1-landing': '1 Page (Landing Page / One-Pager)',
  '3-5-pages': '3 - 5 Pages (Standard Business: Home, About, Services, Contact)',
  '6-10-pages': '6 - 10 Pages (Expanded Catalog / Multi-service)',
  '10-plus': '10+ Pages (Large Portal / Corporate / Platform)',
  unsure: 'Not Sure Yet / Guidance Needed',
}

/**
 * Builds a styled, executive multi-page PDF document for a website development questionnaire
 * with maximum contrast, professional typography, and crisp section organization.
 * Guarantees zero unreadable or white-on-white text across all pages.
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
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  const pageBottomLimit = pageHeight - 20 // 277mm leaves clean buffer before 285mm footer
  let y = margin

  // ── Palette Constants (High Contrast WCAG AAA Compliant) ──
  const C_NAVY: [number, number, number] = [4, 14, 64]       // #040e40 Deep Navy
  const C_RED: [number, number, number] = [239, 68, 68]      // #ef4444 Brand Red
  const C_DARK: [number, number, number] = [15, 23, 42]      // #0f172a Slate-900 (High contrast body text)
  const C_SLATE: [number, number, number] = [51, 65, 85]     // #334155 Slate-700 (High contrast labels)
  const C_BORDER: [number, number, number] = [203, 213, 225] // #cbd5e1 Slate-300 (Crisp borders)
  const C_BG_CARD: [number, number, number] = [248, 250, 252] // #f8fafc Slate-50 (Card fill)

  function resetDefaultText() {
    doc.setTextColor(...C_DARK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
  }

  function drawHeader() {
    // Top navy banner
    doc.setFillColor(...C_NAVY)
    doc.rect(0, 0, pageWidth, 32, 'F')

    // Top red accent rule
    doc.setFillColor(...C_RED)
    doc.rect(0, 32, pageWidth, 2.5, 'F')

    // ── BridgeTech Shield Logo Emblem ──
    doc.setFillColor(...C_RED)
    doc.roundedRect(margin, 5.5, 14, 19, 2, 2, 'F')
    doc.setFillColor(...C_NAVY)
    doc.roundedRect(margin + 1, 6.5, 12, 17, 1.5, 1.5, 'F')

    // B (white) and S (red) monogram
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text('B', margin + 2.8, 18.5)
    doc.setTextColor(...C_RED)
    doc.text('S', margin + 7.5, 18.5)

    // Header brand typography
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('BridgeTech', margin + 18, 14)

    doc.setTextColor(...C_RED)
    doc.setFontSize(10)
    doc.text('IT SERVICES', margin + 50, 14)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(241, 245, 249) // #f1f5f9
    doc.text(
      isBlank
        ? 'WEBSITE DEVELOPMENT CLIENT DISCOVERY QUESTIONNAIRE'
        : 'WEBSITE PROJECT BRIEF & TECHNICAL SCOPE SPECIFICATION',
      margin + 18,
      21.5
    )

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(203, 213, 225)
    doc.text(
      'Freetown, Sierra Leone  |  +232 33 399 391  |  www.itservicesfreetown.com',
      margin + 18,
      27
    )

    // Meta details on the right
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    const dateStr = data.createdAt
      ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    doc.text(`Date: ${dateStr}`, pageWidth - margin, 13, { align: 'right' })

    if (options?.submissionId) {
      doc.setFontSize(8.5)
      doc.setTextColor(...C_RED)
      doc.text(`Ref: #${options.submissionId.slice(-8).toUpperCase()}`, pageWidth - margin, 19.5, { align: 'right' })
      doc.setTextColor(203, 213, 225)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.text('Official Client Record', pageWidth - margin, 25, { align: 'right' })
    } else if (isBlank) {
      doc.setFontSize(8.5)
      doc.setTextColor(203, 213, 225)
      doc.text('Printable Client Intake Form', pageWidth - margin, 19.5, { align: 'right' })
    }

    y = 42
    resetDefaultText()
  }

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageBottomLimit) {
      doc.addPage()
      // Continuation header for subsequent pages
      doc.setFillColor(...C_NAVY)
      doc.rect(0, 0, pageWidth, 13, 'F')
      doc.setFillColor(...C_RED)
      doc.rect(0, 13, pageWidth, 1.5, 'F')

      // Mini shield emblem
      doc.setFillColor(...C_RED)
      doc.roundedRect(margin, 2, 7, 9, 1, 1, 'F')
      doc.setFillColor(...C_NAVY)
      doc.roundedRect(margin + 0.5, 2.5, 6, 8, 0.8, 0.8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(255, 255, 255)
      doc.text('B', margin + 1.5, 8)
      doc.setTextColor(...C_RED)
      doc.text('S', margin + 3.8, 8)

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('BridgeTech IT Services  |  Website Project Discovery Brief', margin + 10, 8.5)

      if (options?.submissionId) {
        doc.setFontSize(8)
        doc.setTextColor(241, 245, 249)
        doc.text(`Ref: #${options.submissionId.slice(-8).toUpperCase()}`, pageWidth - margin, 8.5, { align: 'right' })
      }

      y = 22
      resetDefaultText()
    }
  }

  function sectionHeader(title: string, sectionNumber: string) {
    checkPageBreak(26)

    // Number badge
    doc.setFillColor(...C_NAVY)
    doc.roundedRect(margin, y, 7, 7, 1.5, 1.5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(sectionNumber, margin + 3.5, y + 5, { align: 'center' })

    // Section title
    doc.setTextColor(...C_NAVY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11.5)
    doc.text(title.toUpperCase(), margin + 10, y + 5.2)

    // Solid accent underline
    doc.setDrawColor(...C_BORDER)
    doc.setLineWidth(0.6)
    doc.line(margin, y + 8.5, pageWidth - margin, y + 8.5)

    y += 13
    resetDefaultText()
  }

  function fieldRow(label: string, value: string | boolean | undefined | null) {
    const colX = margin + 72
    const colWidth = contentWidth - 72

    let valStr = ''
    if (typeof value === 'boolean') {
      valStr = value ? 'YES' : 'NO'
    } else {
      valStr = value && String(value).trim() ? String(value).trim() : '-'
    }

    const isPlaceholderLine = isBlank && (!value || value === '-' || String(value).startsWith('___'))
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const lines = isPlaceholderLine ? [] : doc.splitTextToSize(valStr, colWidth)
    const rowHeight = Math.max(lines.length * 5, 7.5)

    checkPageBreak(rowHeight + 2)

    // Label column
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...C_SLATE)
    doc.text(label, margin, y)

    if (isPlaceholderLine) {
      // Clean dotted writing line for blank form
      doc.setDrawColor(...C_BORDER)
      doc.setLineWidth(0.4)
      doc.line(colX, y + 1, pageWidth - margin, y + 1)
      y += 7.5
      resetDefaultText()
      return
    }

    // Value column
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...C_DARK)

    // Bold highlight for prominent answers
    if (valStr.startsWith('YES') || valStr === 'Already Owned') {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(4, 120, 87) // emerald-700
    } else if (valStr.includes('Extra Cost') || valStr.startsWith('Needs Registration')) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(180, 83, 9) // amber-700
    }

    doc.text(lines, colX, y)
    y += rowHeight
    resetDefaultText()
  }

  function fieldTextBlock(label: string, text: string | undefined | null, blankPlaceholderLines = 3) {
    if (isBlank) {
      const placeholderHeight = blankPlaceholderLines * 7 + 4
      checkPageBreak(6 + placeholderHeight)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(...C_NAVY)
      doc.text(label, margin, y)
      y += 5.5

      for (let i = 0; i < blankPlaceholderLines; i++) {
        doc.setDrawColor(...C_BORDER)
        doc.setLineWidth(0.35)
        doc.line(margin, y + 3.5, pageWidth - margin, y + 3.5)
        y += 7
      }
      y += 2.5
      resetDefaultText()
      return
    }

    const content = text && text.trim() ? text.trim() : 'None specified'
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    const lines = doc.splitTextToSize(content, contentWidth - 10)
    const boxHeight = lines.length * 4.8 + 6
    const totalNeeded = 5.5 + boxHeight + 3

    // Check page break BEFORE drawing heading so label and box stay together
    if (totalNeeded < pageBottomLimit - 25) {
      checkPageBreak(totalNeeded)
    } else {
      if (y > 60) {
        checkPageBreak(pageBottomLimit)
      }
    }

    // Heading label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...C_NAVY)
    doc.text(label, margin, y)
    y += 5

    // Card background box
    doc.setFillColor(...C_BG_CARD)
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'F')
    doc.setDrawColor(...C_BORDER)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'S')

    // Left decorative bar
    doc.setFillColor(...C_NAVY)
    doc.roundedRect(margin, y, 1.8, boxHeight, 0.8, 0.8, 'F')

    // Text content inside card (High Contrast Slate-900 guaranteed)
    doc.setTextColor(...C_DARK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text(lines, margin + 5, y + 4.8)
    y += boxHeight + 3.5
    resetDefaultText()
  }

  function drawFeatureItem(feat: { label: string; checked: boolean }, x: number, itemY: number) {
    if (feat.checked) {
      // High contrast checked badge
      doc.setFillColor(...C_NAVY)
      doc.roundedRect(x, itemY - 3.5, 5, 5, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.text('X', x + 1.3, itemY + 0.1)

      doc.setTextColor(...C_NAVY)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.text(feat.label, x + 7.5, itemY)
    } else {
      // Unchecked box (high contrast clean border)
      doc.setDrawColor(...C_BORDER)
      doc.setLineWidth(0.5)
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(x, itemY - 3.5, 5, 5, 1, 1, 'FD')

      doc.setTextColor(...C_SLATE)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.text(feat.label, x + 7.5, itemY)
    }
  }

  function featureGrid(features: { label: string; checked: boolean }[]) {
    const colWidth = (contentWidth - 6) / 2

    for (let i = 0; i < features.length; i += 2) {
      checkPageBreak(8.5)
      const feat1 = features[i]
      const feat2 = features[i + 1]

      drawFeatureItem(feat1, margin, y)
      if (feat2) {
        drawFeatureItem(feat2, margin + colWidth + 6, y)
      }
      y += 7.5
    }
    y += 2.5
    resetDefaultText()
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER DOCUMENT CONTENT
  // ══════════════════════════════════════════════════════════════════════════
  drawHeader()

  // ── 1. ORGANISATION & CLIENT DETAILS ──
  sectionHeader('1. Organisation & Client Details', '1')
  fieldRow('Organisation / Business Name:', isBlank ? '__________________________________________' : data.organizationName)
  fieldRow('Contact Person & Title:', isBlank ? '__________________________________________' : data.contactName)
  fieldRow('Email Address:', isBlank ? '__________________________________________' : data.email)
  fieldRow('Phone / WhatsApp Number:', isBlank ? '__________________________________________' : data.phone)
  fieldRow('Physical / Office Address:', isBlank ? '__________________________________________' : (data.address || '-'))
  fieldRow('Tax ID / Business Reg No.:', isBlank ? '__________________________________________' : (data.businessRegistration || '-'))
  fieldRow(
    'Preferred Contact Channel:',
    isBlank
      ? '[ ] WhatsApp    [ ] Phone Call    [ ] Email'
      : (data.preferredContactMethod ? data.preferredContactMethod.toUpperCase() : 'WHATSAPP')
  )
  fieldTextBlock('Primary Purpose & Core Goals of the Website:', isBlank ? '' : data.websitePurpose, 3)

  // ── 2. BRAND & CONTENT ASSETS ──
  sectionHeader('2. Brand Assets, Domain & Content Readiness', '2')
  fieldRow(
    'Website Architecture Type:',
    isBlank
      ? '[ ] Static / Brochure    [ ] Dynamic CMS / Blog    [ ] E-Commerce    [ ] Portfolio'
      : (SITE_TYPE_LABELS[data.siteType] || data.siteType)
  )
  fieldRow(
    'Estimated Website Scope / Pages:',
    isBlank
      ? '[ ] 1 Landing Page    [ ] 3 - 5 Pages    [ ] 6 - 10 Pages    [ ] 10+ Pages'
      : (PAGE_COUNT_LABELS[data.pageCount || ''] || data.pageCount || 'Not specified')
  )

  // Domain handling
  let domainStr = '-'
  if (isBlank) {
    domainStr = '[ ] Already Owned    [ ] Need Registration ($15-$50/yr)    [ ] Unsure'
  } else if (data.domainStatus === 'need-domain') {
    domainStr = data.existingDomain
      ? `Needs Registration: ${data.existingDomain} (Extra Cost)`
      : 'We do not have a domain yet (Needs Registration - Extra Cost)'
  } else if (data.domainStatus === 'have-domain' || data.hasExistingDomain) {
    domainStr = data.existingDomain ? `Already Owned: ${data.existingDomain}` : 'Already Owned'
  } else {
    domainStr = 'Not Sure Yet / Guidance Needed'
  }
  fieldRow('Domain Name Status:', domainStr)

  // Brand colors & assets
  fieldRow('Has Existing Brand Assets / Logo:', isBlank ? '[ ] Yes    [ ] No' : data.hasExistingBranding)
  if (data.brandColors || isBlank) {
    let colorsDisplay = isBlank ? 'Primary: #_______   Secondary: #_______   Accent: #_______' : ''
    if (!isBlank && data.brandColors) {
      if (typeof data.brandColors === 'object') {
        colorsDisplay = `Primary: ${data.brandColors.primary || '-'}  |  Secondary: ${data.brandColors.secondary || '-'}  |  Accent: ${data.brandColors.accent || '-'}`
      } else {
        try {
          const parsed = JSON.parse(data.brandColors)
          if (typeof parsed === 'object') {
            colorsDisplay = `Primary: ${parsed.primary || '-'}  |  Secondary: ${parsed.secondary || '-'}  |  Accent: ${parsed.accent || '-'}`
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
  fieldRow('Has High-Quality Photos Ready:', isBlank ? '[ ] Yes    [ ] No' : data.hasHighQualityPhotos)
  if (data.photosDescription || isBlank) {
    fieldTextBlock('Photo Assets Description:', isBlank ? '' : data.photosDescription, 2)
  }
  fieldRow('Written Content / Copy Ready:', isBlank ? '[ ] Yes    [ ] No' : data.hasContent)
  if (data.contentDescription || isBlank) {
    fieldTextBlock('Written Content Outline & Readiness:', isBlank ? '' : data.contentDescription, 2)
  }

  // Add-on service requests
  fieldRow(
    'Developer to Write Copy / Content:',
    isBlank ? '[ ] Yes (Specialized Add-on)    [ ] No' : (data.wantsContentWriting ? 'YES (Specialized Add-on)' : 'NO (Client provides)')
  )
  fieldRow(
    'Developer to Design Custom Graphics:',
    isBlank ? '[ ] Yes (Specialized Add-on)    [ ] No' : (data.wantsGraphicDesign ? 'YES (Specialized Add-on)' : 'NO (Client provides)')
  )

  // ── 3. TECHNICAL REQUIREMENTS & SCOPE ──
  sectionHeader('3. Technical Requirements & Integrations', '3')
  if (isBlank) {
    const blankFeatures = [
      { label: 'Content Management (CMS)', checked: false },
      { label: 'E-Commerce / Online Store & Cart', checked: false },
      { label: 'Online Booking / Appointments', checked: false },
      { label: 'Multi-language Support', checked: false },
      { label: 'SEO Optimization Package', checked: false },
      { label: 'Cloud Hosting & Business Email', checked: false },
      { label: 'Client Self-Maintenance', checked: false },
    ]
    featureGrid(blankFeatures)
  } else {
    const features = [
      { label: 'Content Management (CMS)', checked: Boolean(data.needsCMS) },
      { label: 'E-Commerce / Online Store & Cart', checked: Boolean(data.needsEcommerce) },
      { label: 'Online Booking / Appointments', checked: Boolean(data.needsBooking) },
      { label: 'Multi-language Support', checked: Boolean(data.needsMultilingual) },
      { label: 'SEO Optimization Package', checked: Boolean(data.needsSEO) },
      { label: 'Cloud Hosting & Business Email', checked: Boolean(data.needsHosting) },
      { label: 'Client Self-Maintenance', checked: Boolean(data.canMaintainSelf) },
    ]
    featureGrid(features)
  }
  fieldTextBlock('Third-Party Integrations (WhatsApp, Maps, Payments, CRM):', isBlank ? '' : data.integrations, 2)

  // ── 4. AUDIENCE, BUDGET & SCHEDULE ──
  sectionHeader('4. Target Audience, Budget & Schedule', '4')
  fieldRow(
    'Project Budget Range:',
    isBlank
      ? '[ ] $200-$500    [ ] $500-$1k    [ ] $1k-$3k    [ ] $3k-$10k    [ ] $10k+    [ ] Flexible'
      : (BUDGET_LABELS[data.budgetRange || ''] || data.budgetRange || 'Not specified')
  )
  fieldRow(
    'Target Delivery Timeline:',
    isBlank
      ? '[ ] ASAP (< 2 wks)    [ ] 1 Month    [ ] 2 - 3 Months    [ ] Flexible'
      : (TIMELINE_LABELS[data.timeline || ''] || data.timeline || 'Not specified')
  )
  if (data.targetDeadline || isBlank) {
    fieldRow('Specific Launch Deadline:', isBlank ? '__________________________________________' : data.targetDeadline)
  }
  fieldTextBlock('Target Audience & Ideal Clients:', isBlank ? '' : data.targetAudience, 2)
  fieldTextBlock('Competitor or Inspiration Websites:', isBlank ? '' : data.competitors, 2)
  fieldTextBlock('Social Media Links / Handles:', isBlank ? '' : data.socialMediaLinks, 1)
  fieldTextBlock('Additional Project Notes / Technical Constraints:', isBlank ? '' : data.additionalNotes, 3)

  // ── High-Contrast Advisory Box ──
  const noticeLines = doc.splitTextToSize(
    'Base website development covers responsive frontend coding, architecture, design layout, and testing. Specialized services such as Domain Registration ($15 - $50/yr registry fee), professional copywriting, and custom graphic design carry extra fees. These will be itemized transparently in your official quotation.',
    contentWidth - 10
  )
  const noticeBoxHeight = noticeLines.length * 4.8 + 10
  checkPageBreak(noticeBoxHeight + 4)

  doc.setFillColor(...C_BG_CARD)
  doc.roundedRect(margin, y, contentWidth, noticeBoxHeight, 1.5, 1.5, 'F')
  doc.setDrawColor(...C_BORDER)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, contentWidth, noticeBoxHeight, 1.5, 1.5, 'S')

  // Red accent left border
  doc.setFillColor(...C_RED)
  doc.roundedRect(margin, y, 2, noticeBoxHeight, 1, 1, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(153, 27, 27) // Dark crimson (#991b1b)
  doc.text('IMPORTANT NOTICE REGARDING SPECIALIZED ADD-ON SERVICES', margin + 5, y + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...C_DARK) // High contrast slate-900
  doc.text(noticeLines, margin + 5, y + 10.5)

  // ── Running Footer on All Pages ──
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(...C_BORDER)
    doc.setLineWidth(0.4)
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...C_SLATE) // High contrast slate-700
    doc.text(
      'BridgeTech IT Services  |  #1 Regent Highway, Jui Junction, Freetown  |  +232 33 399 391  |  info@itservicesfreetown.com',
      margin,
      pageHeight - 7
    )
    doc.setFont('helvetica', 'bold')
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' })
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
    phone: '',
    address: '',
    businessRegistration: '',
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
