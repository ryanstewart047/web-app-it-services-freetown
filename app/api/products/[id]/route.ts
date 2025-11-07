import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

// Enable all HTTP methods
export const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT update product (using PUT instead of PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    console.log('PUT request received for product:', params.id, 'with data:', JSON.stringify(body, null, 2));
    
    // Extract images from body
    const { images, ...productData } = body;
    
    // Ensure condition field is included (default to 'new' if not provided)
    const updateData = {
      ...productData,
      condition: productData.condition || 'new'
    };
    
    console.log('Update data prepared:', JSON.stringify(updateData, null, 2));
    
    // First, delete existing images
    if (images && images.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: params.id }
      });
    }
    
    // Then update the product with new images
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...updateData,
        images: images && images.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || updateData.name,
            order: img.order !== undefined ? img.order : index
          }))
        } : undefined
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

    console.log('Product updated successfully:', product.id);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PATCH update product (keeping for backward compatibility)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    console.log('PATCH request received for product:', params.id, 'with data:', JSON.stringify(body, null, 2));
    
    // Ensure condition field is included (default to 'new' if not provided)
    const updateData = {
      ...body,
      condition: body.condition || 'new'
    };
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        images: true
      }
    });

    console.log('Product updated successfully:', product.id);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
