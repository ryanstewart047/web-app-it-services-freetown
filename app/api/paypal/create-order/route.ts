import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';

const PLAN_AMOUNTS: Record<string, { amount: string; name: string }> = {
  single: { amount: '1.25', name: 'BridgeTec Single Certificate' },
  monthly: { amount: '7.50', name: 'BridgeTec Monthly Pass (5 Uses)' },
  lifetime: { amount: '25.00', name: 'BridgeTec Lifetime VIP Pass' },
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId = 'single', code = '', recipientName = 'Celebrant', customerEmail = '' } = body;

    const plan = PLAN_AMOUNTS[planId] || PLAN_AMOUNTS.single;

    const order = await createPayPalOrder({
      amount: plan.amount,
      currency: 'USD',
      description: `${plan.name} for ${recipientName}`,
      referenceId: code || `ORDER-${Date.now()}`,
      customerEmail: customerEmail || undefined,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: plan.amount,
      currency: 'USD',
    });
  } catch (error) {
    console.error('[PayPal Create Order API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create PayPal order.',
      },
      { status: 500 }
    );
  }
}
