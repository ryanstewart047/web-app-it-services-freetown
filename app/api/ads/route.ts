import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatAd(ad: any) {
  let disabledWebsites: string[] = [];
  try {
    if (ad.disabledWebsites) {
      const parsed = JSON.parse(ad.disabledWebsites);
      if (Array.isArray(parsed)) disabledWebsites = parsed;
    }
  } catch {
    disabledWebsites = [];
  }
  return {
    ...ad,
    disabledWebsites,
  };
}

// Get all ads
export async function GET(request: NextRequest) {
  try {
    const ads = await prisma.customAd.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(ads.map(formatAd));
  } catch (error) {
    console.error('Fetch Ads Error:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

// Create an ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, targetUrl, size, active, disabledWebsites } = body;

    if (!title || !imageUrl || !targetUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ad = await prisma.customAd.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl.trim(),
        targetUrl: targetUrl.trim(),
        size: size || 'rectangle',
        active: active !== undefined ? !!active : true,
        disabledWebsites: Array.isArray(disabledWebsites) ? JSON.stringify(disabledWebsites) : '[]',
      }
    });

    return NextResponse.json(formatAd(ad));
  } catch (error) {
    console.error('Create Ad Error Details:', error);
    return NextResponse.json({ error: `Failed to create ad: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

// Update an ad
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, imageUrl, targetUrl, size, active, disabledWebsites } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing ad ID' }, { status: 400 });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl.trim();
    if (active !== undefined) updateData.active = !!active;
    if (size !== undefined) updateData.size = size;
    if (disabledWebsites !== undefined) {
      updateData.disabledWebsites = Array.isArray(disabledWebsites)
        ? JSON.stringify(disabledWebsites)
        : (typeof disabledWebsites === 'string' ? disabledWebsites : '[]');
    }

    const ad = await prisma.customAd.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(formatAd(ad));
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

    // Clean up placements for this ad
    await prisma.adWebsitePlacement.deleteMany({
      where: { adId: id }
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Ad Error:', error);
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
  }
}
