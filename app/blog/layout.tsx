import { Metadata } from 'next'
import './blog-fonts.css'

export const metadata: Metadata = {
  title: 'Blog - Tech News, Expert Guides & IT Insights',
  description:
    'Read the latest Sierra Leone technology news, expert repair guides, and IT insights from BridgeTech IT Services.',
  keywords: [
    'tech blog Freetown',
    'Sierra Leone tech news',
    'repair guides',
    'IT tips Sierra Leone',
    'phone repair guide',
    'computer tips',
  ],
  alternates: {
    canonical: 'https://www.itservicesfreetown.com/blog',
    types: {
      'application/rss+xml': 'https://www.itservicesfreetown.com/rss.xml',
    },
  },
  openGraph: {
    title: 'BridgeTech IT Services News & Blog - Sierra Leone Tech & Repair Guides',
    description:
      "Latest Sierra Leone technology news, expert repair tips, and IT guides from Freetown's #1 repair & IT service.",
    url: 'https://www.itservicesfreetown.com/blog',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
