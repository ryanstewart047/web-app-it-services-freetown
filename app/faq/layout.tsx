import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to common questions about our computer and mobile repair services, pricing, warranty, turnaround times, and more at IT Services Freetown.',
  keywords: ['repair FAQ', 'IT services questions', 'repair pricing Freetown', 'warranty policy', 'repair turnaround time'],
  openGraph: {
    title: 'Frequently Asked Questions | IT Services Freetown',
    description: 'Get answers about our repair services, pricing, warranty, and turnaround times.',
    type: 'website',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
