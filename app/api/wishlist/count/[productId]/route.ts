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
    // Silently return 0 if database is not configured
    // This prevents console errors when DB is not set up
    return NextResponse.json({ count: 0 });
  }
}
