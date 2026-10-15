import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function normalizeDomain(input: string): string {
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

// GET /api/ads/websites - list all connected domains, their stats, and per-ad overrides
export async function GET(request: NextRequest) {
  try {
    const placements = await prisma.adWebsitePlacement.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    const ads = await prisma.customAd.findMany({
      select: { id: true, title: true, active: true, disabledWebsites: true }
    });

    // Group placements by domain
    const domainMap: Record<string, {
      domain: string;
      globalEnabled: boolean;
      totalImpressions: number;
      totalClicks: number;
      lastSeenAt: string;
      adRules: Record<string, boolean>; // adId -> enabled
    }> = {};

    // First collect all domains from placements
    for (const p of placements) {
      const normDomain = normalizeDomain(p.domain);
      if (!normDomain) continue;

      if (!domainMap[normDomain]) {
        domainMap[normDomain] = {
          domain: normDomain,
          globalEnabled: true,
          totalImpressions: 0,
          totalClicks: 0,
          lastSeenAt: p.lastSeenAt.toISOString(),
          adRules: {}
        };
      }

      if (p.adId === null) {
        domainMap[normDomain].globalEnabled = p.enabled;
        domainMap[normDomain].totalImpressions += p.impressions;
        domainMap[normDomain].totalClicks += p.clicks;
      } else {
        domainMap[normDomain].adRules[p.adId] = p.enabled;
        domainMap[normDomain].totalImpressions += p.impressions;
        domainMap[normDomain].totalClicks += p.clicks;
      }

      if (new Date(p.lastSeenAt) > new Date(domainMap[normDomain].lastSeenAt)) {
        domainMap[normDomain].lastSeenAt = p.lastSeenAt.toISOString();
      }
    }

    // Also collect any domains found in ad.disabledWebsites
    for (const ad of ads) {
      if (ad.disabledWebsites) {
        try {
          const list: string[] = JSON.parse(ad.disabledWebsites);
          if (Array.isArray(list)) {
            for (const item of list) {
              const normDomain = normalizeDomain(item);
              if (!normDomain) continue;
              if (!domainMap[normDomain]) {
                domainMap[normDomain] = {
                  domain: normDomain,
                  globalEnabled: true,
                  totalImpressions: 0,
                  totalClicks: 0,
                  lastSeenAt: new Date().toISOString(),
                  adRules: {}
                };
              }
              domainMap[normDomain].adRules[ad.id] = false;
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    }

    const websites = Object.values(domainMap).sort((a, b) => b.totalImpressions - a.totalImpressions);

    return NextResponse.json({ websites, ads });
  } catch (error) {
    console.error('Fetch Websites Error:', error);
    return NextResponse.json({ error: 'Failed to fetch websites' }, { status: 500 });
  }
}

// POST /api/ads/websites - manually register or configure a domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const domain = normalizeDomain(body.domain);

    if (!domain) {
      return NextResponse.json({ error: 'Valid domain is required' }, { status: 400 });
    }

    const existing = await prisma.adWebsitePlacement.findFirst({
      where: { domain, adId: null }
    });

    if (!existing) {
      await prisma.adWebsitePlacement.create({
        data: {
          id: `site_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          domain,
          adId: null,
          enabled: body.enabled !== false,
        }
      });
    }

    return NextResponse.json({ success: true, domain });
  } catch (error) {
    console.error('Create Website Error:', error);
    return NextResponse.json({ error: 'Failed to add website' }, { status: 500 });
  }
}

// PUT /api/ads/websites - toggle global or per-ad status for a domain
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const domain = normalizeDomain(body.domain);
    const { adId, enabled } = body; // enabled: boolean

    if (!domain) {
      return NextResponse.json({ error: 'Valid domain is required' }, { status: 400 });
    }

    if (enabled === undefined) {
      return NextResponse.json({ error: 'Enabled status is required' }, { status: 400 });
    }

    if (!adId) {
      // Global domain toggle
      const existing = await prisma.adWebsitePlacement.findFirst({
        where: { domain, adId: null }
      });

      if (existing) {
        await prisma.adWebsitePlacement.update({
          where: { id: existing.id },
          data: { enabled: !!enabled }
        });
      } else {
        await prisma.adWebsitePlacement.create({
          data: {
            id: `site_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            domain,
            adId: null,
            enabled: !!enabled,
          }
        });
      }

      return NextResponse.json({ success: true, domain, globalEnabled: !!enabled });
    } else {
      // Specific ad on this domain toggle
      const ad = await prisma.customAd.findUnique({ where: { id: adId } });
      if (!ad) {
        return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
      }

      // Update in AdWebsitePlacement
      const existing = await prisma.adWebsitePlacement.findFirst({
        where: { domain, adId }
      });

      if (existing) {
        await prisma.adWebsitePlacement.update({
          where: { id: existing.id },
          data: { enabled: !!enabled }
        });
      } else {
        await prisma.adWebsitePlacement.create({
          data: {
            id: `site_ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            domain,
            adId,
            enabled: !!enabled,
          }
        });
      }

      // Also sync into ad.disabledWebsites for quick indexing
      let disabledList: string[] = [];
      try {
        if (ad.disabledWebsites) {
          disabledList = JSON.parse(ad.disabledWebsites);
          if (!Array.isArray(disabledList)) disabledList = [];
        }
      } catch {
        disabledList = [];
      }

      if (!enabled) {
        // Add to disabled list if not present
        if (!disabledList.includes(domain)) {
          disabledList.push(domain);
        }
      } else {
        // Remove from disabled list
        disabledList = disabledList.filter(d => normalizeDomain(d) !== domain);
      }

      await prisma.customAd.update({
        where: { id: adId },
        data: { disabledWebsites: JSON.stringify(disabledList) }
      });

      return NextResponse.json({ success: true, domain, adId, enabled: !!enabled, disabledWebsites: disabledList });
    }
  } catch (error) {
    console.error('Update Website Status Error:', error);
    return NextResponse.json({ error: 'Failed to update website status' }, { status: 500 });
  }
}

// DELETE /api/ads/websites - remove a domain and its rules
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = normalizeDomain(searchParams.get('domain') || '');

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    await prisma.adWebsitePlacement.deleteMany({
      where: { domain }
    });

    // Also remove from all ads disabledWebsites
    const ads = await prisma.customAd.findMany({
      where: { disabledWebsites: { contains: domain } }
    });

    for (const ad of ads) {
      try {
        let list: string[] = JSON.parse(ad.disabledWebsites || '[]');
        if (Array.isArray(list)) {
          list = list.filter(d => normalizeDomain(d) !== domain);
          await prisma.customAd.update({
            where: { id: ad.id },
            data: { disabledWebsites: JSON.stringify(list) }
          });
        }
      } catch {
        // Ignore JSON error
      }
    }

    return NextResponse.json({ success: true, domain });
  } catch (error) {
    console.error('Delete Website Error:', error);
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
}
