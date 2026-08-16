import { NextRequest, NextResponse } from 'next/server';

const AUDIUS_NODES = [
  'https://discoveryprovider.audius.co',
  'https://audius-discovery-1.theblueprint.xyz',
  'https://discovery-us-01.audius.openplayer.org',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 }, { status: 200 });
    }

    const cleanQuery = query.trim();
    const results: any[] = [];
    const seenIds = new Set<string>();

    // 1. PRIMARY: Audius Decentralized Music Network (100% FULL-LENGTH MP3 Audio Streams)
    for (const node of AUDIUS_NODES) {
      try {
        const audiusUrl = `${node}/v1/tracks/search?app_name=BRIDGETECH&query=${encodeURIComponent(
          cleanQuery
        )}&limit=30`;
        const audiusRes = await fetch(audiusUrl, {
          headers: { 'User-Agent': 'BridgeTech-DigitalTools/2.0' },
          next: { revalidate: 300 },
        });

        if (audiusRes.ok) {
          const json = await audiusRes.json();
          const items = json?.data || [];
          if (Array.isArray(items) && items.length > 0) {
            items.forEach((item: any) => {
              const trackId = item.id || item.track_id;
              if (trackId && !seenIds.has(`audius_${trackId}`) && item.is_streamable !== false) {
                seenIds.add(`audius_${trackId}`);

                const durationSec = item.duration || 180;
                const artworkUrl =
                  item.artwork?.['1000x1000'] ||
                  item.artwork?.['480x480'] ||
                  item.artwork?.['150x150'] ||
                  item.user?.profile_picture?.['1000x1000'] ||
                  item.user?.profile_picture?.['480x480'] ||
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';

                const streamUrl = `${node}/v1/tracks/${trackId}/stream?app_name=BRIDGETECH`;

                results.push({
                  id: `audius_${trackId}`,
                  title: item.title || 'Untitled Song',
                  artist: item.user?.name || item.user?.handle || 'Unknown Artist',
                  album: item.genre ? `${item.genre} Beats` : 'Full Track Single',
                  genre: item.genre || 'Music',
                  releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
                  durationMs: durationSec * 1000,
                  durationFormatted: formatSeconds(durationSec),
                  previewUrl: streamUrl,
                  downloadUrl: streamUrl,
                  artworkUrlSmall: artworkUrl,
                  artworkUrlHD: artworkUrl,
                  isFullTrack: true,
                  source: 'Full Length MP3 Track',
                  isExplicit: false,
                });
              }
            });
            // If primary node returned results, break early
            if (results.length > 0) break;
          }
        }
      } catch (err) {
        console.warn(`Audius node ${node} error:`, err);
      }
    }

    // 2. SECONDARY: YouTube Scraper (For full music videos and multi-server downloads)
    const fetchYouTubeResults = async (searchKeyword: string) => {
      try {
        const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeyword)}`;
        const ytRes = await fetch(ytSearchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          next: { revalidate: 180 },
        });

        if (!ytRes.ok) return;
        const html = await ytRes.text();
        const match = html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/);

        if (match && match[1]) {
          const ytData = JSON.parse(match[1]);
          const sectionList =
            ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

          sectionList.forEach((section: any) => {
            const items = section?.itemSectionRenderer?.contents || [];
            items.forEach((item: any) => {
              const v = item.videoRenderer || item.compactVideoRenderer;
              if (v && v.videoId && !seenIds.has(`yt_${v.videoId}`)) {
                const videoId = v.videoId;
                seenIds.add(`yt_${videoId}`);

                const title = v.title?.runs?.[0]?.text || v.title?.simpleText || 'Untitled Song';
                const artist = v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || 'Unknown Artist';
                const durationFormatted = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text || '3:45';

                const parts = durationFormatted.split(':').map(Number);
                let durationMs = 180000;
                if (parts.length === 2) durationMs = (parts[0] * 60 + parts[1]) * 1000;
                if (parts.length === 3) durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;

                results.push({
                  id: `yt_${videoId}`,
                  youtubeId: videoId,
                  title: title.replace(/\[.*?\]|\(.*?\)/g, '').trim() || title,
                  artist: artist.replace(/ - Topic|VEVO/g, '').trim(),
                  album: 'YouTube Music',
                  genre: 'Music',
                  durationMs,
                  durationFormatted,
                  previewUrl: `https://www.youtube.com/watch?v=${videoId}`,
                  downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
                  artworkUrlSmall: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                  artworkUrlHD: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                  isFullTrack: true,
                  source: 'YouTube Music (Full Video & Audio)',
                  isExplicit: false,
                });
              }
            });
          });
        }
      } catch (e) {
        console.error('YouTube Search Error:', e);
      }
    };

    if (results.length < limit) {
      await fetchYouTubeResults(`${cleanQuery} music`);
    }

    // 3. TERTIARY: Apple/iTunes Search (High quality artwork and supplementary matches)
    if (results.length < limit) {
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
          cleanQuery
        )}&media=music&entity=song&limit=15`;
        const itunesRes = await fetch(itunesUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 300 },
        });

        if (itunesRes.ok) {
          const itunesData = await itunesRes.json();
          if (itunesData.results && Array.isArray(itunesData.results)) {
            itunesData.results.forEach((item: any) => {
              if (item.trackId && item.previewUrl && !seenIds.has(`itunes_${item.trackId}`)) {
                const trackId = `itunes_${item.trackId}`;
                seenIds.add(trackId);
                const durationMs = item.trackTimeMillis || 30000;
                const artwork = item.artworkUrl100
                  ? item.artworkUrl100.replace('100x100bb', '600x600bb')
                  : item.artworkUrl60 || '';

                results.push({
                  id: trackId,
                  title: item.trackName || 'Untitled Song',
                  artist: item.artistName || 'Unknown Artist',
                  album: item.collectionName || 'Single',
                  genre: item.primaryGenreName || 'Music',
                  releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined,
                  durationMs,
                  durationFormatted: formatSeconds(Math.floor(durationMs / 1000)),
                  previewUrl: item.previewUrl,
                  downloadUrl: item.previewUrl,
                  artworkUrlSmall: item.artworkUrl100 || artwork,
                  artworkUrlHD: artwork,
                  isFullTrack: false,
                  source: 'Music Audio Stream',
                  isExplicit: item.trackExplicitness === 'explicit',
                });
              }
            });
          }
        }
      } catch (e) {
        console.error('iTunes Search API Error:', e);
      }
    }

    const totalResults = results.length;
    const paginatedResults = results.slice(0, page * limit);

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      total: totalResults,
      page,
      hasMore: paginatedResults.length < totalResults,
      results: paginatedResults,
    });
  } catch (error: any) {
    console.error('Music Search Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search music' },
      { status: 500 }
    );
  }
}

function formatSeconds(totalSeconds: number): string {
  if (!totalSeconds) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
