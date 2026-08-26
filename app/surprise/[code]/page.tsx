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
  if (!reveal) return { title: 'Surprise Reveal' };

  const title = `Congratulations, ${reveal.recipientName}!`;
  const description = reveal.message || `${reveal.recipientName} is being celebrated for ${reveal.achievement}.`;
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
      siteName: 'BridgeTech IT Services',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${reveal.recipientName} - ${reveal.achievement}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: { index: false, follow: false },
  };
}

export default async function SurpriseRevealPage({ params }: SurpriseRevealPageProps) {
  const reveal = await getSurpriseReveal(params.code);
  if (!reveal) notFound();

  return <SurpriseRevealExperience {...reveal} />;
}
