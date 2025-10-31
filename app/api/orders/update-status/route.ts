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
    
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status }
    });

    console.log('[Order Status Update] Success:', order.orderNumber);
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[Order Status Update] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
