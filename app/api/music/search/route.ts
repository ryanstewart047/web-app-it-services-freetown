import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 }, { status: 200 });
    }

    const cleanQuery = query.trim();

    // 1. Fetch Full-Length Tracks from Jamendo Music API (Client ID: 56d30ee7)
    // Jamendo provides 100% full-length 3-5 minute tracks with direct audio & download URLs
    const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=56d30ee7&format=json&limit=${limit}&namesearch=${encodeURIComponent(
      cleanQuery
    )}&include=musicinfo`;

    // 2. Fetch iTunes tracks as fallback/supplement
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      cleanQuery
    )}&media=music&entity=song&limit=${limit}`;

    const [jamendoRes, itunesRes] = await Promise.allSettled([
      fetch(jamendoUrl, { headers: { 'User-Agent': 'BridgeTech-DigitalTools/1.0' }, next: { revalidate: 300 } }),
      fetch(itunesUrl, { headers: { 'User-Agent': 'BridgeTech-DigitalTools/1.0' }, next: { revalidate: 300 } }),
    ]);

    const results: any[] = [];
    const seenIds = new Set<string>();

    // Process Jamendo Full-Length Tracks first
    if (jamendoRes.status === 'fulfilled' && jamendoRes.value.ok) {
      try {
        const jamendoData = await jamendoRes.value.json();
        if (jamendoData.results && Array.isArray(jamendoData.results)) {
          jamendoData.results.forEach((item: any) => {
            const trackId = `jamendo_${item.id}`;
            if (!seenIds.has(trackId) && (item.audio || item.audiodownload)) {
              seenIds.add(trackId);
              const durationSec = item.duration || 0;
              results.push({
                id: trackId,
                title: item.name || 'Untitled Song',
                artist: item.artist_name || 'Unknown Artist',
                album: item.album_name || 'Single',
                genre: item.musicinfo?.tags?.genres?.[0] || 'Music',
                releaseYear: item.releasedate ? new Date(item.releasedate).getFullYear() : undefined,
                durationMs: durationSec * 1000,
                durationFormatted: formatSeconds(durationSec),
                previewUrl: item.audio || item.audiodownload,
                downloadUrl: item.audiodownload || item.audio,
                artworkUrlSmall: item.album_image || item.image || '',
                artworkUrlHD: item.album_image || item.image || '',
                isFullTrack: true,
                source: 'Jamendo Music (Full Track)',
                isExplicit: false,
              });
            }
          });
        }
      } catch (e) {
        console.error('Error parsing Jamendo response:', e);
      }
    }

    // Process iTunes search results
    if (itunesRes.status === 'fulfilled' && itunesRes.value.ok) {
      try {
        const itunesData = await itunesRes.value.json();
        if (itunesData.results && Array.isArray(itunesData.results)) {
          itunesData.results.forEach((item: any) => {
            const trackId = `itunes_${item.trackId || item.collectionId}`;
            if (!seenIds.has(trackId) && item.previewUrl) {
              seenIds.add(trackId);
              const ms = item.trackTimeMillis || 0;
              results.push({
                id: trackId,
                title: item.trackName || item.collectionName || 'Untitled Song',
                artist: item.artistName || 'Unknown Artist',
                album: item.collectionName || 'Single / Unknown Album',
                genre: item.primaryGenreName || 'Music',
                releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined,
                durationMs: ms,
                durationFormatted: formatMs(ms),
                previewUrl: item.previewUrl,
                downloadUrl: item.previewUrl,
                artworkUrlSmall: item.artworkUrl60 || item.artworkUrl100 || '',
                artworkUrlHD: item.artworkUrl100
                  ? item.artworkUrl100.replace('100x100bb', '1000x1000bb')
                  : item.artworkUrl60 || '',
                isFullTrack: false,
                source: 'iTunes Music',
                isExplicit: item.trackExplicitness === 'explicit',
              });
            }
          });
        }
      } catch (e) {
        console.error('Error parsing iTunes response:', e);
      }
    }

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      total: results.length,
      results,
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

function formatMs(ms: number): string {
  if (!ms) return '0:00';
  return formatSeconds(ms / 1000);
}
