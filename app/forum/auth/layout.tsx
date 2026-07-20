import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join the Technicians Forum | IT Services Freetown',
  description: 'Create your account and join Sierra Leone\'s exclusive IT professionals community. Collaborate, Troubleshoot, and Connect with tech experts.',
  openGraph: {
    title: 'Join the Technicians Forum | IT Services Freetown',
    description: 'Create your account and join Sierra Leone\'s exclusive IT professionals community.',
    url: 'https://www.itservicesfreetown.com/forum/auth/register',
    siteName: 'IT Services Freetown',
    images: [
      {
        url: 'https://www.itservicesfreetown.com/forum/auth/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Join the Technicians Forum | IT Services Freetown',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the Technicians Forum | IT Services Freetown',
    description: 'Create your account and join Sierra Leone\'s exclusive IT professionals community.',
    images: ['https://www.itservicesfreetown.com/forum/auth/opengraph-image'],
  },
};

export default function ForumAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
