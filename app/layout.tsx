import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CookiePopup from '@/components/CookiePopup'
import BannerPopup from '@/components/BannerPopup'
import StaticChatFloat from '@/components/StaticChatFloat'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IT Services Freetown - Computer & Mobile Repair',
  description: 'Professional computer and mobile repair services in Freetown. Book appointments, track repairs, and get AI-powered troubleshooting support.',
  keywords: 'computer repair, mobile repair, IT services, Freetown, Sierra Leone, laptop repair, phone repair',
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
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
