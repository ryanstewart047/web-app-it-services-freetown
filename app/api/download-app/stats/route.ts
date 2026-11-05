import { NextResponse } from 'next/server';

import {
  CURRENT_RELEASE_VERSION,
  DEVICE_DETECTOR_REPO_NAME,
  DEVICE_DETECTOR_REPO_OWNER,
  getTrackedDownloadAssets,
} from '@/lib/device-detector-release';

export const revalidate = 300;

interface GitHubReleaseAsset {
  name: string;
  download_count: number;
}

interface GitHubReleaseResponse {
  tag_name: string;
  published_at: string;
  assets: GitHubReleaseAsset[];
}

export async function GET() {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_RELEASE_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${DEVICE_DETECTOR_REPO_OWNER}/${DEVICE_DETECTOR_REPO_NAME}/releases/latest`,
      {
        headers,
        next: { revalidate },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch GitHub release stats' },
        { status: response.status }
      );
    }

    const release = (await response.json()) as GitHubReleaseResponse;
    const releaseAssets = new Map(release.assets.map((asset) => [asset.name, asset]));
    const trackedAssets = getTrackedDownloadAssets();

    const assetCounts = Object.fromEntries(
      trackedAssets.map((asset) => [asset.id, releaseAssets.get(asset.fileName)?.download_count ?? 0])
    );

    const totalDownloads = Object.values(assetCounts).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      assetCounts,
      totalDownloads,
      releaseTag: release.tag_name || `v${CURRENT_RELEASE_VERSION}`,
      publishedAt: release.published_at,
      source: 'github',
    });
  } catch (error) {
    console.error('Failed to load GitHub release download stats:', error);
    return NextResponse.json(
      { error: 'Failed to load download stats' },
      { status: 500 }
    );
  }
}
