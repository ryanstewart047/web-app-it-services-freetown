import { Metadata } from 'next';
import ForumLayoutClient from './ForumLayoutClient';
import {
  BRAND_APPLE_TOUCH_ICON_SRC,
  BRAND_FAVICON_ICO_SRC,
  BRAND_FAVICON_SVG_SRC,
} from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Technicians Forum | IT Services Freetown',
  description: 'Join the exclusive IT professionals community in Sierra Leone. Collaborate, Troubleshoot, and Connect with tech experts.',
  openGraph: {
    title: 'Technicians Forum | IT Services Freetown',
    description: 'Join the exclusive IT professionals community in Sierra Leone. Collaborate, Troubleshoot, and Connect with tech experts.',
    url: 'https://www.itservicesfreetown.com/forum',
    siteName: 'IT Services Freetown',
    images: [
      {
        url: 'https://www.itservicesfreetown.com/forum/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Technicians Forum | IT Services Freetown',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technicians Forum | IT Services Freetown',
    description: 'Join the exclusive IT professionals community in Sierra Leone.',
    images: ['https://www.itservicesfreetown.com/forum/opengraph-image'],
  },
  icons: {
    icon: [
      { url: BRAND_FAVICON_SVG_SRC, type: 'image/svg+xml' },
      { url: BRAND_FAVICON_ICO_SRC, type: 'image/x-icon' },
    ],
    apple: [
      { url: BRAND_APPLE_TOUCH_ICON_SRC }
    ],
  },
  alternates: {
    canonical: '/forum',
  },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <ForumLayoutClient>{children}</ForumLayoutClient>;
}
