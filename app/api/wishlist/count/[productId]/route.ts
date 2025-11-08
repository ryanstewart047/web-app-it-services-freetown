import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get wishlist count for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const count = await prisma.wishlist.count({
      where: { productId: params.productId }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}
