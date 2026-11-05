import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Contact | IT Services Freetown',
  description: 'Direct email contact for IT Services Freetown.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmailProtectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
