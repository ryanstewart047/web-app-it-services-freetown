import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Madina Face 3 Community Bridge Project - Donation',
  description: 'Help us build a bridge that connects our Madina Face 3 community. Donate via Orange Money or Card Payment.',
  icons: {
    icon: '/bridge-logo.jpg',
    apple: '/bridge-logo.jpg',
  },
};

export default function MadinaFace3Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
