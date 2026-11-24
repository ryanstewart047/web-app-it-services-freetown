import jsPDF from 'jspdf';
import { JobApplication } from './careers-storage';
import { OnDemandPro } from './on-demand-storage';

export interface UnifiedApplicantDossier {
  id: string;
  sourceType: 'career' | 'on_demand_pro';
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  locationArea?: string;
  residentialAddress: string;
  tradeTitle: string;
  department?: string;
  yearsExperience: string | number;
  secondarySkills?: string;
  toolOwnership?: string;
  transportMode?: string;
  availability?: string;
  coverageAreas?: string[];
  nationalIdNumber?: string;
  mobileMoneyProvider: string;
  mobileMoneyNumber: string;
  onboardingFeeStatus?: string;
  onboardingPaymentRef?: string;
  status: string;
  adminNotes?: string;
  rating?: number;
  interviewDate?: string;
  workSummary?: string;
  createdAt: string;

  // Attached Photos
  profilePhoto?: string;
  idCardFrontPhoto?: string;
  idCardBackPhoto?: string;
  certificatePhoto?: string;
}

/**
 * Normalizes any image (base64, blob, or remote URL) to an RGB JPEG data URL
 * so jsPDF can embed it reliably without crashing.
 */
async function prepareImageForPDF(src?: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!src || typeof window === 'undefined') return null;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let w = img.naturalWidth || img.width || 800;
          let h = img.naturalHeight || img.height || 600;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ dataUrl: src, width: w, height: h });
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const jpeg = canvas.toDataURL('image/jpeg', 0.85);
          resolve({ dataUrl: jpeg, width: w, height: h });
        } catch (_) {
          resolve({ dataUrl: src, width: 800, height: 600 });
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    } catch (_) {
      resolve(null);
    }
  });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Programmatically generates and triggers download of the Official Applicant Dossier PDF
 */
export async function generateApplicantDossierPDF(data: UnifiedApplicantDossier): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Pre-load all attached photos in parallel
  const [profileImg, idFrontImg, idBackImg, certImg] = await Promise.all([
    prepareImageForPDF(data.profilePhoto),
    prepareImageForPDF(data.idCardFrontPhoto),
    prepareImageForPDF(data.idCardBackPhoto),
    prepareImageForPDF(data.certificatePhoto),
  ]);

  // ═════════════════════════════════════════════════════════════════════════
  // PAGE 1: OFFICIAL CANDIDATE DOSSIER & RECORD OF APPLICATION
  // ═════════════════════════════════════════════════════════════════════════

  // Header Banner: Deep Navy & Red
  doc.setFillColor(4, 14, 64); // #040e40
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFillColor(220, 38, 38); // Red accent stripe
  doc.rect(0, 32, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('BRIDGETECH IT SERVICES & ON-DEMAND PRO NETWORK', margin, 12);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 179, 8); // Gold/amber
  doc.text('OFFICIAL CANDIDATE DOSSIER & VETTING REGISTRY', margin, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('No. 1 Regent Highway, Jui Junction, Freetown, Sierra Leone | +232 33 399 391 | support@itservicesfreetown.com', margin, 26);

  // Meta Bar (y = 40)
  let y = 41;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(data.fullName || 'Candidate Application', margin, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(data.tradeTitle || 'Specialized Technician', margin, y + 5.5);

  // Application Reference & Status Pills on the right
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ref ID: ${data.id}`, pageWidth - margin - 50, y);
  doc.text(`Applied: ${formatDate(data.createdAt)}`, pageWidth - margin - 50, y + 4.5);

  // Status Badge
  const statusStr = (data.status || 'pending').replace(/_/g, ' ').toUpperCase();
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - margin - 50, y + 7, 50, 6, 1.5, 1.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.text(`STATUS: ${statusStr}`, pageWidth - margin - 48, y + 11.2);

  y += 18;

  // Helper function to draw Section Card Boxes
  const drawCard = (x: number, startY: number, width: number, height: number, title: string, badge?: string) => {
    doc.setFillColor(248, 250, 252); // Light gray card
    doc.setDrawColor(226, 232, 240); // Card border
    doc.roundedRect(x, startY, width, height, 2, 2, 'FD');

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(4, 14, 64);
    doc.text(title.toUpperCase(), x + 3.5, startY + 5.5);

    if (badge) {
      doc.setFontSize(7);
      doc.setTextColor(220, 38, 38);
      doc.text(badge, x + width - 3.5 - doc.getTextWidth(badge), startY + 5.5);
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(x, startY + 7.5, x + width, startY + 7.5);
  };

  const drawField = (label: string, value: string, x: number, lineY: number, labelWidth = 32) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, lineY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const safeVal = value || 'Not provided';
    doc.text(safeVal, x + labelWidth, lineY);
  };

  // Section 1: Personal & Contact Information (Left Column, width = 88mm)
  const colWidth = 88;
  const colGap = 6;
  const col2X = margin + colWidth + colGap;

  const card1H = 50;
  drawCard(margin, y, colWidth, card1H, '1. Personal & Contact');
  let cy = y + 12;
  drawField('Phone:', data.phone, margin + 3.5, cy);
  cy += 6;
  drawField('WhatsApp:', data.whatsapp || data.phone, margin + 3.5, cy);
  cy += 6;
  drawField('Email:', data.email || 'None provided', margin + 3.5, cy);
  cy += 6;
  drawField('Gender:', (data.gender || 'Not specified').toUpperCase(), margin + 3.5, cy);
  cy += 6;
  drawField('Location Area:', data.locationArea || 'Central Freetown', margin + 3.5, cy);
  cy += 6;
  // Residential address may wrap
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Residential Addr:', margin + 3.5, cy);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const addrLines = doc.splitTextToSize(data.residentialAddress || 'Freetown', colWidth - 34);
  doc.text(addrLines, margin + 31, cy);

  // Section 2: Trade & Technical Qualifications (Right Column, width = 88mm)
  drawCard(col2X, y, colWidth, card1H, '2. Trade Qualifications');
  cy = y + 12;
  drawField('Primary Trade:', data.tradeTitle, col2X + 3.5, cy, 30);
  cy += 6;
  drawField('Experience:', `${data.yearsExperience} Years`, col2X + 3.5, cy, 30);
  cy += 6;
  drawField('Tool Ownership:', (data.toolOwnership || 'Standard Tools').replace(/_/g, ' '), col2X + 3.5, cy, 30);
  cy += 6;
  drawField('Transport Mode:', (data.transportMode || 'Commercial').replace(/_/g, ' '), col2X + 3.5, cy, 30);
  cy += 6;
  drawField('Availability:', (data.availability || 'Immediate Full-Time').replace(/_/g, ' '), col2X + 3.5, cy, 30);
  cy += 6;
  if (data.coverageAreas && data.coverageAreas.length > 0) {
    drawField('Coverage Areas:', data.coverageAreas.slice(0, 3).join(', '), col2X + 3.5, cy, 30);
  } else if (data.secondarySkills) {
    drawField('Secondary Skills:', data.secondarySkills, col2X + 3.5, cy, 30);
  } else {
    drawField('Coverage:', 'Western Area / Greater Freetown', col2X + 3.5, cy, 30);
  }

  y += card1H + 5;

  // Section 3: Identity Vetting & Payout Details (Full width card)
  const card3H = 30;
  drawCard(margin, y, contentWidth, card3H, '3. Identity Vetting & Weekly Mobile Money Payout');
  cy = y + 13;
  drawField('National ID / NIN:', data.nationalIdNumber || 'Under verification', margin + 3.5, cy, 34);
  drawField('Mobile Money Provider:', (data.mobileMoneyProvider || 'Orange Money').toUpperCase(), col2X + 3.5, cy, 38);
  cy += 7;
  drawField('Vetting Documents:', `${data.idCardFrontPhoto ? 'ID Front ✓ ' : ''}${data.idCardBackPhoto ? 'ID Back ✓ ' : ''}${data.profilePhoto ? 'Profile Photo ✓ ' : ''}${data.certificatePhoto ? 'Certificate ✓' : ''}` || 'Pending upload', margin + 3.5, cy, 34);
  drawField('Payout Phone Number:', data.mobileMoneyNumber || data.phone, col2X + 3.5, cy, 38);

  y += card3H + 5;

  // Section 4: Work Summary / Experience Description
  const card4H = 36;
  drawCard(margin, y, contentWidth, card4H, '4. Work Experience & Candidate Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const summaryText = data.workSummary ||
    'Applicant has submitted formal registration for technical dispatch under the BridgeTech On-Demand network. Background verification and practical craft assessment are recorded in this file.';
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth - 8);
  doc.text(summaryLines.slice(0, 5), margin + 4, y + 12);

  y += card4H + 5;

  // Section 5: Recruiter Evaluation & Audit Block
  const card5H = 34;
  drawCard(margin, y, contentWidth, card5H, '5. Recruiter Evaluation & Audit Trail');
  cy = y + 12;
  drawField('Vetting Status:', statusStr, margin + 3.5, cy, 32);
  drawField('Recruiter Rating:', data.rating ? `${data.rating} / 5.0 Stars` : 'Pending evaluation', col2X + 3.5, cy, 36);
  cy += 6;
  drawField('Interview Date:', data.interviewDate ? formatDate(data.interviewDate) : 'Not scheduled yet', margin + 3.5, cy, 32);
  drawField('Compensation Rate:', '85% Take-Home Keep Rate', col2X + 3.5, cy, 36);
  cy += 6;
  drawField('Recruiter Notes:', data.adminNotes || 'Application file registered. Identity documents verified for Freetown operational territory.', margin + 3.5, cy, 32);

  // Bottom Page 1 Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `BridgeTech IT Services • Candidate Application Dossier • Generated: ${new Date().toLocaleString('en-GB')} • Page 1 of 2`,
    margin,
    pageHeight - 8
  );

  // ═════════════════════════════════════════════════════════════════════════
  // PAGE 2: OFFICIAL IDENTITY & VERIFICATION DOCUMENTS (PHOTOS)
  // ═════════════════════════════════════════════════════════════════════════

  doc.addPage();

  // Page 2 Header Banner
  doc.setFillColor(4, 14, 64);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BRIDGETECH IT SERVICES — VERIFICATION DOCUMENTS', margin, 11);

  doc.setFontSize(8);
  doc.setTextColor(234, 179, 8);
  doc.text(`Candidate: ${data.fullName}  |  Ref ID: ${data.id}  |  Trade: ${data.tradeTitle}`, margin, 18);

  y = 32;

  // Render Attached Documents in a clean 2x2 grid
  const docCardW = 88;
  const docCardH = 68;

  const docSlots = [
    { label: '1. Full Profile Photo', img: profileImg, x: margin, y: y },
    { label: '2. National ID (Front Side)', img: idFrontImg, x: col2X, y: y },
    { label: '3. National ID (Back Side)', img: idBackImg, x: margin, y: y + docCardH + 5 },
    { label: '4. Trade / Professional Certificate', img: certImg, x: col2X, y: y + docCardH + 5 },
  ];

  for (const slot of docSlots) {
    // Outer container box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(slot.x, slot.y, docCardW, docCardH, 2, 2, 'FD');

    // Slot Label Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 14, 64);
    doc.text(slot.label, slot.x + 3.5, slot.y + 5);

    if (slot.img) {
      doc.setFontSize(6.5);
      doc.setTextColor(5, 150, 105);
      doc.text('VERIFIED ✓', slot.x + docCardW - 19, slot.y + 5);

      // Inner image frame
      const imgFrameX = slot.x + 3;
      const imgFrameY = slot.y + 7.5;
      const imgFrameW = docCardW - 6;
      const imgFrameH = docCardH - 10.5;

      doc.setFillColor(15, 23, 42); // Dark frame for image
      doc.rect(imgFrameX, imgFrameY, imgFrameW, imgFrameH, 'F');

      // Calculate fit inside frame maintaining aspect ratio
      const imgAspect = slot.img.width / slot.img.height;
      const frameAspect = imgFrameW / imgFrameH;

      let drawW = imgFrameW;
      let drawH = imgFrameH;
      let drawX = imgFrameX;
      let drawY = imgFrameY;

      if (imgAspect > frameAspect) {
        drawH = imgFrameW / imgAspect;
        drawY = imgFrameY + (imgFrameH - drawH) / 2;
      } else {
        drawW = imgFrameH * imgAspect;
        drawX = imgFrameX + (imgFrameW - drawW) / 2;
      }

      try {
        doc.addImage(slot.img.dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
      } catch (err) {
        console.error('Failed to render document image in PDF:', err);
      }
    } else {
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text('NOT ATTACHED', slot.x + docCardW - 22, slot.y + 5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Document not attached or not required', slot.x + 15, slot.y + docCardH / 2);
    }
  }

  // Official Compliance & Vetting Certification Box (Bottom of Page 2)
  const certBoxY = y + (docCardH * 2) + 12;
  const certBoxH = 34;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, certBoxY, contentWidth, certBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(4, 14, 64);
  doc.text('OFFICIAL VETTING & REGISTRY COMPLIANCE ENDORSEMENT', margin + 4, certBoxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const complianceNotice =
    'This document represents the official dossier of the above-named applicant registered with BridgeTech IT Services & On-Demand Network. Identification documents and professional trade qualifications have been archived for security vetting, on-demand dispatch, and statutory record-keeping.';
  const compLines = doc.splitTextToSize(complianceNotice, contentWidth - 45);
  doc.text(compLines, margin + 4, certBoxY + 12);

  // Digital Signature / Stamp line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Ryan Josiah Stewart', pageWidth - margin - 42, certBoxY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Lead Technical Director', pageWidth - margin - 42, certBoxY + 26);
  doc.text('BridgeTech IT Services', pageWidth - margin - 42, certBoxY + 29.5);

  // Bottom Page 2 Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `BridgeTech IT Services • Candidate Application Dossier • Generated: ${new Date().toLocaleString('en-GB')} • Page 2 of 2`,
    margin,
    pageHeight - 8
  );

  // Save the PDF with a clean, professional filename
  const cleanName = (data.fullName || 'Applicant').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `BridgeTech_Application_${data.id}_${cleanName}.pdf`;
  doc.save(filename);
}

/**
 * Convenience wrapper for JobApplication from /careers
 */
export async function downloadCareerApplicationPDF(app: JobApplication): Promise<void> {
  await generateApplicantDossierPDF({
    id: app.id,
    sourceType: 'career',
    fullName: app.fullName,
    phone: app.phone,
    whatsapp: app.whatsapp,
    email: app.email,
    gender: app.gender,
    dateOfBirth: app.dateOfBirth,
    locationArea: app.locationArea,
    residentialAddress: app.residentialAddress,
    tradeTitle: app.jobTitle,
    yearsExperience: app.yearsExperience,
    secondarySkills: app.secondarySkills,
    toolOwnership: app.toolOwnership,
    transportMode: app.transportMode,
    availability: app.availability,
    nationalIdNumber: app.nationalIdNumber,
    mobileMoneyProvider: app.mobileMoneyProvider,
    mobileMoneyNumber: app.mobileMoneyNumber,
    status: app.status,
    adminNotes: app.adminNotes,
    rating: app.rating,
    interviewDate: app.interviewDate,
    workSummary: app.workSummary,
    createdAt: app.createdAt,
    idCardFrontPhoto: app.idCardFrontPhoto || app.idCardPhoto,
    idCardBackPhoto: app.idCardBackPhoto,
    certificatePhoto: app.certificatePhoto,
  });
}

/**
 * Convenience wrapper for OnDemandPro from /on-demand
 */
export async function downloadProApplicationPDF(pro: OnDemandPro): Promise<void> {
  await generateApplicantDossierPDF({
    id: pro.id,
    sourceType: 'on_demand_pro',
    fullName: pro.fullName,
    phone: pro.phone,
    whatsapp: pro.whatsapp,
    email: pro.email,
    residentialAddress: pro.address,
    locationArea: pro.coverageAreas?.[0] || 'Central Freetown',
    tradeTitle: pro.primaryTrade,
    yearsExperience: pro.yearsOfExperience,
    secondarySkills: pro.secondarySkills,
    coverageAreas: pro.coverageAreas,
    nationalIdNumber: pro.nationalIdNumber,
    mobileMoneyProvider: pro.mobileMoneyProvider === 'afri' ? 'Afrimoney' : 'Orange Money',
    mobileMoneyNumber: pro.mobileMoneyNumber,
    onboardingFeeStatus: pro.onboardingFeeStatus,
    onboardingPaymentRef: pro.onboardingPaymentRef,
    status: pro.status,
    rating: pro.rating,
    workSummary: pro.bioOrWorkSummary,
    createdAt: pro.createdAt,
    profilePhoto: pro.profilePhoto,
    idCardFrontPhoto: pro.idCardFrontPhoto || pro.idCardPhoto,
    idCardBackPhoto: pro.idCardBackPhoto,
  });
}
