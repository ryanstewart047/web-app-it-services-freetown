import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      mobileMoneyNumber,
      notes
    } = body;

    console.log('[Order Creation] Creating order for:', customerName);
    console.log('[Order Creation] Items:', items.length);

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    console.log('[Order Creation] Generated order number:', orderNumber);

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax) || 0,
        total: parseFloat(total),
        paymentMethod,
        mobileMoneyNumber,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            subtotal: parseFloat(item.price) * parseInt(item.quantity)
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: parseInt(item.quantity)
          }
        }
      });
    }

    console.log('[Order Creation] Order created successfully:', orderNumber);

    // Send Confirmation Emails
    try {
      // 1. Send to Customer
      const customerEmailData = emailTemplates.orderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        items: order.items.map(item => ({
          name: (item as any).product?.name || 'Product',
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: order.paymentMethod
      });

      await sendEmail({
        to: order.customerEmail,
        ...customerEmailData
      });

      // 2. Send to Admin
      const adminEmailData = emailTemplates.adminOrderNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        total: order.total,
        items: order.items.map(item => ({
          name: (item as any).product?.name || 'Product',
          quantity: item.quantity
        })),
        paymentMethod: order.paymentMethod
      });

      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'info@itservicesfreetown.com',
        ...adminEmailData
      });

      console.log('[Order Creation] Notification emails sent');
    } catch (emailError) {
      console.error('[Order Creation] Failed to send notification emails:', emailError);
      // We don't fail the order if emails fail
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// GET all orders (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    const where: any = {};
    if (status) where.orderStatus = status;
    if (email) where.customerEmail = email;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
