import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    
    console.log('[Order API] Fetching order:', orderNumber);

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: {
                  take: 1,
                  orderBy: {
                    order: 'asc'
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      console.error('[Order API] Order not found:', orderNumber);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform the data to include image URL
    const transformedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          name: item.product.name,
          image: item.product.images[0]?.url || '/placeholder-product.jpg'
        }
      }))
    };

    console.log('[Order API] Order found successfully');
    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('[Order API] Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
