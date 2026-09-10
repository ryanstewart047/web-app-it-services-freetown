import type { Metadata } from 'next';
import { BRAND_SITE_URL } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Image Forensics Pro & AI Deepfake Inspector | Chrome Extension & Web Suite | BridgeTech',
  description:
    'Professional digital image forensic inspection software: Error Level Analysis (ELA), AI deepfake diffusion pattern detection, EXIF camera tags, GPS geolocation maps, and official cryptographic SHA-256 PDF reports.',
  keywords: [
    'image forensics pro',
    'ai deepfake detector online',
    'error level analysis ela tool',
    'exif metadata inspector',
    'deepfake detector chrome extension',
    'image tampering detection',
    'gps photo location finder',
    'sha-256 forensic report pdf',
    'digital forensics software',
    'BridgeTech forensics pro'
  ],
  alternates: {
    canonical: `${BRAND_SITE_URL}/forensics-pro/pricing`,
  },
  openGraph: {
    title: 'Image Forensics Pro & Deepfake Inspector — BridgeTech',
    description:
      'Detect manipulated images and deepfakes with professional Error Level Analysis (ELA), EXIF camera metadata, GPS verification, and cryptographic PDF dossiers.',
    url: `${BRAND_SITE_URL}/forensics-pro/pricing`,
    siteName: 'BridgeTech IT Services',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${BRAND_SITE_URL}/digital-tools-preview.jpg`,
        width: 1280,
        height: 720,
        alt: 'BridgeTech Image Forensics Pro & Deepfake Inspector Software',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Forensics Pro & Deepfake Inspector — BridgeTech',
    description:
      'Professional digital forensic suite: Error Level Analysis, synthetic AI detection, EXIF data, and cryptographic PDF reports.',
    images: [`${BRAND_SITE_URL}/digital-tools-preview.jpg`],
    creator: '@BridgeTechSL',
    site: '@BridgeTechSL',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const forensicsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${BRAND_SITE_URL}/forensics-pro/pricing#software`,
      name: 'BridgeTech Image Forensics Pro & Deepfake Inspector',
      url: `${BRAND_SITE_URL}/forensics-pro/pricing`,
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Windows, macOS, Linux, Chrome OS (Web & Chrome Extension)',
      offers: [
        {
          '@type': 'Offer',
          name: 'Community Free',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Pro Monthly',
          price: '4.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Founder Lifetime',
          price: '39.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '156',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Multi-compression Error Level Analysis (ELA 70% - 98%)',
        'Deep AI and synthetic image signature detection (Midjourney, DALL-E, SD, Flux)',
        'Camera EXIF metadata extractor and sensor noise analysis',
        'GPS coordinates map linking and geotag verification',
        'Export cryptographic SHA-256 tamper-evident PDF dossiers'
      ],
      creator: {
        '@type': 'Organization',
        name: 'BridgeTech IT Services',
        url: BRAND_SITE_URL,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: BRAND_SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Image Forensics Pro',
          item: `${BRAND_SITE_URL}/forensics-pro/pricing`,
        },
      ],
    },
  ],
};

export default function ForensicsPricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(forensicsJsonLd) }}
      />
      {children}
    </>
  );
}
