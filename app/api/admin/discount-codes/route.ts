import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const codes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(codes);
  } catch (error) {
    console.error('Fetch Discount Codes Error:', error);
    return NextResponse.json({ error: 'Failed to fetch discount codes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discountType, discountAmount, expiresAt, usageLimit, specificEmail } = body;

    if (!code || !discountType || discountAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountAmount: parseFloat(discountAmount),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        specificEmail: specificEmail || null,
        active: true
      }
    });

    return NextResponse.json(discountCode);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
    }
    console.error('Create Discount Code Error:', error);
    return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing code ID' }, { status: 400 });
    }

    const discountCode = await prisma.discountCode.update({
      where: { id },
      data: { active }
    });

    return NextResponse.json(discountCode);
  } catch (error) {
    console.error('Update Discount Code Error:', error);
    return NextResponse.json({ error: 'Failed to update discount code' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing code ID' }, { status: 400 });
    }

    await prisma.discountCode.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Discount Code Error:', error);
    return NextResponse.json({ error: 'Failed to delete discount code' }, { status: 500 });
  }
}
