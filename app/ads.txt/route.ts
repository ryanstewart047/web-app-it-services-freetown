import { NextResponse } from 'next/server';

export async function GET() {
  // Google AdSense ads.txt
  // Only DIRECT is needed for a site owner's own AdSense publisher account.
  // A RESELLER line is only needed if you sell inventory through a third-party SSP.
  const adsTxt = `google.com, pub-9989697800650646, DIRECT, f08c47fec0942fa0`;

  return new NextResponse(adsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
