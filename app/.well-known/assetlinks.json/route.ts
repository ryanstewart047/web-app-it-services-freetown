import { NextResponse } from 'next/server';

export async function GET() {
  // Replace the sha256_cert_fingerprints with the exact fingerprint string provided by PWABuilder or your Google Play Console
  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.itservicesfreetown.app",
        sha256_cert_fingerprints: [
          "D6:93:5D:02:92:00:38:27:07:AD:01:BE:EF:C8:DB:AC:27:67:92:B6:18:F1:B0:0C:F6:4C:AA:8F:95:7C:11:6A"
        ]
      }
    }
  ];

  return NextResponse.json(assetLinks, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate'
    }
  });
}
