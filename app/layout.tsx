import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CookiePopup from '@/components/CookiePopup'
import BannerPopup from '@/components/BannerPopup'
import StaticChatFloat from '@/components/StaticChatFloat'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import Script from 'next/script'

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
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/assets/favicon-52x52.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/favicon-52x52.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon-52x52.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/assets/favicon-52x52.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 main-content">
            {children}
          </main>
          <Footer />
        </div>
        <CookiePopup />
        <BannerPopup />
        <StaticChatFloat />
        <ServiceWorkerRegistration />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
