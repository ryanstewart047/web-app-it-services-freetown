import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'No products provided. Expected an array of products.' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as any[],
      failed: [] as { row: number; name: string; error: string }[],
    };

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      try {
        const { name, description, price, comparePrice, categoryId, stock, status, condition, sku, brand, tags, featured, images } = item;

        if (!name || !description || !price || !categoryId) {
          results.failed.push({
            row: i + 1,
            name: name || `Row ${i + 1}`,
            error: 'Missing required fields: name, description, price, categoryId',
          });
          continue;
        }

        const slug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

        const product = await prisma.product.create({
          data: {
            name,
            slug,
            description,
            price: parseFloat(String(price)),
            comparePrice: comparePrice ? parseFloat(String(comparePrice)) : null,
            categoryId,
            stock: parseInt(String(stock)) || 0,
            status: status || 'active',
            condition: condition || 'new',
            sku: sku || null,
            brand: brand || null,
            tags: tags || [],
            featured: featured || false,
            images: {
              create: (images || []).map((img: any, index: number) => ({
                url: img.url || img,
                alt: typeof img === 'string' ? name : (img.alt || name),
                order: index,
              })),
            },
          },
          include: {
            category: true,
            images: true,
          },
        });

        results.success.push({ id: product.id, name: product.name, slug: product.slug });
      } catch (err) {
        results.failed.push({
          row: i + 1,
          name: item.name || `Row ${i + 1}`,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      message: `Bulk upload complete: ${results.success.length} succeeded, ${results.failed.length} failed`,
      total: products.length,
      successCount: results.success.length,
      failedCount: results.failed.length,
      success: results.success,
      failed: results.failed,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk upload', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
