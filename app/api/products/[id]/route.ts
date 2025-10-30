import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await Promise.resolve(params);
    const product = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
      include: {
        category: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PATCH update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await Promise.resolve(params);
    const body = await request.json();
    
    const product = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: body,
      include: {
        category: true,
        images: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await Promise.resolve(params);
    await prisma.product.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
