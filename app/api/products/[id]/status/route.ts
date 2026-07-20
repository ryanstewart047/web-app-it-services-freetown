import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST endpoint to update product status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;
    
    console.log('Updating product status:', { id: params.id, status });
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { status },
      include: {
        category: true,
        images: true
      }
    });

    console.log('Product status updated successfully:', product.id);
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 });
  }
}
