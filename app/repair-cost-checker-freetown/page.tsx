import type { Metadata } from 'next'
import RepairCostCheckerClient from './RepairCostCheckerClient'

const title = 'Repair Cost Checker in Freetown | IT Services Freetown'
const description =
  'Estimate phone, laptop, tablet, unlocking, data recovery, and on-site repair costs in Freetown before booking with IT Services Freetown.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'repair cost checker Freetown',
    'phone repair price Freetown',
    'laptop repair cost Sierra Leone',
    'iPhone screen replacement Freetown',
    'Samsung charging port repair Freetown',
    'IT Services Freetown repair estimate'
  ],
  alternates: {
    canonical: 'https://www.itservicesfreetown.com/repair-cost-checker-freetown'
  },
  openGraph: {
    title,
    description,
    url: 'https://www.itservicesfreetown.com/repair-cost-checker-freetown',
    siteName: 'IT Services Freetown',
    images: [
      {
        url: 'https://www.itservicesfreetown.com/assets/images/iphone-repair.jpg',
        width: 1200,
        height: 630,
        alt: 'Phone repair estimate at IT Services Freetown'
      }
    ],
    locale: 'en_SL',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['https://www.itservicesfreetown.com/assets/images/iphone-repair.jpg']
  }
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Freetown Repair Cost Checker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  url: 'https://www.itservicesfreetown.com/repair-cost-checker-freetown',
  description,
  provider: {
    '@type': 'LocalBusiness',
    name: 'IT Services Freetown',
    image: 'https://www.itservicesfreetown.com/assets/logo.png',
    telephone: '+23233399391',
    email: 'support@itservicesfreetown.com',
    url: 'https://www.itservicesfreetown.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 1 Regent Highway, Jui Junction',
      addressLocality: 'Freetown',
      addressCountry: 'SL'
    },
    areaServed: [
      'Freetown',
      'Jui',
      'Regent Highway',
      'Waterloo',
      'Sierra Leone'
    ],
    priceRange: 'Le'
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'SLL',
    description: 'Free repair cost estimate before booking service.'
  }
}

export default function RepairCostCheckerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RepairCostCheckerClient />
    </>
  )
}
