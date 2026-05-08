import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adId = searchParams.get('id');

  if (!adId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const ad = await prisma.customAd.findUnique({
      where: { id: adId }
    });

    if (!ad) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment clicks
    await prisma.customAd.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } }
    });

    // Redirect to the target URL
    // Ensure the URL is absolute
    let targetUrl = ad.targetUrl;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `${request.nextUrl.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
    }

    return NextResponse.redirect(new URL(targetUrl));
  } catch (error) {
    console.error('Ad Click Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
