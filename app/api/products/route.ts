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
    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      categoryId,
      stock,
      status,
      images,
      sku,
      brand,
      tags,
      featured
    } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        stock: parseInt(stock),
        status: status || 'active',
        sku,
        brand,
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
