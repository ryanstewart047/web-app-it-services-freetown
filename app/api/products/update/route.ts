import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST endpoint to update any product field
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;
    
    console.log('[Product Update API] Received request:', { id, updates });
    
    if (!id) {
      console.error('[Product Update API] Missing product ID');
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    if (!updates || typeof updates !== 'object') {
      console.error('[Product Update API] Invalid updates object');
      return NextResponse.json({ error: 'Updates object is required' }, { status: 400 });
    }
    
    // Validate stock if provided
    if ('stock' in updates) {
      const stock = parseInt(updates.stock);
      if (isNaN(stock) || stock < 0) {
        console.error('[Product Update API] Invalid stock value:', updates.stock);
        return NextResponse.json({ error: 'Stock must be a non-negative number' }, { status: 400 });
      }
      updates.stock = stock;
      
      // Auto-update status based on stock
      if (stock === 0 && !('status' in updates)) {
        updates.status = 'out_of_stock';
        console.log('[Product Update API] Auto-setting status to out_of_stock (stock is 0)');
      } else if (stock > 0 && !('status' in updates)) {
        // Get current status to check if we should reactivate
        const currentProduct = await prisma.product.findUnique({
          where: { id },
          select: { status: true }
        });
        if (currentProduct?.status === 'out_of_stock') {
          updates.status = 'active';
          console.log('[Product Update API] Auto-reactivating product (stock > 0)');
        }
      }
    }
    
    // Validate status if provided
    if ('status' in updates) {
      const validStatuses = ['active', 'out_of_stock', 'discontinued'];
      if (!validStatuses.includes(updates.status)) {
        console.error('[Product Update API] Invalid status:', updates.status);
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
    }
    
    console.log('[Product Update API] Updating product in database...');
    
    const product = await prisma.product.update({
      where: { id },
      data: updates,
      include: {
        category: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    console.log('[Product Update API] Product updated successfully:', product.id);
    
    return NextResponse.json({ 
      success: true, 
      product 
    });
  } catch (error: any) {
    console.error('[Product Update API] Error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error.message 
    }, { status: 500 });
  }
}
