import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CookiePopup from '@/components/CookiePopup'
import BannerPopup from '@/components/BannerPopup'
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
  title: 'IT Services Freetown - Computer & Mobile Repair',
  description: 'Professional computer and mobile repair services in Freetown. Book appointments, track repairs, and get AI-powered troubleshooting support.',
  keywords: 'computer repair, mobile repair, IT services, Freetown, Sierra Leone, laptop repair, phone repair',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IT Services Freetown'
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
          <Toaster position="top-right" />
        </AnalyticsProvider>
      </body>
    </html>
  )
}
