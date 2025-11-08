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
    url: 'https://www.itservicesfreetown.com/marketplace',
    siteName: 'IT Services Freetown',
    locale: 'en_SL',
    type: 'website',
    images: [
      {
        url: 'https://www.itservicesfreetown.com/og-marketplace.jpg',
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
    images: ['https://www.itservicesfreetown.com/og-marketplace.jpg'],
  },
  alternates: {
    canonical: 'https://www.itservicesfreetown.com/marketplace',
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
  return (
    <>
      {/* Structured Data for Store */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: 'IT Services Freetown Marketplace',
            description: 'Buy quality laptops, computers, mobile phones, and electronics in Freetown, Sierra Leone',
            url: 'https://www.itservicesfreetown.com/marketplace',
            telephone: '+23233399391',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '#1 Regent Highway Jui Junction',
              addressLocality: 'Freetown',
              addressCountry: 'SL',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: '8.4657',
              longitude: '-13.2317',
            },
            priceRange: 'Le 100,000 - Le 10,000,000',
            currenciesAccepted: 'SLL',
            paymentAccepted: ['Cash', 'Mobile Money', 'Bank Transfer'],
            openingHours: 'Mo-Sa 08:00-18:00',
            image: 'https://www.itservicesfreetown.com/logo.png',
            sameAs: [
              'https://www.facebook.com/itservicesfreetown',
              'https://twitter.com/itservicesfreetown',
            ],
          }),
        }}
      />

      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.itservicesfreetown.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Marketplace',
                item: 'https://www.itservicesfreetown.com/marketplace',
              },
            ],
          }),
        }}
      />

      {/* WebPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': 'https://www.itservicesfreetown.com/marketplace',
            url: 'https://www.itservicesfreetown.com/marketplace',
            name: 'Shop IT Products & Accessories | IT Services Freetown Marketplace',
            description: 'Buy quality laptops, computers, mobile phones, accessories, and IT equipment in Freetown, Sierra Leone. Best prices, genuine products, warranty included.',
            isPartOf: {
              '@type': 'WebSite',
              '@id': 'https://www.itservicesfreetown.com',
              url: 'https://www.itservicesfreetown.com',
              name: 'IT Services Freetown',
            },
            inLanguage: 'en-SL',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://www.itservicesfreetown.com/marketplace?search={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      {children}
    </>
  );
}
