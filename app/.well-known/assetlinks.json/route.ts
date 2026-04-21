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
          "YOUR_SHA256_FINGERPRINT_GOES_HERE"
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
