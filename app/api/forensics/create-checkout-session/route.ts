import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, customerEmail } = body;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY is not configured in server environment.',
      }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' as any });

    let planName = 'ForensicLens Pro Monthly';
    let unitAmount = 499; // $4.99

    if (planId === 'lifetime') {
      planName = 'ForensicLens Pro Founder Lifetime';
      unitAmount = 3900; // $39.00
    }

    const origin = request.headers.get('origin') || 'https://www.itservicesfreetown.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: 'Official BridgeTech ForensicLens Pro License Key with Unlimited AI & ELA Analysis',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/forensics-pro/pricing?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${origin}/forensics-pro/pricing?status=cancelled`,
      metadata: {
        planId,
        customerEmail,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to initialize Stripe checkout session' }, { status: 500 });
  }
}
