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
    
    // Extract images if provided
    const { images, ...updateData } = updates;
    
    // Validate stock if provided
    if ('stock' in updateData) {
      const stock = parseInt(updateData.stock);
      if (isNaN(stock) || stock < 0) {
        console.error('[Product Update API] Invalid stock value:', updateData.stock);
        return NextResponse.json({ error: 'Stock must be a non-negative number' }, { status: 400 });
      }
      updateData.stock = stock;
      
      // Auto-update status based on stock
      if (stock === 0 && !('status' in updateData)) {
        updateData.status = 'out_of_stock';
        console.log('[Product Update API] Auto-setting status to out_of_stock (stock is 0)');
      } else if (stock > 0 && !('status' in updateData)) {
        // Get current status to check if we should reactivate
        const currentProduct = await prisma.product.findUnique({
          where: { id },
          select: { status: true }
        });
        if (currentProduct?.status === 'out_of_stock') {
          updateData.status = 'active';
          console.log('[Product Update API] Auto-reactivating product (stock > 0)');
        }
      }
    }
    
    // Validate status if provided
    if ('status' in updateData) {
      const validStatuses = ['active', 'out_of_stock', 'discontinued'];
      if (!validStatuses.includes(updateData.status)) {
        console.error('[Product Update API] Invalid status:', updateData.status);
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
    }
    
    console.log('[Product Update API] Updating product in database...');
    
    // Handle images separately
    let imageUpdates = {};
    if (images && Array.isArray(images) && images.length > 0) {
      console.log('[Product Update API] Updating images...', images);
      // Delete existing images and create new ones
      imageUpdates = {
        images: {
          deleteMany: {},
          create: images.map((img: any, index: number) => {
            // Handle both string URLs and image objects
            if (typeof img === 'string') {
              return { url: img, order: index };
            }
            return { url: img.url, order: img.order ?? index };
          })
        }
      };
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...imageUpdates
      },
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
