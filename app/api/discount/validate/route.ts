import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email, subtotal } = body;

    if (!code || subtotal === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!discountCode) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 });
    }

    if (!discountCode.active) {
      return NextResponse.json({ error: 'This discount code is inactive' }, { status: 400 });
    }

    if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This discount code has expired' }, { status: 400 });
    }

    if (discountCode.usageLimit && discountCode.timesUsed >= discountCode.usageLimit) {
      return NextResponse.json({ error: 'This discount code has reached its usage limit' }, { status: 400 });
    }

    if (discountCode.specificEmail && email && discountCode.specificEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'This discount code is not valid for your email address' }, { status: 400 });
    }

    let calculatedDiscount = 0;
    if (discountCode.discountType === 'percentage') {
      calculatedDiscount = (subtotal * discountCode.discountAmount) / 100;
    } else if (discountCode.discountType === 'fixed') {
      calculatedDiscount = discountCode.discountAmount;
    }

    // Ensure discount doesn't exceed subtotal
    calculatedDiscount = Math.min(calculatedDiscount, subtotal);

    return NextResponse.json({
      valid: true,
      discountType: discountCode.discountType,
      discountAmount: discountCode.discountAmount,
      calculatedDiscount
    });
  } catch (error) {
    console.error('Discount Validation Error:', error);
    return NextResponse.json({ error: 'Internal server error validating code' }, { status: 500 });
  }
}
