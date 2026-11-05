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

function domainMatches(ruleDomain: string, requestDomain: string): boolean {
  if (!ruleDomain || !requestDomain) return false;
  const r = normalizeDomain(ruleDomain);
  const req = normalizeDomain(requestDomain);
  if (r === req) return true;
  if (req.endsWith('.' + r)) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  };

  try {
    const { searchParams } = new URL(request.url);
    const siteParam = searchParams.get('site');
    const adIdParam = searchParams.get('adId');
    const sizeParam = searchParams.get('size');

    // Determine requesting domain
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const requestingDomain = normalizeDomain(siteParam || referer || origin || '');

    // 1. Check if the requesting website is globally blocked from showing ads
    if (requestingDomain) {
      const globalPlacement = await prisma.adWebsitePlacement.findFirst({
        where: { domain: requestingDomain, adId: null }
      });

      if (globalPlacement && !globalPlacement.enabled) {
        // Ads completely disabled for this website
        return NextResponse.json({ ad: null, reason: 'Site disabled' }, { headers: corsHeaders });
      }
    }

    // 2. Fetch active ads from the database
    const whereClause: any = { active: true };
    if (adIdParam) {
      whereClause.id = adIdParam;
    }

    const allActiveAds = await prisma.customAd.findMany({
      where: whereClause
    });

    if (allActiveAds.length === 0) {
      return NextResponse.json({ ad: null }, { headers: corsHeaders });
    }

    // 3. Filter ads based on website-specific enable/disable settings
    let eligibleAds = allActiveAds;

    if (requestingDomain) {
      // Fetch any specific placement overrides for this domain
      const placementRules = await prisma.adWebsitePlacement.findMany({
        where: { domain: requestingDomain, adId: { not: null } }
      });

      const disabledAdIdsOnThisDomain = new Set<string>();
      for (const rule of placementRules) {
        if (!rule.enabled && rule.adId) {
          disabledAdIdsOnThisDomain.add(rule.adId);
        }
      }

      eligibleAds = allActiveAds.filter((ad) => {
        // Check database placement override
        if (disabledAdIdsOnThisDomain.has(ad.id)) {
          return false;
        }

        // Check ad's own disabledWebsites list
        if (ad.disabledWebsites) {
          try {
            const blockedSites: string[] = JSON.parse(ad.disabledWebsites);
            if (Array.isArray(blockedSites)) {
              const isBlocked = blockedSites.some((blocked) => domainMatches(blocked, requestingDomain));
              if (isBlocked) {
                return false;
              }
            }
          } catch {
            // Ignore parse errors
          }
        }

        return true;
      });
    }

    // If size is requested and we have matching ads, prioritize that size
    if (sizeParam) {
      const sizeMatched = eligibleAds.filter(a => a.size === sizeParam);
      if (sizeMatched.length > 0) {
        eligibleAds = sizeMatched;
      }
    }

    if (eligibleAds.length === 0) {
      // Record this domain check in background so admin sees it under connected sites
      if (requestingDomain) {
        recordDomainVisit(requestingDomain, null, false).catch(() => {});
      }
      return NextResponse.json({ ad: null }, { headers: corsHeaders });
    }

    // 4. Pick a random ad among eligible ads
    const selectedAd = eligibleAds[Math.floor(Math.random() * eligibleAds.length)];

    // 5. Asynchronously record impression & website stats in the background
    recordDomainVisit(requestingDomain, selectedAd.id, true).catch((err) => {
      console.error('Failed to record ad impression:', err);
    });

    return NextResponse.json({ ad: selectedAd }, { headers: corsHeaders });
  } catch (error) {
    console.error('Ad Serve Error:', error);
    return NextResponse.json(
      { error: 'Failed to serve ad', ad: null },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Background helper to track impression & auto-discover connected website
async function recordDomainVisit(domain: string, adId: string | null, served: boolean) {
  try {
    if (adId && served) {
      // Increment global ad impression
      await prisma.customAd.update({
        where: { id: adId },
        data: { impressions: { increment: 1 } }
      });
    }

    if (!domain) return;

    // Track/update global website placement
    const globalRecord = await prisma.adWebsitePlacement.findFirst({
      where: { domain, adId: null }
    });

    if (globalRecord) {
      await prisma.adWebsitePlacement.update({
        where: { id: globalRecord.id },
        data: {
          impressions: served ? { increment: 1 } : undefined,
          lastSeenAt: new Date()
        }
      });
    } else {
      await prisma.adWebsitePlacement.create({
        data: {
          id: `site_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          domain,
          adId: null,
          enabled: true,
          impressions: served ? 1 : 0,
          lastSeenAt: new Date()
        }
      });
    }

    // Also track specific (domain, adId) stats if served
    if (adId && served) {
      const adRecord = await prisma.adWebsitePlacement.findFirst({
        where: { domain, adId }
      });

      if (adRecord) {
        await prisma.adWebsitePlacement.update({
          where: { id: adRecord.id },
          data: {
            impressions: { increment: 1 },
            lastSeenAt: new Date()
          }
        });
      } else {
        await prisma.adWebsitePlacement.create({
          data: {
            id: `site_ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            domain,
            adId,
            enabled: true,
            impressions: 1,
            lastSeenAt: new Date()
          }
        });
      }
    }
  } catch (error) {
    // Non-fatal background error
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
  return response;
}
