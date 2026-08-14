import type { Metadata } from 'next';
import { BRAND_SITE_URL } from '@/lib/brand';

const DIGITAL_TOOLS_OG_IMAGE = `${BRAND_SITE_URL}/assets/social-media/banners/Facebook-Cover-1640x924.png`;

export const metadata: Metadata = {
  title: 'Free Digital Tools & Converters Suite | MP4 to MP3, DOCX to PDF, Image & QR Hub - BridgeTech',
  description:
    'All-in-one free online digital products suite by BridgeTech IT Services: 320kbps MP4 to MP3 audio converter, DOCX to PDF creator, WebP/PNG/JPG image converter, AI forensic & EXIF metadata inspector, secure password & QR code generator. 100% private, browser-fast, no registration required.',
  keywords: [
    'MP4 to MP3 converter online',
    'free audio converter 320kbps',
    'DOCX to PDF converter free',
    'Word to PDF high quality',
    'online image format converter',
    'WebP to PNG converter',
    'PNG to JPEG converter',
    'AI image forensic detector',
    'EXIF metadata viewer online',
    'QR code generator free download',
    'strong password generator',
    'SHA256 hash calculator',
    'BridgeTech digital tools',
    'digital products Freetown Sierra Leone',
    'online media converter free'
  ],
  alternates: {
    canonical: `${BRAND_SITE_URL}/digital-tools`,
  },
  openGraph: {
    title: 'Free Digital Tools & Converters Suite | BridgeTech IT Services',
    description:
      'Fast, private, and free browser utilities: Convert MP4 to MP3, Word DOCX to PDF, batch convert WebP/PNG/JPG, inspect EXIF/AI metadata, and create custom QR codes with no file size limits.',
    url: `${BRAND_SITE_URL}/digital-tools`,
    siteName: 'BridgeTech IT Services',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: DIGITAL_TOOLS_OG_IMAGE,
        width: 1640,
        height: 924,
        alt: 'BridgeTech IT Services Digital Products and Online Tools Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Digital Tools Suite | Audio, Document, Image & QR Utilities',
    description: 'Convert MP4 to MP3, DOCX to PDF, batch convert images, generate QR codes & secure passwords in your browser for free.',
    images: [DIGITAL_TOOLS_OG_IMAGE],
    creator: '@BridgeTechSL',
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

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${BRAND_SITE_URL}/digital-tools#webapp`,
      name: 'BridgeTech Digital Tools & Converter Suite',
      url: `${BRAND_SITE_URL}/digital-tools`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All (Web Browser)',
      browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge, Android, iOS.',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '482',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'MP4 to MP3 High-Bitrate Audio Extractor (320kbps, 192kbps, 128kbps)',
        'DOCX, Markdown and Text to PDF Document Converter',
        'Image Format Converter (WebP, PNG, JPEG, AVIF, BMP, GIF)',
        'WebM Video Frame to PNG/JPEG Sequence Exporter',
        'AI Forensic & Deep EXIF Metadata Inspector with Error Level Analysis',
        'Custom Vector QR Code Generator with PNG and SVG Export',
        'Cryptographically Secure Password & Hash Generator (SHA-256, SHA-512, MD5)'
      ],
      creator: {
        '@type': 'Organization',
        name: 'BridgeTech IT Services',
        url: BRAND_SITE_URL,
        logo: `${BRAND_SITE_URL}/assets/logo.svg`,
        sameAs: [
          'https://www.facebook.com/itservicesfreetown',
          'https://www.instagram.com/itservicesfreetown',
          'https://www.linkedin.com/company/bridgetech-it-services'
        ]
      }
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
          name: 'Digital Products & Tools Hub',
          item: `${BRAND_SITE_URL}/digital-tools`,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I convert MP4 video to MP3 audio for free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Upload or drag and drop your MP4 or video file into the Audio Converter tab on BridgeTech Digital Tools, choose your desired audio bitrate (128k, 192k, or 320k studio quality), and click Convert. The MP3 is processed directly and available for instant download with zero compression loss.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can I convert Word DOCX documents to PDF online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open the Document Converter tab, select your Microsoft Word .docx or .txt document, customize header and page formatting if needed, and click Convert to PDF. Your formatted PDF document is compiled instantly.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is my data private when converting files on BridgeTech?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, 100%. File transformations, image conversions, EXIF analysis, and QR code creations run locally inside your browser sandbox. Your files and passwords are never permanently stored or shared with third parties.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the AI Forensic & Metadata Inspector detect edited images?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The inspector extracts full EXIF, IPTC, and XMP camera tags, calculates perceptual hashes, and runs Error Level Analysis (ELA) to highlight compression differences between original camera captures and digital manipulations or AI generators (Midjourney, DALL-E, Stable Diffusion).',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I generate customized QR codes for business links and Wi-Fi?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Enter any URL, contact card, Wi-Fi configuration, or text prompt in the QR Code Generator tool. Customize colors, error correction levels, and download the resulting QR code as a high-resolution PNG or vector SVG.',
          },
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert Video and Audio to High Quality MP3',
      description: 'Step-by-step guide to extracting high bitrate MP3 audio from video files using BridgeTech online tools.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload Your File',
          text: 'Select or drag your video (MP4, WebM, MOV, AVI) or audio file into the converter box.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Select Audio Quality',
          text: 'Choose your desired output bitrate from 128kbps, 192kbps, or 320kbps Studio Master quality.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download Converted MP3',
          text: 'Click Convert and instantly download your ready-to-play MP3 audio track.',
        },
      ],
    },
  ],
};

export default function DigitalToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      {children}
    </>
  );
}
