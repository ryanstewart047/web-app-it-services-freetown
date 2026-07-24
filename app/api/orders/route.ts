import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { captureEmailLead } from '@/lib/email-leads';
import { requireAdmin, sanitizeText } from '@/lib/admin-guard';

// ─────────────────────────────────────────────────────────────────────────────
// POST  /api/orders  – Create a new order (public, customer-facing)
// SECURITY: Prices and totals are computed server-side from the database.
//           Any price value submitted by the browser is IGNORED.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      discountCode,
      paymentMethod,
      mobileMoneyNumber,
      notes,
    } = body;

    // ── Basic input validation ───────────────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item.' }, { status: 400 });
    }
    if (!customerName || !customerEmail || !paymentMethod) {
      return NextResponse.json({ error: 'Name, email, and payment method are required.' }, { status: 400 });
    }

    // ── Sanitize all free-text customer inputs ───────────────────────────────
    const safeName    = sanitizeText(customerName);
    const safeEmail   = sanitizeText(customerEmail);
    const safePhone   = sanitizeText(customerPhone);
    const safeAddress = sanitizeText(customerAddress);
    const safeNotes   = sanitizeText(notes);

    console.log('[Order Creation] Creating order for:', safeName);
    console.log('[Order Creation] Items:', items.length);

    // ── SERVER-SIDE PRICE VALIDATION ─────────────────────────────────────────
    // Fetch authoritative prices from the database. The price the client
    // submits is COMPLETELY IGNORED – it cannot be manipulated by DevTools.
    const TAX_RATE = 0.0; // Adjust if tax applies (e.g. 0.05 = 5 %)
    let serverSubtotal = 0;
    const resolvedItems: { productId: string; quantity: number; price: number; subtotal: number }[] = [];

    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (!item.productId || isNaN(qty) || qty < 1) {
        return NextResponse.json({ error: 'Invalid item data.' }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: item.productId } });

      if (!product) {
        return NextResponse.json({ error: 'A product in your cart was not found.' }, { status: 400 });
      }
      if (product.stock < qty) {
        return NextResponse.json({
          error: `"${product.name}" is out of stock or has insufficient inventory. Please update your cart.`,
        }, { status: 400 });
      }

      // Use the database price – never the client-supplied price
      const unitPrice   = Number(product.price);
      const itemSubtotal = unitPrice * qty;
      serverSubtotal   += itemSubtotal;

      resolvedItems.push({
        productId: product.id,
        quantity:  qty,
        price:     unitPrice,
        subtotal:  itemSubtotal,
      });
    }

    // ── Validate and resolve discount code (server-side) ─────────────────────
    let serverDiscountAmount = 0;
    let safeDiscountCode: string | null = null;

    if (discountCode) {
      safeDiscountCode = sanitizeText(discountCode).toUpperCase();
      const discount = await prisma.discountCode.findUnique({ where: { code: safeDiscountCode } });

      if (discount && discount.isActive) {
        // Percentage discount
        serverDiscountAmount = discount.discountPercentage
          ? serverSubtotal * (discount.discountPercentage / 100)
          : 0;
      }
    }

    const serverTax   = serverSubtotal * TAX_RATE;
    const serverTotal = serverSubtotal - serverDiscountAmount + serverTax;

    // ── Generate unique order number ──────────────────────────────────────────
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('[Order Creation] Generated order number:', orderNumber);

    // ── Persist order with server-computed totals ─────────────────────────────
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName:    safeName,
        customerEmail:   safeEmail,
        customerPhone:   safePhone,
        customerAddress: safeAddress,
        subtotal:        serverSubtotal,
        tax:             serverTax,
        total:           serverTotal,
        discountCode:    safeDiscountCode,
        discountAmount:  serverDiscountAmount,
        paymentMethod:   sanitizeText(paymentMethod),
        mobileMoneyNumber: sanitizeText(mobileMoneyNumber),
        notes:           safeNotes,
        items: {
          create: resolvedItems,
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // ── Decrement stock ───────────────────────────────────────────────────────
    for (const item of resolvedItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // ── Increment discount usage ──────────────────────────────────────────────
    if (safeDiscountCode) {
      await prisma.discountCode.update({
        where: { code: safeDiscountCode },
        data: { timesUsed: { increment: 1 } },
      }).catch(() => { /* Non-fatal if discount code row doesn't exist */ });
    }

    console.log('[Order Creation] Order created successfully:', orderNumber);

    // ── Send confirmation emails ──────────────────────────────────────────────
    try {
      await sendEmail({
        to: order.customerEmail,
        ...emailTemplates.orderConfirmation({
          orderNumber:   order.orderNumber,
          customerName:  order.customerName,
          total:         order.total,
          items:         order.items.map(i => ({
            name:     (i as any).product?.name || 'Product',
            quantity: i.quantity,
            price:    i.price,
          })),
          paymentMethod: order.paymentMethod,
        }),
      });

      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'info@itservicesfreetown.com',
        ...emailTemplates.adminOrderNotification({
          orderNumber:   order.orderNumber,
          customerName:  order.customerName,
          customerPhone: order.customerPhone,
          total:         order.total,
          items:         order.items.map(i => ({
            name:     (i as any).product?.name || 'Product',
            quantity: i.quantity,
          })),
          paymentMethod: order.paymentMethod,
        }),
      });

      console.log('[Order Creation] Notification emails sent');
    } catch (emailError) {
      console.error('[Order Creation] Failed to send notification emails:', emailError);
      // Non-fatal – order is already persisted
    }

    captureEmailLead({ email: safeEmail, name: safeName, phone: safePhone, source: 'order' });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/orders  – List orders (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email  = searchParams.get('email');

    const where: any = {};
    if (status) where.orderStatus = status;
    if (email)  where.customerEmail = email;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
