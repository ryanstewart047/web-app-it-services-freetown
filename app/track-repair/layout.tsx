import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Repair - Real-Time Status Updates',
  description: 'Track your device repair status in real-time. Get instant updates on your computer or mobile repair at IT Services Freetown.',
  keywords: ['track repair', 'repair status', 'device repair tracking', 'repair progress Freetown'],
  openGraph: {
    title: 'Track Your Repair | IT Services Freetown',
    description: 'Check your device repair status in real-time with our tracking system.',
    type: 'website',
  },
}

export default function TrackRepairLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
