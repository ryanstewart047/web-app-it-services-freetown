import { Metadata } from 'next';
import ForumLayoutClient from './ForumLayoutClient';

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
      { url: '/forum-favicon.svg', type: 'image/svg+xml' },
      { url: '/forum-favicon.ico', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/forum-favicon.svg' }
    ],
  },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <ForumLayoutClient>{children}</ForumLayoutClient>;
}
