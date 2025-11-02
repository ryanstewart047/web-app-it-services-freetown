import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all categories
export async function GET() {
  try {
    // Check if database is configured
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes('YOUR_PASSWORD_HERE') || dbUrl.includes('YOUR_HOST_HERE')) {
      console.error('❌ Database not configured. Please set up POSTGRES_URL or DATABASE_URL in .env.local');
      return NextResponse.json({ 
        error: 'Database not configured',
        message: 'Please configure your database connection. See VERCEL_POSTGRES_SETUP.md for instructions.',
        categories: [] // Return empty array for graceful fallback
      }, { status: 503 });
    }

    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Check if it's a connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Cannot connect to database. Please check your POSTGRES_URL configuration.',
        categories: [] // Return empty array for graceful fallback
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch categories',
      message: errorMessage,
      categories: [] // Return empty array for graceful fallback
    }, { status: 500 });
  }
}

// POST new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, image } = body;

    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        image
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
