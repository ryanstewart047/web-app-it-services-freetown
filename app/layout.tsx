import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CookiePopup from '@/components/CookiePopup'
import BannerPopup from '@/components/BannerPopup'
import OfferPopup from '@/components/OfferPopup'
import StaticChatFloat from '@/components/StaticChatFloat'
import FloatingScrollToTop from '@/components/FloatingScrollToTop'
import ServiceWorkerRegistration from '../src/components/ServiceWorkerRegistration'
import PWAInstallBanner from '../src/components/PWAInstallBanner'
import NetworkMonitor from '../src/components/NetworkMonitor'
import { AnalyticsProvider } from '../src/components/AnalyticsTracker'
import Script from 'next/script'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://itservicesfreetown.com'),
  title: {
    default: 'IT Services Freetown - #1 Computer & Mobile Repair in Sierra Leone',
    template: '%s | IT Services Freetown'
  },
  description: 'Freetown\'s #1 Computer & Mobile Repair Experts. Same-day service, 1-month warranty, 95% success rate. Professional laptop repair, phone repair, data recovery, and IT solutions in Sierra Leone. Book online now!',
  keywords: [
    'computer repair Freetown',
    'mobile repair Sierra Leone',
    'IT services Freetown',
    'laptop repair Freetown',
    'phone repair Sierra Leone',
    'iPhone repair Freetown',
    'screen replacement Freetown',
    'data recovery Sierra Leone',
    'motherboard repair',
    'virus removal Freetown',
    'network unlocking',
    'same day repair Freetown',
    'tech support Sierra Leone'
  ],
  authors: [{ name: 'IT Services Freetown' }],
  creator: 'IT Services Freetown',
  publisher: 'IT Services Freetown',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IT Services Freetown'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://itservicesfreetown.com',
    siteName: 'IT Services Freetown',
    title: 'IT Services Freetown - #1 Computer & Mobile Repair',
    description: 'Professional computer and mobile repair services in Freetown. Same-day service, 1-month warranty, 95% success rate.',
    images: [
      {
        url: '/assets/images/slide01.jpg',
        width: 1200,
        height: 630,
        alt: 'IT Services Freetown - Professional Repair Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IT Services Freetown - #1 Computer & Mobile Repair',
    description: 'Professional computer and mobile repair services in Freetown. Same-day service, 1-month warranty, 95% success rate.',
    images: ['/assets/images/slide01.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense - Replace ca-pub-XXXXXXXXXXXXXXXX with your Publisher ID after approval */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Font Awesome */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
        
        {/* PWA Meta Tags - Updated */}
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IT Services Freetown" />
        
        {/* Favicon - Using Site Logo */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Apple Touch Icons - Using Site Logo */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon.svg" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon.svg" />
        
        {/* Structured Data - Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              '@id': 'https://itservicesfreetown.com',
              name: 'IT Services Freetown',
              alternateName: 'IT Services SL',
              description: 'Professional computer and mobile repair services in Freetown, Sierra Leone. Same-day service, 1-month warranty, 95% success rate.',
              url: 'https://itservicesfreetown.com',
              telephone: '+23233399391',
              email: 'info@itservicesfreetown.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '#1 Regent Highway Jui Junction',
                addressLocality: 'Freetown',
                addressCountry: 'SL',
                addressRegion: 'Western Area',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: '8.4840',
                longitude: '-13.2130',
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  opens: '08:00',
                  closes: '18:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: 'Saturday',
                  opens: '09:00',
                  closes: '17:00',
                },
              ],
              priceRange: '$$',
              image: 'https://itservicesfreetown.com/assets/images/slide01.jpg',
              logo: 'https://itservicesfreetown.com/assets/logo.svg',
              sameAs: [
                'https://www.facebook.com/itservicesfreetown',
                'https://twitter.com/itservicesft',
                'https://www.instagram.com/itservicesfreetown',
              ],
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '1000',
                bestRating: '5',
                worstRating: '1',
              },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Repair Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Computer Repair',
                      description: 'Professional computer and laptop repair services',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Mobile Phone Repair',
                      description: 'Expert mobile phone and smartphone repair',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Data Recovery',
                      description: 'Professional data recovery services',
                    },
                  },
                ],
              },
            }),
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'IT Services Freetown',
              url: 'https://itservicesfreetown.com',
              logo: 'https://itservicesfreetown.com/assets/logo.svg',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+23233399391',
                contactType: 'customer service',
                areaServed: 'SL',
                availableLanguage: ['en', 'kri'],
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <AnalyticsProvider config={{
          enabled: true,
          trackPageViews: true,
          trackClicks: true,
          trackFormInteractions: true,
          trackErrors: true,
          trackPerformance: true,
          sessionTimeout: 30
        }}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <OfferPopup delay={30000} />
          <Toaster position="top-right" />
        </AnalyticsProvider>
      </body>
    </html>
  )
}
