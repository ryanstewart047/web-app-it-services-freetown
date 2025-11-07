import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    
    const where: any = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (featured) where.featured = featured === 'true';

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST new product
export async function POST(request: NextRequest) {
  try {
    console.log('[Products API] POST - Starting product creation...');
    
    const body = await request.json();
    console.log('[Products API] Request body:', JSON.stringify(body, null, 2));
    
    const {
      name,
      description,
      price,
      comparePrice,
      categoryId,
      stock,
      status,
      condition,
      images,
      sku,
      brand,
      tags,
      featured
    } = body;

    // Validation
    if (!name || !description || !price || !categoryId) {
      console.error('[Products API] Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, categoryId' },
        { status: 400 }
      );
    }

    console.log('[Products API] Validation passed');
    console.log('[Products API] Generating slug from name:', name);

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    console.log('[Products API] Generated slug:', slug);
    console.log('[Products API] Creating product in database...');

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        stock: parseInt(stock) || 0,
        status: status || 'active',
        condition: condition || 'new',
        sku: sku || null,
        brand: brand || null,
        tags: tags || [],
        featured: featured || false,
        images: {
          create: images?.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || name,
            order: index
          })) || []
        }
      },
      include: {
        category: true,
        images: true
      }
    });

    console.log('[Products API] ✅ Product created successfully:', product.id);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[Products API] ❌ Error creating product:', error);
    console.error('[Products API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
