import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[Products Debug] Starting diagnostics...');
    
    // Check database connection
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    console.log('[Products Debug] Has DATABASE_URL:', hasDatabaseUrl);
    
    if (!hasDatabaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL environment variable not set',
        hasDatabaseUrl: false
      });
    }
    
    // Test database connection
    console.log('[Products Debug] Testing database connection...');
    await prisma.$connect();
    console.log('[Products Debug] ✅ Database connected');
    
    // Count products
    console.log('[Products Debug] Counting products...');
    const productCount = await prisma.product.count();
    console.log('[Products Debug] Product count:', productCount);
    
    // Count categories
    console.log('[Products Debug] Counting categories...');
    const categoryCount = await prisma.category.count();
    console.log('[Products Debug] Category count:', categoryCount);
    
    // Get sample category
    console.log('[Products Debug] Fetching sample category...');
    const sampleCategory = await prisma.category.findFirst();
    console.log('[Products Debug] Sample category:', sampleCategory?.id);
    
    // Check recent products
    console.log('[Products Debug] Fetching recent products...');
    const recentProducts = await prisma.product.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });
    console.log('[Products Debug] Recent products count:', recentProducts.length);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      hasDatabaseUrl: true,
      stats: {
        products: productCount,
        categories: categoryCount,
        recentProducts: recentProducts.length
      },
      sampleCategory: sampleCategory ? {
        id: sampleCategory.id,
        name: sampleCategory.name
      } : null,
      recentProducts: recentProducts.map(p => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt
      }))
    });
    
  } catch (error) {
    console.error('[Products Debug] ❌ Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.name : 'Unknown',
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
