import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Laptops & IT Products in Freetown Sierra Leone | IT Services Marketplace',
  description: 'Shop quality laptops, computers, phones & IT equipment in Freetown, Sierra Leone. Best prices on Dell, HP, Lenovo. Free delivery in Freetown. Genuine products with warranty. Serving all of Sierra Leone.',
  keywords: [
    // Primary keywords
    'buy laptop Freetown',
    'buy laptop Freetown Sierra Leone',
    'laptop for sale Freetown',
    'computer store Freetown',
    'computer shop Freetown Sierra Leone',
    'IT products Freetown',
    'electronics store Freetown',
    
    // Location-specific
    'Freetown Sierra Leone',
    'Sierra Leone',
    'Freetown',
    'IT services Freetown',
    'technology shop Sierra Leone',
    'computer accessories Freetown Sierra Leone',
    
    // Product-specific
    'Dell laptop Freetown',
    'HP laptop Sierra Leone',
    'Lenovo laptop Freetown',
    'buy smartphone Freetown',
    'iPhone Freetown Sierra Leone',
    'Samsung phone Freetown',
    'gaming laptop Sierra Leone',
    'business laptop Freetown',
    
    // Service-specific
    'laptop dealer Freetown',
    'authorized computer dealer Sierra Leone',
    'genuine laptop Sierra Leone',
    'warranty laptop Freetown',
    'free delivery Freetown',
    
    // Accessories
    'laptop charger Freetown',
    'computer accessories Sierra Leone',
    'printer Freetown',
    'router Freetown Sierra Leone',
    'hard drive Freetown',
    'SSD Freetown Sierra Leone',
    'RAM Freetown',
    'keyboard mouse Freetown',
    
    // Long-tail
    'where to buy laptop in Freetown',
    'best laptop store Sierra Leone',
    'cheapest laptop Freetown',
    'laptop repair and sales Freetown',
    'second hand laptop Freetown Sierra Leone',
    'new laptop Freetown',
    'laptop with warranty Sierra Leone',
    'mobile phone shop Freetown Sierra Leone',
  ],
  openGraph: {
    title: 'Buy Laptops & IT Products in Freetown Sierra Leone | Best Prices',
    description: 'Shop quality laptops, computers, and IT equipment in Freetown, Sierra Leone. Dell, HP, Lenovo. Free delivery. Genuine products with warranty.',
    url: 'https://www.itservicesfreetown.com/marketplace',
    siteName: 'IT Services Freetown',
    locale: 'en_SL',
    type: 'website',
    images: [
      {
        url: 'https://www.itservicesfreetown.com/og-marketplace.jpg',
        width: 1200,
        height: 630,
        alt: 'Buy Laptops and IT Products in Freetown Sierra Leone - IT Services Marketplace',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy Laptops & IT Products in Freetown Sierra Leone',
    description: 'Shop quality laptops, computers, phones in Freetown. Dell, HP, Lenovo. Free delivery in Sierra Leone.',
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
            name: 'IT Services Freetown - Computer & Laptop Store Sierra Leone',
            description: 'Leading computer and laptop store in Freetown, Sierra Leone. Buy Dell, HP, Lenovo laptops, smartphones, and IT equipment. Best prices in Freetown with free delivery across Sierra Leone.',
            url: 'https://www.itservicesfreetown.com/marketplace',
            telephone: '+23233399391',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '#1 Regent Highway Jui Junction',
              addressLocality: 'Freetown',
              addressRegion: 'Western Area',
              addressCountry: 'Sierra Leone',
              postalCode: '00232',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: '8.4657',
              longitude: '-13.2317',
            },
            areaServed: [
              {
                '@type': 'City',
                name: 'Freetown',
                '@id': 'https://en.wikipedia.org/wiki/Freetown',
              },
              {
                '@type': 'Country',
                name: 'Sierra Leone',
                '@id': 'https://en.wikipedia.org/wiki/Sierra_Leone',
              },
            ],
            priceRange: 'Le 100,000 - Le 10,000,000',
            currenciesAccepted: 'SLL, USD',
            paymentAccepted: ['Cash', 'Mobile Money', 'Bank Transfer', 'Orange Money', 'Afrimoney'],
            openingHours: 'Mo-Sa 08:00-18:00',
            image: 'https://www.itservicesfreetown.com/logo.png',
            sameAs: [
              'https://www.facebook.com/itservicesfreetown',
              'https://twitter.com/itservicesfreetown',
            ],
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Laptops and IT Products in Freetown Sierra Leone',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    name: 'Dell Laptops Freetown',
                    description: 'Genuine Dell laptops for sale in Freetown, Sierra Leone',
                    brand: {
                      '@type': 'Brand',
                      name: 'Dell',
                    },
                    image: 'https://www.itservicesfreetown.com/products/dell-laptop.jpg',
                    sku: 'DELL-LAPTOP-FT',
                  },
                  price: '2500000',
                  priceCurrency: 'SLL',
                  availability: 'https://schema.org/InStock',
                  url: 'https://www.itservicesfreetown.com/marketplace?category=laptops&brand=dell',
                  seller: {
                    '@type': 'Organization',
                    name: 'IT Services Freetown',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    name: 'HP Laptops Sierra Leone',
                    description: 'HP laptops with warranty in Freetown',
                    brand: {
                      '@type': 'Brand',
                      name: 'HP',
                    },
                    image: 'https://www.itservicesfreetown.com/products/hp-laptop.jpg',
                    sku: 'HP-LAPTOP-SL',
                  },
                  price: '2200000',
                  priceCurrency: 'SLL',
                  availability: 'https://schema.org/InStock',
                  url: 'https://www.itservicesfreetown.com/marketplace?category=laptops&brand=hp',
                  seller: {
                    '@type': 'Organization',
                    name: 'IT Services Freetown',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    name: 'Lenovo Laptops Freetown',
                    description: 'Lenovo business laptops in Sierra Leone',
                    brand: {
                      '@type': 'Brand',
                      name: 'Lenovo',
                    },
                    image: 'https://www.itservicesfreetown.com/products/lenovo-laptop.jpg',
                    sku: 'LENOVO-LAPTOP-FT',
                  },
                  price: '2000000',
                  priceCurrency: 'SLL',
                  availability: 'https://schema.org/InStock',
                  url: 'https://www.itservicesfreetown.com/marketplace?category=laptops&brand=lenovo',
                  seller: {
                    '@type': 'Organization',
                    name: 'IT Services Freetown',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    name: 'Smartphones Freetown',
                    description: 'Latest smartphones and mobile phones in Freetown',
                    brand: {
                      '@type': 'Brand',
                      name: 'Various Brands',
                    },
                    category: 'Electronics > Mobile Phones',
                    image: 'https://www.itservicesfreetown.com/products/smartphones.jpg',
                    sku: 'PHONE-MULTI-FT',
                  },
                  price: '800000',
                  priceCurrency: 'SLL',
                  availability: 'https://schema.org/InStock',
                  url: 'https://www.itservicesfreetown.com/marketplace?category=phones',
                  seller: {
                    '@type': 'Organization',
                    name: 'IT Services Freetown',
                  },
                },
              ],
            },
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
