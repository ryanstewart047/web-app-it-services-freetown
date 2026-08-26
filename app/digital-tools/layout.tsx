import type { Metadata } from 'next';
import { BRAND_SITE_URL } from '@/lib/brand';

const DIGITAL_TOOLS_OG_IMAGE = `${BRAND_SITE_URL}/digital-tools-preview.jpg`;

export const metadata: Metadata = {
  title: 'FLORSS — For Love Once Reveal Surprise Studio & Free Digital Tools Suite | BridgeTech',
  description:
    'For Love Once Reveal Surprise Studio (FLORSS): Create viral celebration reveals, interactive unlock questionnaires, stadium crowd cheers & official printable certificates with recipient photo for birthdays, graduations, anniversaries, and VIP milestones. Free browser tools by BridgeTech IT Services.',
  keywords: [
    'FLORSS',
    'For Love Once Reveal Surprise Studio',
    'surprise reveal generator',
    'viral celebration link',
    'birthday surprise reveal online',
    'graduation award certificate maker',
    'anniversary surprise reveal quiz',
    'staff appreciation certificate with photo',
    'interactive celebration link with applause',
    'digital gift Sierra Leone Freetown',
    'printable certificate of recognition',
    'MP4 to MP3 converter online',
    'free audio converter 320kbps',
    'DOCX to PDF converter free',
    'Word to PDF high quality',
    'online image format converter',
    'WebP to PNG converter',
    'AI image forensic detector',
    'EXIF metadata viewer online',
    'QR code generator free download',
    'BridgeTech digital tools'
  ],
  alternates: {
    canonical: `${BRAND_SITE_URL}/digital-tools`,
  },
  openGraph: {
    title: 'FLORSS — For Love Once Reveal Surprise Studio | Viral Celebration Engine',
    description:
      'Create personalized viral celebration reveals, interactive unlock questionnaires, 8s crowd applause & official luxury printable certificates for your loved ones & VIP honorees.',
    url: `${BRAND_SITE_URL}/digital-tools`,
    siteName: 'BridgeTech IT Services',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: DIGITAL_TOOLS_OG_IMAGE,
        width: 1280,
        height: 720,
        alt: 'FLORSS — For Love Once Reveal Surprise Studio & Digital Tools Suite by BridgeTech IT Services',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLORSS — For Love Once Reveal Surprise Studio | Viral Celebration Engine',
    description: 'Create unforgettable celebration reveals, unlock quizzes, 8-second stadium cheering & high-res certificates with photo for birthdays, milestones & staff honors!',
    images: [DIGITAL_TOOLS_OG_IMAGE],
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

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${BRAND_SITE_URL}/digital-tools#florss`,
      name: 'For Love Once Reveal Surprise Studio (FLORSS)',
      alternateName: 'FLORSS',
      url: `${BRAND_SITE_URL}/digital-tools`,
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'All (Web Browser, iOS, Android, macOS, Windows)',
      browserRequirements: 'Requires JavaScript. Works on Chrome, Safari, Firefox, Edge, Android, iOS.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Celebration Link Creator',
          price: '0.00',
          priceCurrency: 'SLE',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Single Official Printable Certificate',
          price: '25.00',
          priceCurrency: 'SLE',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Monthly Pass (5 Downloads)',
          price: '150.00',
          priceCurrency: 'SLE',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Lifetime VIP Pass (Unlimited)',
          price: '500.00',
          priceCurrency: 'SLE',
          availability: 'https://schema.org/InStock',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.98',
        ratingCount: '894',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Instant viral celebration link generator with 8-second crowd applause audio',
        'Interactive unlock questionnaires and custom milestone trivia',
        'High-resolution gold-framed printable certificates with recipient photo',
        'One-click WhatsApp and social sharing with rich preview cards',
        'Mobile money payment gateway (Orange Money & AfriMoney)',
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
        'For Love Once Reveal Surprise Studio (FLORSS)',
        'MP4 to MP3 High-Bitrate Audio Extractor (320kbps, 192kbps, 128kbps)',
        'DOCX, Markdown and Text to PDF Document Converter',
        'Image Format Converter (WebP, PNG, JPEG, AVIF, BMP, GIF)',
        'AI Forensic & Deep EXIF Metadata Inspector with Error Level Analysis',
        'Custom Vector QR Code Generator with PNG and SVG Export',
        'Cryptographically Secure Password & Hash Generator'
      ],
      creator: {
        '@type': 'Organization',
        name: 'BridgeTech IT Services',
        url: BRAND_SITE_URL,
        logo: `${BRAND_SITE_URL}/assets/logo.svg`,
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
          name: 'FLORSS & Digital Tools Hub',
          item: `${BRAND_SITE_URL}/digital-tools`,
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Create a Viral Celebration Reveal with FLORSS (For Love Once Reveal Surprise Studio)',
      description: 'Step-by-step guide to generating a personalized surprise reveal with interactive unlock questions, custom photo, crowd cheer audio, and printable certificate.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Pick Occasion Template',
          text: 'Select from Staff Recognition, Milestone Birthday, Graduation Honor, Love & Anniversary, or Custom VIP templates.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Enter Celebrant Details & Photo',
          text: 'Type the recipient full name, recognition title or achievement, personal message, and upload their photo for luxury gold framing.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Add Interactive Unlock Questions (Optional)',
          text: 'Enable 1 to 3 fun multiple-choice trivia questions that the celebrant must answer to unlock the surprise.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Publish & Share Instantly on WhatsApp',
          text: 'Generate your instant celebration link and share it directly on WhatsApp, TikTok, Instagram or Facebook with live audio and certificate preview.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is FLORSS (For Love Once Reveal Surprise Studio)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'FLORSS (For Love Once Reveal Surprise Studio) is a viral celebration platform created by BridgeTech IT Services. It allows anyone to create personalized recognition reveals, interactive unlock questionnaires, stadium cheering celebrations, and official printable certificates with recipient photos for birthdays, graduations, anniversaries, and corporate awards.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I unlock and download the high-resolution printable certificate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Once the reveal link is generated, users can preview the sample certificate. To unlock the full-resolution, watermark-free printable certificate (PNG/PDF), submit payment (Le 25 one-time, Le 150 monthly, or Le 500 lifetime) via Orange Money or AfriMoney. Upon 1-click admin approval, the official download unlocks and is delivered automatically via email and WhatsApp.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use FLORSS on mobile phones and share via WhatsApp?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! FLORSS is 100% mobile-optimized. You can design, publish, and share reveals directly through WhatsApp, Facebook, TikTok, Instagram stories, and Telegram in seconds.',
          },
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
