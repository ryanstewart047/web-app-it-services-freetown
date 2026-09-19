import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { updateBannerSettings, getBannerSettings } from '@/lib/server/banner-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const REVEAL_URL = 'https://www.itservicesfreetown.com/surprise/freetown-safety-alert';
const BRAND_PHONE = '+232 33 399391';

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value;
  return !!sessionToken;
}

async function getDistinctCustomerEmails(): Promise<string[]> {
  const emails = new Set<string>();

  try {
    const customers = await prisma.customer.findMany({ select: { email: true } });
    customers.forEach((c) => {
      const e = c.email?.trim().toLowerCase();
      if (e && e.includes('@') && e.includes('.')) emails.add(e);
    });
  } catch (err) {
    console.warn('[Emergency Broadcast] Error reading Customer table:', err);
  }

  try {
    const leads = await prisma.emailLead.findMany({
      where: { deliveryFailed: false },
      select: { email: true },
    });
    leads.forEach((l) => {
      const e = l.email?.trim().toLowerCase();
      if (e && e.includes('@') && e.includes('.')) emails.add(e);
    });
  } catch (err) {
    console.warn('[Emergency Broadcast] Error reading EmailLead table:', err);
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerEmail: { not: '' } },
      select: { customerEmail: true },
    });
    orders.forEach((o) => {
      const e = o.customerEmail?.trim().toLowerCase();
      if (e && e.includes('@') && e.includes('.')) emails.add(e);
    });
  } catch (err) {
    console.warn('[Emergency Broadcast] Error reading Order table:', err);
  }

  try {
    const receipts = await prisma.receipt.findMany({
      where: { customerEmail: { not: null } },
      select: { customerEmail: true },
    });
    receipts.forEach((r) => {
      const e = r.customerEmail?.trim().toLowerCase();
      if (e && e.includes('@') && e.includes('.')) emails.add(e);
    });
  } catch (err) {
    console.warn('[Emergency Broadcast] Error reading Receipt table:', err);
  }

  return Array.from(emails).sort();
}

function buildHtmlTemplate(customNote?: string): { subject: string; html: string } {
  const subject = '⚠️ URGENT: Freetown Heavy Rain & Flood Safety Advisory — Dial 117 for Emergency Help';

  const noteSection = customNote?.trim()
    ? `<div style="background-color:#fef3c7; border-left:4px solid #d97706; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:16px; color:#92400e; font-size:14px; font-weight:600;">
        📌 Special Update from Management: ${customNote}
       </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Freetown Heavy Rain & Flood Safety Advisory</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9; padding:20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
          
          <!-- Top Warning Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #991b1b 100%); padding:28px 24px; text-align:center;">
              <span style="background-color:rgba(255,255,255,0.2); color:#ffffff; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; padding:6px 14px; border-radius:20px; display:inline-block; margin-bottom:12px; border:1px solid rgba(255,255,255,0.3);">
                🚨 Urgent Community Safety Advisory
              </span>
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; line-height:1.3; letter-spacing:-0.5px;">
                Freetown Heavy Rain &amp; Flood Warning
              </h1>
              <p style="margin:8px 0 0 0; color:#fee2e2; font-size:14px; line-height:1.4;">
                From the Community Response Team at BridgeTech IT Services
              </p>
            </td>
          </tr>

          <!-- Emergency 117 Callout Box -->
          <tr>
            <td style="padding:24px 24px 12px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fef2f2; border:2px solid #ef4444; border-radius:12px; padding:18px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 6px 0; color:#991b1b; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                      National Emergency Toll-Free Hotline
                    </p>
                    <p style="margin:0; color:#dc2626; font-size:38px; font-weight:900; line-height:1;">
                      DIAL 117
                    </p>
                    <p style="margin:8px 0 0 0; color:#7f1d1d; font-size:13px; line-height:1.4;">
                      <strong>Free call across all networks</strong> (Africell, Orange, QCell) for flood rescue, landslides, or emergency danger reporting via the National Disaster Management Agency (NDMA).
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:12px 24px 20px 24px; font-size:15px; line-height:1.6; color:#334155;">
              ${noteSection}
              <p style="margin-top:0;">
                Dear Valued Customer and Community Member,
              </p>
              <p>
                Continuous heavy rains have been pouring across Freetown for several hours. Because our city's low-lying basins and hillside communities are prone to sudden flash floods and mudslides, your life and the safety of your family is our utmost priority.
              </p>
              <p style="background-color:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin:16px 0; color:#92400e; font-size:14px;">
                <strong>⚠️ Your life is irreplaceable.</strong> Please remain indoors, avoid moving waters, and follow essential emergency guidelines.
              </p>
            </td>
          </tr>

          <!-- Critical Flood Safety Rules -->
          <tr>
            <td style="padding:0 24px 20px 24px;">
              <h3 style="margin:0 0 12px 0; color:#0f172a; font-size:16px; font-weight:700; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">
                🛑 Critical Flood Safety Protocols
              </h3>
              <ul style="margin:0; padding-left:20px; color:#334155; font-size:14px; line-height:1.7;">
                <li><strong>Do NOT attempt to walk, wade, or drive through moving water:</strong> Just 15 cm of swift water can sweep an adult off their feet; 30 cm can float a vehicle.</li>
                <li><strong>Stay far away from open drainage canals, gutters, and low bridges:</strong> Drainages can conceal powerful suction or collapse without notice.</li>
                <li><strong>Move to higher ground early:</strong> If you notice rising water levels in your compound, do not wait until escape paths are blocked.</li>
                <li><strong>Assist vulnerable neighbors:</strong> Check on elderly relatives, nursing mothers, and children who may need assistance moving to safe ground.</li>
              </ul>
            </td>
          </tr>

          <!-- Electrical & Tech Protection -->
          <tr>
            <td style="padding:0 24px 20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:16px;">
                <tr>
                  <td>
                    <h4 style="margin:0 0 8px 0; color:#0369a1; font-size:15px; font-weight:700;">
                      🔌 Urgent Tech &amp; Electrical Precautions
                    </h4>
                    <ul style="margin:0; padding-left:18px; color:#0c4a6e; font-size:13px; line-height:1.6;">
                      <li><strong>Unplug electronics immediately:</strong> Disconnect laptops, desktop PCs, TVs, routers, and power strips from wall outlets to guard against destructive lightning and voltage surges.</li>
                      <li><strong>Elevate equipment:</strong> Move computers, mobile devices, and backup drives off the floor onto high tables.</li>
                      <li><strong>Turn off the main breaker:</strong> If floodwater begins entering your home, switch off your main electrical power breaker switch immediately to prevent lethal electrocution.</li>
                      <li><strong>Never turn on wet devices:</strong> If a phone or laptop gets wet, DO NOT power it on or connect a charger. Powering wet electronics causes immediate terminal circuit damage.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Safety Reveal Button -->
          <tr>
            <td align="center" style="padding:10px 24px 28px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius:12px; background:linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);">
                    <a href="${REVEAL_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:16px 32px; color:#ffffff; font-size:16px; font-weight:800; text-decoration:none; border-radius:12px; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
                      🚨 Open Interactive Flood Safety Reveal &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0; color:#64748b; font-size:12px;">
                Interactive safety quiz, emergency checklist, and shareable community alert link.
              </p>
            </td>
          </tr>

          <!-- Emergency Hotlines Directory Table -->
          <tr>
            <td style="padding:0 24px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; font-size:12px; color:#475569;">
                <tr>
                  <td style="padding:4px 0;"><strong>National Disaster &amp; Emergency:</strong></td>
                  <td style="padding:4px 0; text-align:right;"><strong style="color:#dc2626; font-size:14px;">117</strong> (Toll-Free)</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><strong>Sierra Leone Police Emergency:</strong></td>
                  <td style="padding:4px 0; text-align:right;"><strong>112 / 999</strong></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><strong>National Fire Force:</strong></td>
                  <td style="padding:4px 0; text-align:right;"><strong>076 611 999</strong></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><strong>BridgeTech Tech Helpline:</strong></td>
                  <td style="padding:4px 0; text-align:right;"><strong>${BRAND_PHONE}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a; padding:24px; text-align:center; color:#94a3b8; font-size:12px; line-height:1.5;">
              <p style="margin:0 0 6px 0; color:#ffffff; font-weight:700; font-size:13px;">
                BridgeTech IT Services
              </p>
              <p style="margin:0 0 10px 0;">
                #1 Regent Highway, Jui Junction | Freetown, Sierra Leone
              </p>
              <p style="margin:0; font-size:11px; color:#64748b;">
                You received this high-priority emergency advisory because you are a registered customer or subscriber of BridgeTech IT Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const emails = await getDistinctCustomerEmails();
    const banner = await getBannerSettings();
    const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

    return NextResponse.json({
      success: true,
      recipientsCount: emails.length,
      sampleRecipients: emails.slice(0, 5),
      smtpConfigured,
      revealUrl: REVEAL_URL,
      bannerActive: banner.enabled && banner.color === 'bg-red-600',
      banner,
    });
  } catch (error: any) {
    console.error('[Emergency Broadcast] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, testEmail, customNote, updateGlobalBanner } = body;

    // 1. Action: Activate or Update website global banner
    if (action === 'update-banner' || updateGlobalBanner === true) {
      await updateBannerSettings({
        enabled: true,
        message: '⚠️ FLOOD EMERGENCY ADVISORY: Heavy rains across Freetown. Stay safe, avoid flooded waterways & dial 117 for national emergency response.',
        buttonText: 'Flood Safety Guide',
        link: REVEAL_URL,
        color: 'bg-red-600',
      });
    }

    if (action === 'update-banner-only') {
      const banner = await getBannerSettings();
      return NextResponse.json({ success: true, message: 'Global Banner updated to Flood Emergency Alert', banner });
    }

    // 2. Action: Test Send
    if (action === 'send-test') {
      if (!testEmail || !testEmail.includes('@')) {
        return NextResponse.json({ error: 'Please provide a valid test email address.' }, { status: 400 });
      }

      const { subject, html } = buildHtmlTemplate(customNote);
      const result = await sendEmail({
        to: testEmail.trim(),
        subject: `[TEST] ${subject}`,
        html,
      });

      return NextResponse.json({
        success: result.success,
        message: result.success ? `Test emergency email sent to ${testEmail}` : `Failed: ${result.error}`,
        error: result.error,
      });
    }

    // 3. Action: Full Broadcast to all customers
    if (action === 'send-broadcast') {
      const recipients = await getDistinctCustomerEmails();
      if (recipients.length === 0) {
        return NextResponse.json({ error: 'No customer emails found in database.' }, { status: 400 });
      }

      const { subject, html } = buildHtmlTemplate(customNote);

      let sentCount = 0;
      let failedCount = 0;

      for (const email of recipients) {
        try {
          const result = await sendEmail({
            to: email,
            subject,
            html,
          });

          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
            await prisma.emailLead.updateMany({
              where: { email: email.toLowerCase() },
              data: { deliveryFailed: true },
            }).catch(() => null);
          }
        } catch (err) {
          failedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        sentCount,
        failedCount,
        totalRecipients: recipients.length,
        revealUrl: REVEAL_URL,
      });
    }

    return NextResponse.json({ error: 'Invalid action provided.' }, { status: 400 });
  } catch (error: any) {
    console.error('[Emergency Broadcast] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
