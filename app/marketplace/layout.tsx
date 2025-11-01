import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop IT Products & Accessories | IT Services Freetown Marketplace',
  description: 'Buy quality laptops, computers, mobile phones, accessories, and IT equipment in Freetown, Sierra Leone. Best prices, genuine products, warranty included. Free delivery available.',
  keywords: [
    'buy laptop Freetown',
    'buy computer Sierra Leone',
    'mobile phone shop Freetown',
    'IT products Freetown',
    'computer accessories Sierra Leone',
    'laptop for sale Freetown',
    'smartphone Freetown',
    'technology shop Sierra Leone',
    'computer parts Freetown',
    'electronics store Freetown',
    'gaming laptop Sierra Leone',
    'business laptop Freetown',
    'iPhone Freetown',
    'Samsung phone Sierra Leone',
    'Dell laptop Freetown',
    'HP laptop Sierra Leone',
    'printer Freetown',
    'router Freetown',
    'hard drive Sierra Leone',
    'SSD Freetown'
  ],
  openGraph: {
    title: 'Shop IT Products & Accessories - IT Services Freetown',
    description: 'Buy quality laptops, computers, mobile phones, and IT equipment in Freetown. Best prices, genuine products, warranty included.',
    url: 'https://itservicesfreetown.com/marketplace',
    siteName: 'IT Services Freetown',
    locale: 'en_SL',
    type: 'website',
    images: [
      {
        url: 'https://itservicesfreetown.com/og-marketplace.jpg',
        width: 1200,
        height: 630,
        alt: 'IT Services Freetown Marketplace - Shop Quality Tech Products',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop IT Products & Accessories - IT Services Freetown',
    description: 'Buy quality laptops, computers, mobile phones, and IT equipment in Freetown.',
    images: ['https://itservicesfreetown.com/og-marketplace.jpg'],
  },
  alternates: {
    canonical: 'https://itservicesfreetown.com/marketplace',
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
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
