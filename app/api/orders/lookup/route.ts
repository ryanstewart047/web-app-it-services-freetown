import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET order by order number (using query parameter instead of dynamic route)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    
    console.log('[Order Lookup API] Looking up order:', orderNumber);

    if (!orderNumber) {
      console.error('[Order Lookup API] No order number provided');
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    // Case-insensitive order lookup
    const order = await prisma.order.findFirst({
      where: { 
        orderNumber: {
          equals: orderNumber,
          mode: 'insensitive'
        }
      },
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
      console.error('[Order Lookup API] Order not found:', orderNumber);
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

    console.log('[Order Lookup API] Order found successfully:', orderNumber);
    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('[Order Lookup API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
