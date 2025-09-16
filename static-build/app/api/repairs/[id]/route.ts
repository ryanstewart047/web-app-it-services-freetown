import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repair = await prisma.repair.findUnique({
      where: {
        id: params.id,
      },
      include: {
        customer: true,
      },
    });

    if (!repair) {
      return NextResponse.json(
        { error: 'Repair not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(repair);
  } catch (error) {
    console.error('Error fetching repair:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes } = body;

    const repair = await prisma.repair.update({
      where: {
        id: params.id,
      },
      data: {
        status,
        notes,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(repair);
  } catch (error) {
    console.error('Error updating repair:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}