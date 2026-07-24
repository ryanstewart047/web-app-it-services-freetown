import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Delete related records first
    await prisma.wishlist.deleteMany({
      where: { productId }
    });

    await prisma.cartItem.deleteMany({
      where: { productId }
    });

    await prisma.productImage.deleteMany({
      where: { productId }
    });

    // Now delete the product
    const deletedProduct = await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully',
      productId: deletedProduct.id,
      productName: deletedProduct.name
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
