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
  return (
    <>
      {/* 
        Foolproof CSS guarantee: even before client hydration completes,
        strictly hide the main site navbar, sticky header, mobile bottom nav, 
        and website footer so this page is 100% standalone.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #site-sticky-header,
            .sticky-header-container,
            #mobile-bottom-nav,
            .mobile-bottom-nav,
            footer,
            .site-footer,
            #static-chat-float,
            #cookie-popup,
            #offer-popup,
            #newsletter-popup,
            #global-banner,
            .partners-section,
            [data-global-chrome="true"] {
              display: none !important;
            }
          `,
        }}
      />
      {children}
    </>
  )
}
