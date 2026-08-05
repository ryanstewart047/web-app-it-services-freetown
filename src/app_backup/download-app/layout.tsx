import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Our App - BridgeTech IT Services',
  description: 'Download our device diagnostic and repair tracking app for Windows, macOS, and Linux. Get real-time diagnostics and professional support.',
  keywords: 'download app, device diagnostic, Windows, macOS, Linux, BridgeTech IT Services',
};

export default function DownloadAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
