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

function getImageUrl(baseUrl: string, imageUrl: string) {
  if (imageUrl.startsWith('/')) return `${baseUrl}${imageUrl}`;
  return imageUrl;
}

export async function generateMetadata({ params }: SurpriseRevealPageProps): Promise<Metadata> {
  const reveal = await getSurpriseReveal(params.code);
  if (!reveal) return { title: 'Surprise Reveal' };

  const title = `Congratulations, ${reveal.recipientName}!`;
  const description = reveal.message || `${reveal.recipientName} is being celebrated for ${reveal.achievement}.`;
  const url = `${getBaseUrl()}/surprise/${reveal.code}`;
  const image = getImageUrl(getBaseUrl(), reveal.imageUrl);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', images: [{ url: image, alt: reveal.recipientName }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    robots: { index: false, follow: false },
  };
}

export default async function SurpriseRevealPage({ params }: SurpriseRevealPageProps) {
  const reveal = await getSurpriseReveal(params.code);
  if (!reveal) notFound();

  return <SurpriseRevealExperience {...reveal} />;
}
