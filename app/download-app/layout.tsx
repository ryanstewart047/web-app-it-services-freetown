import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Download Our App - BridgeTech IT Services',
  description: 'Download the BridgeTech IT Services app for Windows, Mac, and Linux. Book repairs, track status, and get AI support right from your desktop.',
  keywords: ['download IT services app', 'tech repair app', 'desktop app Freetown'],
  openGraph: {
    title: 'Download Our Desktop App | BridgeTech IT Services',
    description: 'Get our desktop app for seamless access to repair booking, tracking, and AI support.',
    type: 'website',
  },
}

export default function DownloadAppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
