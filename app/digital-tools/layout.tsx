import type { Metadata } from 'next';
import { BRAND_SITE_URL } from '@/lib/brand';

const DIGITAL_TOOLS_OG_IMAGE = `${BRAND_SITE_URL}/digital-tools-preview.jpg`;

export const metadata: Metadata = {
  title: 'Free Online Digital Tools & Products Suite | 3D Card Studio, Converters & Surprise Studio | BridgeTec',
  description:
    'BridgeTec Digital Tools & Products: Design 300 DPI executive business cards & staff ID badges, create viral celebration reveals with crowd cheer audio & printable certificates, convert video to MP3, Word to PDF, remove image backgrounds, and inspect deepfake forensics. 100% free, browser-based, zero signup.',
  keywords: [
    'BridgeTec digital products',
    'free digital tools suite',
    'business card maker 300 dpi',
    'id card generator online',
    'staff id badge maker',
    'printable business cards A4',
    'vcard qr code generator',
    'BridgeTec Surprise Studio',
    'surprise studio',
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
    'remove image background online',
    'EXIF metadata viewer online',
    'QR code generator free download',
    'BridgeTech digital tools',
    'Sierra Leone online tools'
  ],
  alternates: {
    canonical: `${BRAND_SITE_URL}/digital-tools`,
  },
  openGraph: {
    title: 'Free Online Digital Tools & Products Suite | BridgeTec',
    description:
      'Design 300 DPI executive business cards, create viral celebration reveals with crowd cheering & printable certificates, convert MP4 to 320kbps MP3, Word to PDF, and remove backgrounds with AI.',
    url: `${BRAND_SITE_URL}/digital-tools`,
    siteName: 'BridgeTech IT Services',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: DIGITAL_TOOLS_OG_IMAGE,
        width: 1280,
        height: 720,
        alt: 'BridgeTec Digital Tools & Products Suite - Business Cards, Surprise Studio & Media Converters',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Digital Tools & Products Suite | BridgeTec',
    description: 'Design 300 DPI executive business cards, create viral celebration reveals, convert video to MP3, Word to PDF, and inspect deepfake forensics online for free!',
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
      '@id': `${BRAND_SITE_URL}/digital-tools#bridgetec-surprise-studio`,
      name: 'BridgeTec Surprise Studio',
      alternateName: 'Surprise Studio',
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
        'High-resolution gold-framed printable certificates with recipient photo and dynamic presenter branding',
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
        'BridgeTec 3D Business & ID Card Studio (300 DPI Print-Ready PDF & vCard QR)',
        'BridgeTec Surprise Studio (Celebration Reveals & Printable Certificates)',
        'AI Image Background Eraser with Transparent PNG Export',
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
      '@type': 'WebApplication',
      '@id': `${BRAND_SITE_URL}/digital-tools/card-studio#app`,
      name: 'BridgeTec 3D Business & ID Card Studio',
      alternateName: '300 DPI Executive Card Studio',
      url: `${BRAND_SITE_URL}/digital-tools/card-studio`,
      applicationCategory: 'DesignApplication',
      operatingSystem: 'All (Web Browser, Windows, macOS, iOS, Android)',
      browserRequirements: 'Requires JavaScript and HTML5 Canvas. Works on Chrome, Safari, Firefox, Edge.',
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
        '300 DPI High-Resolution Universal Standard Print Output',
        'Executive Business Cards & Staff ID Badges',
        'Live Interactive 3D Card Flip & Tilt Simulation',
        'Guilloche Security Wave Ribbon Patterns with Opacity & Depth Controls',
        'Dynamic vCard Contact Scannable QR Code Integration',
        'Print-Ready 8-Card A4 Duplex Layout with Professional Cutting Guides',
        'Single Card PNG & Ultra High-Res Vector-Quality PDF Download'
      ],
      creator: {
        '@type': 'Organization',
        name: 'BridgeTech IT Services',
        url: BRAND_SITE_URL,
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
          name: 'BridgeTec Digital Tools & Products Suite',
          item: `${BRAND_SITE_URL}/digital-tools`,
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Create a Viral Celebration Reveal with BridgeTec Surprise Studio',
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
          text: 'Type the recipient full name, recognition title or achievement, presenter name, personal message, and upload their photo for luxury gold framing.',
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
          name: 'What is BridgeTec Surprise Studio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'BridgeTec Surprise Studio is a viral celebration platform created by BridgeTech IT Services. It allows anyone to create personalized recognition reveals, dynamic presenter branding, interactive unlock questionnaires, stadium cheering celebrations, and official printable certificates with recipient photos for birthdays, graduations, anniversaries, and corporate awards.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I design and print 300 DPI business cards and ID badges?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! BridgeTec 3D Card Studio allows you to design executive business cards, staff ID badges, and VIP passes at universal 300 DPI resolution (ISO CR80 standard). You can embed scannable vCard QR codes, customize security Guilloche patterns, and export print-ready A4 duplex PDFs with cutting guides for card printing machines or local print shops.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are these digital tools free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! The majority of tools in the BridgeTec Digital Suite—including Video to MP3 conversion, Document to PDF, AI Background Removal, Image Formats, QR Codes, and Card Studio basic export—are 100% free and run directly in your browser with private client-side processing.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I unlock and download the high-resolution printable certificate in Surprise Studio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Once the reveal link is generated, users can preview the sample certificate. To unlock the full-resolution, watermark-free printable certificate (PNG/PDF), submit payment (Le 25 one-time, Le 150 monthly, or Le 500 lifetime) via Orange Money or AfriMoney. Upon 1-click admin approval, the official download unlocks and is delivered automatically via email and WhatsApp.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use BridgeTec digital tools on mobile phones and share via WhatsApp?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All BridgeTec digital tools and products are fully responsive and mobile-optimized. You can convert files, design cards, and publish celebration links directly from your Android phone, iPhone, tablet, or desktop.',
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
