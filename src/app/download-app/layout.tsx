import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Our App - IT Services Freetown',
  description: 'Download our device diagnostic and repair tracking app for Windows, macOS, and Linux. Get real-time diagnostics and professional support.',
  keywords: 'download app, device diagnostic, Windows, macOS, Linux, IT Services Freetown',
};

export default function DownloadAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
