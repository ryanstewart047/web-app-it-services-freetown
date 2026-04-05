import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn More - Our Services & Expertise',
  description: 'Discover the full range of IT repair services offered by IT Services Freetown. From computer repair and mobile unlocking to data recovery and network setup.',
  alternates: {
    canonical: 'https://www.itservicesfreetown.com/learn-more',
  },
  keywords: ['IT services Freetown', 'repair services', 'computer repair', 'mobile repair Sierra Leone', 'tech expertise'],
  openGraph: {
    title: 'Learn More About Our Services | IT Services Freetown',
    description: 'Full range of professional IT repair services in Freetown, Sierra Leone.',
    type: 'website',
  },
}

export default function LearnMoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
