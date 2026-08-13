import type { Metadata } from 'next';
import { BRAND_SITE_URL } from '@/lib/brand';

const DIGITAL_TOOLS_OG_IMAGE = `${BRAND_SITE_URL}/assets/social-media/banners/Facebook-Cover-1640x924.png`;

export const metadata: Metadata = {
  title: 'Digital Products & Tools Hub | BridgeTech IT Services',
  description:
    'Free digital tools from BridgeTech IT Services: MP4 to MP3, DOCX to PDF, WebM to PNG/JPEG frame export, image converter, QR generator, password generator, music previews, and text utilities.',
  keywords: [
    'MP4 to MP3 converter',
    'DOCX to PDF converter',
    'Word to PDF',
    'WebM to PNG',
    'WebM to JPEG',
    'image converter',
    'QR code generator',
    'BridgeTech digital tools',
    'Freetown digital products',
  ],
  alternates: {
    canonical: `${BRAND_SITE_URL}/digital-tools`,
  },
  openGraph: {
    title: 'Digital Products & Tools Hub | BridgeTech IT Services',
    description:
      'Convert audio, export video frames, generate PDFs, resize images, create QR codes, and run everyday digital utilities from one production-ready hub.',
    url: `${BRAND_SITE_URL}/digital-tools`,
    siteName: 'BridgeTech IT Services',
    type: 'website',
    images: [
      {
        url: DIGITAL_TOOLS_OG_IMAGE,
        width: 1640,
        height: 924,
        alt: 'BridgeTech IT Services Digital Products and Tools Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Products & Tools Hub | BridgeTech IT Services',
    description: 'Free browser tools for file conversion, previews, QR codes, passwords, images, documents, and media.',
    images: [DIGITAL_TOOLS_OG_IMAGE],
  },
};

export default function DigitalToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
