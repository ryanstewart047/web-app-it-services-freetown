import { Metadata } from 'next';
import ForumLayoutClient from './ForumLayoutClient';

export const metadata: Metadata = {
  title: 'Technicians Forum | IT Services Freetown',
  description: 'Join the exclusive IT professionals community in Sierra Leone. Collaborate, Troubleshoot, and Connect with tech experts.',
  openGraph: {
    title: 'Technicians Forum | IT Services Freetown',
    description: 'Join the exclusive IT professionals community in Sierra Leone.',
    // By omitting static images, Next.js natively injects the generated opengraph-image.tsx route here automatically.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technicians Forum | IT Services Freetown',
    description: 'Join the exclusive IT professionals community in Sierra Leone.',
  }
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <ForumLayoutClient>{children}</ForumLayoutClient>;
}
