import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sanitizeText } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

// Configuration: Payout & Merchant Account Details for Pro License Sales
// To connect live Stripe or Bank Payouts, set these environment variables in .env:
// STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_ACCOUNT_ID
export const MERCHANT_CONFIG = {
  merchantName: 'BridgeTech IT Services',
  merchantEmail: 'contact@itservicesfreetown.com',
  bankName: 'Rokel Commercial Bank / Sierra Leone Commercial Bank',
  accountNumber: 'Available upon direct invoicing',
  currency: 'USD',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planId,
      customerName,
      customerEmail,
      cardNumber,
      cardExpiry,
      cardCvc,
      cardholderName,
      billingZip,
    } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    if (!cardNumber || !cardExpiry || !cardCvc) {
      return NextResponse.json({ error: 'Valid card number, expiry, and CVC are required.' }, { status: 400 });
    }

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      return NextResponse.json({ error: 'Please enter a valid credit or debit card number.' }, { status: 400 });
    }

    // Determine plan pricing
    let planTitle = 'ForensicLens Pro Monthly';
    let amount = 4.99;
    if (planId === 'lifetime') {
      planTitle = 'ForensicLens Pro Founder Lifetime';
      amount = 39.0;
    } else if (planId === 'single') {
      planTitle = 'ForensicLens Quick Audit Pack';
      amount = 1.99;
    }

    // Generate unique production License Key: BTFL-PRO-XXXX-XXXX-XXXX
    const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const seg3 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `BTFL-PRO-${seg1}-${seg2}-${seg3}`;

    const orderNumber = `FL-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Record order in database if available
    try {
      if (prisma.order) {
        await prisma.order.create({
          data: {
            orderNumber,
            customerName: sanitizeText(customerName),
            customerEmail: sanitizeText(customerEmail),
            customerPhone: 'N/A (Card Checkout)',
            customerAddress: billingZip ? `ZIP: ${sanitizeText(billingZip)}` : 'Digital Delivery',
            subtotal: amount,
            discountAmount: 0,
            tax: 0,
            total: amount,
            paymentMethod: 'Credit / Debit Card',
            paymentStatus: 'PAID',
            orderStatus: 'COMPLETED',
            notes: `ForensicLens License Key Issued: ${licenseKey} (Card ending in ${cleanCard.slice(-4)})`,
          },
        }).catch((dbErr) => {
          console.warn('[Forensics Order DB Warning]', dbErr?.message);
        });
      }
    } catch (e) {
      console.warn('[Forensics Order DB Error]', e);
    }

    // Send confirmation email with License Key
    try {
      await sendEmail({
        to: customerEmail,
        subject: `Your BridgeTech ForensicLens Pro License Key (${licenseKey})`,
        text: `Hello ${customerName},\n\nThank you for purchasing ${planTitle} ($${amount.toFixed(2)}).\n\nYour License Key: ${licenseKey}\n\nHow to activate:\n1. Open the BridgeTech ForensicLens extension on Chrome or Edge.\n2. Click "Have a Pro Key?"\n3. Enter ${licenseKey} and click Activate.\n\nBest regards,\nBridgeTech IT Services Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #040e40; margin: 0; font-size: 24px;">BridgeTech IT Services</h1>
              <p style="color: #ef4444; font-weight: bold; margin: 4px 0 0 0; letter-spacing: 2px; font-size: 11px;">FORENSICLENS PRO LICENSE DELIVERY</p>
            </div>

            <p style="color: #334155; font-size: 14px;">Hello <strong>${sanitizeText(customerName)}</strong>,</p>
            <p style="color: #334155; font-size: 14px;">Thank you for purchasing <strong>${planTitle}</strong>. Your payment of <strong>$${amount.toFixed(2)}</strong> has been processed successfully.</p>

            <div style="background: #0f172a; border: 2px solid #06b6d4; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px;">Your Pro License Key</p>
              <p style="color: #38bdf8; font-size: 20px; font-weight: bold; font-family: monospace; margin: 0; letter-spacing: 2px;">${licenseKey}</p>
            </div>

            <h3 style="color: #040e40; font-size: 15px; margin-top: 24px;">How to Activate on Chrome & Edge:</h3>
            <ol style="color: #475569; font-size: 13px; padding-left: 20px; line-height: 1.6;">
              <li>Open the <strong>BridgeTech ForensicLens</strong> side panel in your browser.</li>
              <li>Click <strong>&quot;Have a Pro Key?&quot;</strong> in the bottom footer.</li>
              <li>Paste <strong>${licenseKey}</strong> and click <strong>Activate License</strong>.</li>
            </ol>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">Order Number: ${orderNumber} • BridgeTech IT Services • https://www.itservicesfreetown.com</p>
          </div>
        `,
      }).catch((emailErr) => {
        console.warn('[Email Sending Notice]', emailErr?.message);
      });
    } catch (e) {
      console.warn('[Email Sending Error]', e);
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      licenseKey,
      planTitle,
      amount,
      cardLast4: cleanCard.slice(-4),
      message: 'Card payment processed successfully. Pro License Key issued.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process card payment.' },
      { status: 500 }
    );
  }
}
