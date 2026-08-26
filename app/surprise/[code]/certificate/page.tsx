import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSurpriseReveal } from '@/lib/surprise-reveal-storage';
import CertificateClient from './CertificateClient';

interface CertificatePageProps {
  params: { code: string };
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  return 'https://www.itservicesfreetown.com';
}

export async function generateMetadata({ params }: CertificatePageProps): Promise<Metadata> {
  const reveal = await getSurpriseReveal(params.code);
  if (!reveal) return { title: 'Certificate Not Found' };

  return {
    title: `Official Certificate: ${reveal.recipientName} | BridgeTech IT Services`,
    description: `Official Certificate of Recognition presented to ${reveal.recipientName} for ${reveal.achievement}.`,
    robots: { index: false, follow: false },
  };
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const reveal = await getSurpriseReveal(params.code);
  if (!reveal) notFound();

  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}/surprise/${reveal.code}`;
  const certificateUrl = `${baseUrl}/surprise/${reveal.code}/certificate`;

  return <CertificateClient reveal={reveal} shareUrl={shareUrl} certificateUrl={certificateUrl} />;
}
