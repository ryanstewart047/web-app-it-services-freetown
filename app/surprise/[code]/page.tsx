import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import SurpriseRevealExperience from './SurpriseRevealExperience';
import { getSurpriseReveal } from '@/lib/surprise-reveal-storage';

interface SurpriseRevealPageProps {
  params: { code: string };
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getBaseUrl() {
  const requestHeaders = headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  if (host) {
    const protocol = requestHeaders.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    return `${protocol}://${host}`.replace(/\/$/, '');
  }

  return (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.itservicesfreetown.com').replace(/\/$/, '');
}

function getOgImageUrl(baseUrl: string, code: string) {
  const ogUrl = new URL('/api/surprise-reveal-image', baseUrl);
  ogUrl.searchParams.set('code', code);
  return ogUrl.toString();
}

export async function generateMetadata({ params }: SurpriseRevealPageProps): Promise<Metadata> {
  const reveal = await getSurpriseReveal(params.code);
  if (!reveal) return { title: 'FLORSS — Surprise Reveal' };

  const title = `🎉 Special Surprise for ${reveal.recipientName}! | FLORSS by BridgeTech`;
  const description = reveal.message || `${reveal.recipientName} is receiving special recognition: ${reveal.achievement}. Open to experience their celebration with audio & interactive reveal!`;
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/surprise/${reveal.code}`;
  const ogImageUrl = getOgImageUrl(baseUrl, reveal.code);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'For Love Once Reveal Surprise Studio (FLORSS) · BridgeTech',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${reveal.recipientName} - ${reveal.achievement} - FLORSS Celebration`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@BridgeTechSL',
    },
    robots: { index: true, follow: true },
  };
}

export default async function SurpriseRevealPage({ params }: SurpriseRevealPageProps) {
  const reveal = await getSurpriseReveal(params.code);
  if (!reveal) notFound();

  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}/surprise/${reveal.code}`;
  const ogImageUrl = getOgImageUrl(baseUrl, reveal.code);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `Recognition for ${reveal.recipientName} - ${reveal.achievement}`,
    headline: `Celebration and Award for ${reveal.recipientName}`,
    description: reveal.message || `Special recognition for ${reveal.achievement}`,
    image: ogImageUrl,
    author: {
      '@type': 'Organization',
      name: 'For Love Once Reveal Surprise Studio (FLORSS)',
      url: `${baseUrl}/digital-tools`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BridgeTech IT Services',
      url: baseUrl,
    },
    url: shareUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SurpriseRevealExperience {...reveal} shareUrl={shareUrl} />
    </>
  );
}
