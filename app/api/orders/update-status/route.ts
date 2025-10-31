import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST endpoint to update order status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;
    
    console.log('[Order Status Update] Request:', { orderId, status });
    
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Get current order to check previous status
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });
    
    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // If changing to cancelled, restore stock
    if (status === 'cancelled' && currentOrder.orderStatus !== 'cancelled') {
      console.log('[Order Status Update] Order cancelled - restoring stock for', currentOrder.items.length, 'items');
      
      for (const item of currentOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
        console.log('[Order Status Update] Restored', item.quantity, 'units for product', item.productId);
      }
    }
    
    // If changing from cancelled to another status, deduct stock again
    if (currentOrder.orderStatus === 'cancelled' && status !== 'cancelled') {
      console.log('[Order Status Update] Order reactivated - deducting stock for', currentOrder.items.length, 'items');
      
      for (const item of currentOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
        console.log('[Order Status Update] Deducted', item.quantity, 'units for product', item.productId);
      }
    }
    
    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status }
    });

    console.log('[Order Status Update] Success:', order.orderNumber, 'status changed to', status);
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[Order Status Update] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
