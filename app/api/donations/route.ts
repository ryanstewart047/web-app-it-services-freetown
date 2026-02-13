import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all donations + stats
export async function GET() {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        amount: true,
        method: true,
        message: true,
        createdAt: true,
      },
    });

    // Calculate total raised
    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    const donorCount = donations.length;

    return NextResponse.json({
      donations,
      totalRaised,
      donorCount,
    });
  } catch (error) {
    console.error('[Donations API] Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

// POST new donation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, amount, method, phone, email, message } = body;

    // Validate required fields
    if (!name || !amount || !method) {
      return NextResponse.json(
        { error: 'Name, amount, and method are required' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate method
    if (!['Orange Money', 'Card'].includes(method)) {
      return NextResponse.json(
        { error: 'Method must be "Orange Money" or "Card"' },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        name,
        amount: parsedAmount,
        method,
        phone: phone || null,
        email: email || null,
        message: message || null,
      },
    });

    console.log(`[Donations API] New donation: ${name} - Le ${parsedAmount} via ${method}`);

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        name: donation.name,
        amount: donation.amount,
        method: donation.method,
        createdAt: donation.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[Donations API] Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to record donation' },
      { status: 500 }
    );
  }
}
