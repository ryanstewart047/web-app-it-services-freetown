import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get all ads
export async function GET(request: NextRequest) {
  try {
    const ads = await prisma.customAd.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(ads);
  } catch (error) {
    console.error('Fetch Ads Error:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

// Create an ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, targetUrl } = body;

    if (!title || !imageUrl || !targetUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ad = await prisma.customAd.create({
      data: {
        title,
        description,
        imageUrl,
        targetUrl,
      }
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Create Ad Error Details:', error);
    return NextResponse.json({ error: `Failed to create ad: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

// Update an ad
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, imageUrl, targetUrl, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing ad ID' }, { status: 400 });
    }

    const ad = await prisma.customAd.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        targetUrl,
        active,
      }
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Update Ad Error:', error);
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
  }
}

// Delete an ad
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ad ID' }, { status: 400 });
    }

    await prisma.customAd.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Ad Error:', error);
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
  }
}
