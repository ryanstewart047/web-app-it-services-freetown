import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Tech Tips, Repair Guides & IT News',
  description: 'Read the latest tech tips, repair guides, and IT news from IT Services Freetown. Learn how to troubleshoot common device problems and maintain your electronics.',
  keywords: ['tech blog Freetown', 'repair guides', 'IT tips Sierra Leone', 'phone repair guide', 'computer tips'],
  openGraph: {
    title: 'IT Services Freetown Blog - Tech Tips & Repair Guides',
    description: 'Expert tech tips, repair guides, and IT news from Freetown\'s #1 repair service.',
    type: 'website',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
