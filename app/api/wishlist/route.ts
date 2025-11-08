import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// GET - Get wishlist for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { sessionId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1
            },
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const { sessionId, productId } = await request.json();

    if (!sessionId || !productId) {
      return NextResponse.json(
        { error: 'Session ID and Product ID required' },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        sessionId_productId: { sessionId, productId }
      }
    });

    if (existing) {
      return NextResponse.json({ message: 'Already in wishlist', wishlist: existing });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: { sessionId, productId }
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const productId = searchParams.get('productId');

    if (!sessionId || !productId) {
      return NextResponse.json(
        { error: 'Session ID and Product ID required' },
        { status: 400 }
      );
    }

    await prisma.wishlist.delete({
      where: {
        sessionId_productId: { sessionId, productId }
      }
    });

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
