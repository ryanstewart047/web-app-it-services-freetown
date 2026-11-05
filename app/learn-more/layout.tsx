import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn More - Our Services & Expertise',
  description: 'Discover the full range of IT repair services offered by BridgeTech IT Services. From computer repair and mobile unlocking to data recovery and network setup.',
  keywords: ['BridgeTech IT Services', 'repair services', 'computer repair', 'mobile repair Sierra Leone', 'tech expertise'],
  openGraph: {
    title: 'Learn More About Our Services | BridgeTech IT Services',
    description: 'Full range of professional IT repair services in Freetown, Sierra Leone.',
    type: 'website',
  },
}

export default function LearnMoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
