import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getShortUrlRecord, type ShortUrlMetadata } from '@/lib/short-url-storage';

interface Props {
  params: { code: string };
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getBaseUrl() {
  const requestHeaders = headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');

  if (host) {
    const protocol =
      requestHeaders.get('x-forwarded-proto') ||
      (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
    return `${protocol}://${host}`.replace(/\/$/, '');
  }

  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.itservicesfreetown.com'
  ).replace(/\/$/, '');
}

function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function formatPrice(price?: string) {
  const value = price?.trim();
  if (!value) return '';
  return /^(le|sll|usd|\$|gbp)/i.test(value) ? value : `Le ${value}`;
}

function normalizeExternalImage(image: string) {
  if (image.includes('github.com') && image.includes('/blob/')) {
    return image
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/')
      .replace(/[?&]raw=true/, '');
  }

  return image;
}

function getPreviewImageUrl(baseUrl: string, code: string, image?: string) {
  const fallback = `${baseUrl}/assets/images/slide01.jpg`;
  const value = image?.trim();

  if (!value) return fallback;
  if (value.startsWith('data:')) {
    return `${baseUrl}/api/social-share-image?code=${encodeURIComponent(code)}`;
  }
  if (value.startsWith('/')) return `${baseUrl}${value}`;
  if (/^https?:\/\//i.test(value)) return normalizeExternalImage(value);

  return fallback;
}

function getSocialDescription(metadata?: ShortUrlMetadata) {
  const description =
    metadata?.description?.trim() ||
    'Available from BridgeTech IT Services in Freetown, Sierra Leone.';
  const price = formatPrice(metadata?.price);

  return price ? `${description} Price: ${price}` : description;
}

function getOgImageUrl(baseUrl: string, code: string, metadata?: ShortUrlMetadata) {
  const ogUrl = new URL('/api/og-custom', baseUrl);
  const imageUrl = getPreviewImageUrl(baseUrl, code, metadata?.image);

  // Platforms receive a clean product photograph. The title and description
  // are supplied by standard Open Graph fields immediately below it.
  ogUrl.searchParams.set('layout', 'photo-only');
  ogUrl.searchParams.set('title', metadata?.title?.trim() || 'BridgeTech IT Services');
  ogUrl.searchParams.set('image', imageUrl);
  ogUrl.searchParams.set('fit', metadata?.fit || 'contain');
  ogUrl.searchParams.set('scale', String(metadata?.scale || 100));
  ogUrl.searchParams.set('positionX', String(metadata?.positionX ?? 50));
  ogUrl.searchParams.set('positionY', String(metadata?.positionY ?? 50));

  return ogUrl.toString();
}

function getImageStyle(metadata?: ShortUrlMetadata): CSSProperties {
  const scale = Math.min(180, Math.max(55, Number(metadata?.scale) || 100));
  const positionX = Math.min(100, Math.max(0, Number(metadata?.positionX) || 50));
  const positionY = Math.min(100, Math.max(0, Number(metadata?.positionY) || 50));

  return {
    objectFit: metadata?.fit === 'cover' ? 'cover' : 'contain',
    objectPosition: `${positionX}% ${positionY}%`,
    transform: `scale(${scale / 100})`,
    transformOrigin: `${positionX}% ${positionY}%`,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const shortUrl = `${baseUrl}/s/${params.code}`;
  const record = await getShortUrlRecord(params.code);
  const metadata = record?.metadata;
  const title = metadata?.title?.trim() || 'BridgeTech IT Services';
  const description = getSocialDescription(metadata);
  const ogImageUrl = getOgImageUrl(baseUrl, params.code, metadata);

  return {
    title,
    description,
    alternates: { canonical: shortUrl },
    openGraph: {
      title,
      description,
      url: shortUrl,
      siteName: 'BridgeTech IT Services',
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

export default async function ShortUrlPreview({ params }: Props) {
  const record = await getShortUrlRecord(params.code);

  if (!record) redirect('/marketplace');

  const baseUrl = getBaseUrl();
  const metadata = record.metadata;
  const safeOriginalUrl = isValidRedirectUrl(record.url) ? record.url : '/marketplace';

  if (!metadata) redirect(safeOriginalUrl);

  const title = metadata.title?.trim() || 'BridgeTech IT Services';
  const description =
    metadata.description?.trim() ||
    'Available from BridgeTech IT Services in Freetown, Sierra Leone.';
  const price = formatPrice(metadata.price);
  const imageUrl = getPreviewImageUrl(baseUrl, params.code, metadata.image);
  const structuredPrice = price.replace(/[^\d.]/g, '');
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image: imageUrl,
    brand: { '@type': 'Brand', name: 'BridgeTech IT Services' },
    offers: {
      '@type': 'Offer',
      url: safeOriginalUrl,
      priceCurrency: 'SLL',
      ...(structuredPrice ? { price: structuredPrice } : {}),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <article className="mx-auto max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-slate-200">
        <div className="aspect-[1200/630] overflow-hidden bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title} className="h-full w-full" style={getImageStyle(metadata)} />
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">BridgeTech IT Services</p>
          <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
          {price ? <p className="text-2xl font-black text-red-600 sm:text-3xl">{price}</p> : null}
          <a
            href={safeOriginalUrl}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            View product
          </a>
        </div>
      </article>
    </main>
  );
}
