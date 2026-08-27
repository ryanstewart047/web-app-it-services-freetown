import { NextRequest, NextResponse } from 'next/server';
import { getSurpriseReveal, submitSurpriseRevealPayment } from '@/lib/surprise-reveal-storage';
import { emailTemplates, sendEmail } from '@/lib/email';

const PLAN_NAMES: Record<string, { name: string; amount: string }> = {
  single: { name: 'Single Certificate Download', amount: 'Le 25' },
  monthly: { name: 'Monthly Pass (5 Uses)', amount: 'Le 150' },
  lifetime: { name: 'Lifetime VIP Pass (Unlimited)', amount: 'Le 500' },
};

const PAYMENT_METHODS: Record<string, string> = {
  orange_money: 'Orange Money (*144*2*2*241586#)',
  afrimoney: 'AfriMoney (*161*6*2*088294631#)',
  paypal: 'PayPal International Gateway',
  cash: 'Cash / Direct Agent',
};

function getPublicUrl(request: NextRequest, code: string) {
  const origin = request.headers.get('x-forwarded-host')
    ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host')}`
    : request.nextUrl.origin;
  return `${origin}/surprise/${code}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, customerEmail, customerPhone, selectedPlan, paymentMethod } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Reveal code is required.' }, { status: 400 });
    }

    if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email address is required to receive your certificate.' }, { status: 400 });
    }

    const reveal = await getSurpriseReveal(code);
    if (!reveal) {
      return NextResponse.json({ success: false, error: 'Surprise reveal not found.' }, { status: 404 });
    }

    const planKey = selectedPlan in PLAN_NAMES ? selectedPlan : 'single';
    const planInfo = PLAN_NAMES[planKey];
    const paymentMethodLabel = PAYMENT_METHODS[paymentMethod] || 'Orange Money / AfriMoney / PayPal';

    const updated = await submitSurpriseRevealPayment(code, {
      customerEmail: customerEmail.trim(),
      customerPhone: typeof customerPhone === 'string' ? customerPhone.trim() : '',
      selectedPlan: planKey,
      paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : 'orange_money',
    });

    const revealUrl = getPublicUrl(request, code);

    // Send automatic payment received email to customer
    try {
      const template = emailTemplates.surprisePaymentSubmitted({
        recipientName: reveal.recipientName,
        achievement: reveal.achievement,
        planName: planInfo.name,
        amount: planInfo.amount,
        paymentMethod: paymentMethodLabel,
        code,
        revealUrl,
      });

      await sendEmail({
        to: customerEmail.trim(),
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (emailErr) {
      console.warn('[Surprise Reveal Payment] Confirmation email send warning:', emailErr);
    }

    const waMessage = `Hello BridgeTec! I have sent payment (${planInfo.amount} for ${planInfo.name} via ${paymentMethodLabel}) for the Certificate:\n\n👤 Recipient: ${reveal.recipientName}\n🔑 Code: ${code}\n📧 My Email: ${customerEmail.trim()}\n\nPlease verify and approve my download!`;
    const waUrl = `https://wa.me/23233399391?text=${encodeURIComponent(waMessage)}`;

    return NextResponse.json({
      success: true,
      reveal: updated,
      waUrl,
      message: 'Payment proof recorded! We sent a confirmation email to your address.',
    });
  } catch (error) {
    console.error('[Surprise Reveal Submit Payment] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to submit payment details.' },
      { status: 500 }
    );
  }
}
