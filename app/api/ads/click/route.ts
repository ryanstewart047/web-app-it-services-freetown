import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function normalizeDomain(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0]
    .trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adId = searchParams.get('id');
  const siteParam = searchParams.get('site');
  const referer = request.headers.get('referer');
  const domain = normalizeDomain(siteParam || referer || '');

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

    // Increment global clicks
    await prisma.customAd.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } }
    });

    // Also increment website clicks in background if domain is known
    if (domain) {
      Promise.all([
        prisma.adWebsitePlacement.findFirst({ where: { domain, adId: null } }).then(rec => {
          if (rec) {
            return prisma.adWebsitePlacement.update({
              where: { id: rec.id },
              data: { clicks: { increment: 1 } }
            });
          }
        }),
        prisma.adWebsitePlacement.findFirst({ where: { domain, adId } }).then(rec => {
          if (rec) {
            return prisma.adWebsitePlacement.update({
              where: { id: rec.id },
              data: { clicks: { increment: 1 } }
            });
          }
        }),
      ]).catch(() => {});
    }

    // Redirect to the target URL
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
