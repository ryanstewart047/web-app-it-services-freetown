import { NextRequest, NextResponse } from 'next/server';

type CachedPlace = {
  expiresAt: number;
  payload: ReverseGeocodePayload;
};

type ReverseGeocodePayload = {
  displayName: string;
  city?: string;
  state?: string;
  county?: string;
  suburb?: string;
  road?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  source: string;
  attribution: string;
};

type NominatimResponse = {
  display_name?: string;
  error?: string;
  address?: Record<string, string | undefined>;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const REQUEST_SPACING_MS = 1100;
const cache = new Map<string, CachedPlace>();
let lastNominatimRequestAt = 0;
let nominatimQueue: Promise<void> = Promise.resolve();

export const dynamic = 'force-dynamic';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withNominatimRateLimit<T>(task: () => Promise<T>): Promise<T> {
  const previous = nominatimQueue;
  let releaseQueue!: () => void;
  nominatimQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previous;

  try {
    const elapsed = Date.now() - lastNominatimRequestAt;
    if (elapsed < REQUEST_SPACING_MS) {
      await sleep(REQUEST_SPACING_MS - elapsed);
    }
    lastNominatimRequestAt = Date.now();
    return await task();
  } finally {
    releaseQueue();
  }
}

function normalizeCoordinate(value: string | null, min: number, max: number) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function pickCity(address: Record<string, string | undefined>) {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.hamlet ||
    address.locality ||
    address.county
  );
}

function normalizePayload(data: NominatimResponse): ReverseGeocodePayload {
  const address = data.address || {};

  return {
    displayName: data.display_name || 'Location found from embedded GPS coordinates',
    city: pickCity(address),
    state: address.state || address.region,
    county: address.county,
    suburb: address.suburb || address.neighbourhood || address.quarter,
    road: address.road || address.pedestrian || address.footway,
    postcode: address.postcode,
    country: address.country,
    countryCode: address.country_code?.toUpperCase(),
    source: 'OpenStreetMap Nominatim',
    attribution: 'Place names © OpenStreetMap contributors',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = normalizeCoordinate(searchParams.get('lat'), -90, 90);
  const lon = normalizeCoordinate(searchParams.get('lon'), -180, 180);

  if (lat === null || lon === null) {
    return NextResponse.json({ error: 'Valid lat and lon query parameters are required.' }, { status: 400 });
  }

  const cacheKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload);
  }

  try {
    const payload = await withNominatimRateLimit(async () => {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lon));
      url.searchParams.set('zoom', '18');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('accept-language', 'en');

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Referer: 'https://itservicesfreetown.com/digital-tools',
          'User-Agent': 'BridgeTechITServices/1.0 (support@itservicesfreetown.com)',
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed with status ${response.status}.`);
      }

      const data = (await response.json()) as NominatimResponse;
      if (data.error) throw new Error(data.error);
      return normalizePayload(data);
    });

    cache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json(
      { error: error.message || 'Could not resolve city/country for these GPS coordinates.' },
      { status: 502 }
    );
  }
}
