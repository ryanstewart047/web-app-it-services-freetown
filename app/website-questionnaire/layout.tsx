import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Website Development Project Discovery Brief | BridgeTech IT Services',
  description:
    'Plan your new website with BridgeTech IT Services in Freetown, Sierra Leone. Complete our 5-minute interactive discovery brief to get a tailored scope, architecture plan, and custom quotation.',
  keywords: [
    'BridgeTech IT Services',
    'Website Development Questionnaire',
    'Web Design Freetown Sierra Leone',
    'Website Project Brief',
    'Software Development Sierra Leone',
    'Custom Website Design',
  ],
  authors: [{ name: 'BridgeTech IT Services' }],
  metadataBase: new URL('https://www.itservicesfreetown.com'),
  alternates: {
    canonical: '/website-questionnaire',
  },
  openGraph: {
    title: 'Website Development Project Discovery Brief | BridgeTech IT Services',
    description:
      'Plan your new website with BridgeTech IT Services. Complete our 5-minute interactive discovery brief to get an accurate scope and custom quotation.',
    url: 'https://www.itservicesfreetown.com/website-questionnaire',
    siteName: 'BridgeTech IT Services',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Development Project Discovery Brief | BridgeTech IT Services',
    description:
      'Plan your new website with BridgeTech IT Services. Complete our 5-minute interactive discovery brief to get an accurate scope and custom quotation.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function WebsiteQuestionnaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
