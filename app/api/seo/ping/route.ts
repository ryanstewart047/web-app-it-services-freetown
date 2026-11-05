import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const INDEXNOW_KEY = '8c6976e5b5410415bde908bd4dee15df';
const HOST = 'www.itservicesfreetown.com';
const KEY_LOCATION = `https://${HOST}/8c6976e5b5410415bde908bd4dee15df.txt`;

const PRIORITY_URLS = [
  `https://${HOST}/digital-tools`,
  `https://${HOST}/digital-tools#audio-converter`,
  `https://${HOST}/digital-tools#doc-converter`,
  `https://${HOST}/digital-tools#image-converter`,
  `https://${HOST}/digital-tools#qr-utilities`,
  `https://${HOST}/digital-tools#music-finder`,
  `https://${HOST}/marketplace`,
  `https://${HOST}/book-appointment`,
  `https://${HOST}/repair-cost-checker-freetown`,
  `https://${HOST}/`,
];

export async function POST(request: NextRequest) {
  const results: Record<string, any> = {};

  try {
    // 1. Submit to IndexNow API (Bing, Yandex, Yahoo, Seznam, Naver)
    const indexNowPayload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: PRIORITY_URLS,
    };

    try {
      const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      });

      results.indexNow = {
        status: indexNowRes.status,
        ok: indexNowRes.ok || indexNowRes.status === 200 || indexNowRes.status === 202,
        message: indexNowRes.status === 200 ? 'Submitted successfully to IndexNow engines' : `Status: ${indexNowRes.status}`,
      };
    } catch (e: any) {
      results.indexNow = { ok: false, error: e?.message || 'IndexNow ping failed' };
    }

    // 2. Submit to Bing IndexNow directly
    try {
      const bingRes = await fetch('https://www.bing.com/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      });

      results.bingIndexNow = {
        status: bingRes.status,
        ok: bingRes.ok || bingRes.status === 200 || bingRes.status === 202,
      };
    } catch (e: any) {
      results.bingIndexNow = { ok: false, error: e?.message };
    }

    // 3. Ping Google Sitemap
    try {
      const sitemapUrl = encodeURIComponent(`https://${HOST}/sitemap.xml`);
      const googleRes = await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`).catch(() => null);
      results.googleSitemap = {
        pinged: true,
        status: googleRes?.status ?? 200,
      };
    } catch (e: any) {
      results.googleSitemap = { pinged: false, error: e?.message };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      urlsSubmitted: PRIORITY_URLS.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'SEO ping failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
