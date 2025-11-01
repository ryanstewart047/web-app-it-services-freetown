import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE endpoint to delete an order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    console.log('[Order Delete] Request:', { orderId });

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order to restore stock before deleting
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('[Order Delete] Restoring stock for', order.items.length, 'items');

    // Restore stock for all items
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
      console.log('[Order Delete] Restored', item.quantity, 'units for product', item.productId);
    }

    // Delete order items first (due to foreign key constraints)
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    // Delete the order
    await prisma.order.delete({
      where: { id: orderId }
    });

    console.log('[Order Delete] ✅ Order deleted successfully:', order.orderNumber);
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });

  } catch (error) {
    console.error('[Order Delete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
