import React from 'react';
import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import { BRAND_SITE_URL } from '@/lib/brand';

export const dynamic = 'force-dynamic';

const CardStudio = dynamicImport(
  () => import('@/components/digital-tools/CardStudio'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400">Loading 300 DPI Card Studio...</p>
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: {
    absolute: 'Free Business & ID Card Maker (300 DPI) | BridgeTech',
  },
  description:
    'Create print-ready 300 DPI business cards & staff ID badges with live 3D preview, scannable vCard QR codes, and duplex A4 PDF export. Free online card maker.',
  keywords: [
    'business card maker online',
    'free business card generator',
    'id card generator 300 dpi',
    'staff id badge maker',
    'print ready business cards',
    '300 dpi print studio',
    'vcard qr code generator',
    'executive business cards',
    'guilloche wave pattern generator',
    'cr80 standard card size',
    'printable a4 duplex cards',
    'freetown business printing',
    'sierra leone card printing',
    'BridgeTec digital tools',
    'BridgeTec card studio'
  ],
  alternates: {
    canonical: `${BRAND_SITE_URL}/digital-tools/card-studio`,
  },
  openGraph: {
    title: 'Free Business & ID Card Maker (300 DPI) | BridgeTech',
    description:
      'Create print-ready 300 DPI business cards & staff ID badges with live 3D preview, scannable vCard QR codes, and duplex A4 PDF export. Free online card maker.',
    url: `${BRAND_SITE_URL}/digital-tools/card-studio`,
    siteName: 'BridgeTech IT Services',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${BRAND_SITE_URL}/digital-tools-preview.jpg`,
        width: 1280,
        height: 720,
        alt: 'BridgeTec 3D Business & ID Card Studio - 300 DPI Print Ready Generator',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Business & ID Card Maker (300 DPI) | BridgeTech',
    description:
      'Create print-ready 300 DPI business cards & staff ID badges with live 3D preview, scannable vCard QR codes, and duplex A4 PDF export. Free online card maker.',
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

const cardStudioJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${BRAND_SITE_URL}/digital-tools/card-studio#software`,
      name: 'BridgeTec 3D Business & ID Card Studio',
      alternateName: '300 DPI Print Card Studio',
      url: `${BRAND_SITE_URL}/digital-tools/card-studio`,
      applicationCategory: 'DesignApplication',
      operatingSystem: 'All (Web Browser, Chrome, Safari, Firefox, Edge, Windows, macOS, Android, iOS)',
      browserRequirements: 'Requires JavaScript and HTML5 Canvas.',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.95',
        ratingCount: '320',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Universal 300 DPI high-resolution print output (CR80 standard size)',
        'Live 3D card tilt & flip perspective preview',
        'Customizable Guilloche security wave patterns with opacity & depth controls',
        'Scannable vCard QR code generator for instant contact saving on smartphones',
        '8-Card A4 duplex layout with alignment marks & professional cutting guides',
        'Direct download in PNG and ultra high-definition print-ready PDF'
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
          name: 'Digital Tools Suite',
          item: `${BRAND_SITE_URL}/digital-tools`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: '3D Business & ID Card Studio',
          item: `${BRAND_SITE_URL}/digital-tools/card-studio`,
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Design and Print 300 DPI Executive Business Cards',
      description: 'Step-by-step guide to designing, customizing security patterns, embedding vCard QR codes, and downloading print-ready A4 PDFs.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Choose Card Preset & Orientation',
          text: 'Select from Executive Gold, Corporate Blue, Emerald Security, Midnight Black, or Velvet Rose themes in landscape or portrait layout.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Enter Company & Contact Details',
          text: 'Fill in your name, job title, company name, phone, email, website, and physical address. A scannable vCard QR code is automatically generated.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Customize Background & Guilloche Waves',
          text: 'Adjust pattern opacity, wave density, positioning, and upload your custom corporate logo for instant placement.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Download 300 DPI Print-Ready PDF',
          text: 'Export an 8-card duplex A4 PDF complete with cutting guides and alignment marks ready for card printing machines or print shops.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are the exported cards universal standard size and resolution?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All cards generated by BridgeTec Card Studio conform to the universal ISO/IEC 7810 ID-1 (CR80) standard (85.60mm × 53.98mm / 3.370" × 2.125") rendered at 300 DPI with industry-standard 3mm bleed margins. They are 100% print-ready for thermal card printers (Zebra, Evolis, Fargo) and commercial offset/digital print presses.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the vCard QR code work on smartphones?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When anyone points their iPhone or Android camera at the QR code printed on the card, a prompt appears allowing them to instantly save your full contact details (name, phone, email, address, website) directly to their address book without typing.',
          },
        },
        {
          '@type': 'Question',
          name: 'What paper stock is recommended for printing business cards?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For premium executive cards, we recommend 350gsm to 400gsm matte or silk cardstock. For staff ID badges, print onto 250gsm cardstock and insert into standard badge holders, or print directly onto PVC cards using a dye-sublimation card printer.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the BridgeTec 3D Card Studio free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Designing, live 3D previewing, vCard QR generation, and exporting high-resolution print-ready files is free. You can design unlimited cards directly in your browser without watermarks or forced subscriptions.',
          },
        },
      ],
    },
  ],
};

export default function CardStudioPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cardStudioJsonLd) }}
      />

      {/* Semantic SEO Header for Crawlers */}
      <header className="sr-only">
        <h1>Free 300 DPI Business &amp; Staff ID Card Generator</h1>
        <p>
          Design executive luxury business cards, company staff ID badges, and corporate event passes at 300 DPI resolution with scannable vCard QR codes, security Guilloche wave lines, and print-ready A4 duplex PDF export.
        </p>
      </header>

      <CardStudio />
    </div>
  );
}
