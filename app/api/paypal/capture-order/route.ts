import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { getSurpriseReveal, updateSurpriseRevealPayment } from '@/lib/surprise-reveal-storage';
import { emailTemplates, sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function getPublicUrl(request: NextRequest, code: string) {
  const origin = request.headers.get('x-forwarded-host')
    ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host')}`
    : request.nextUrl.origin;
  return `${origin}/surprise/${code}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, code, customerEmail, customerPhone, selectedPlan = 'single' } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'Order ID is required.' }, { status: 400 });
    }

    const captureResult = await capturePayPalOrder(orderId);

    if (captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: `Payment not completed. Status: ${captureResult.status}` },
        { status: 400 }
      );
    }

    const email = (customerEmail || captureResult.payer?.email_address || '').trim();
    const payerName = captureResult.payer?.name
      ? `${captureResult.payer.name.given_name || ''} ${captureResult.payer.name.surname || ''}`.trim()
      : '';

    let updatedReveal = null;

    if (code && typeof code === 'string') {
      const existingReveal = await getSurpriseReveal(code);

      updatedReveal = await updateSurpriseRevealPayment(code, 'approved', {
        customerEmail: email,
        customerPhone: customerPhone ? customerPhone.trim() : undefined,
        selectedPlan,
        paymentMethod: 'paypal',
      });

      // Send instant confirmation email with download link
      if (email && email.includes('@')) {
        try {
          const revealUrl = getPublicUrl(request, code);
          const recipientName = existingReveal?.recipientName || 'Celebrant';
          const achievement = existingReveal?.achievement || 'Recognition Award';

          const template = emailTemplates.surprisePaymentApproved({
            recipientName,
            achievement,
            code,
            revealUrl,
          });

          await sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });
        } catch (emailErr) {
          console.warn('[PayPal Capture] Confirmation email error:', emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      captureId: captureResult.captureId,
      status: captureResult.status,
      payer: {
        email,
        name: payerName,
      },
      reveal: updatedReveal,
      message: 'Payment captured and approved successfully!',
    });
  } catch (error) {
    console.error('[PayPal Capture Order API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture PayPal payment.',
      },
      { status: 500 }
    );
  }
}
