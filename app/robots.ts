import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const blockedPaths = [
    '/admin/',
    '/api/',
    '/checkout',
    '/cart',
    '/order-confirmation/',
    '/_next/',
    '/admin-panel.html',
    '/blog/admin/',
    '/offer-admin/',
    '/loading-demo',
    '/loading-status',
    '/network-test',
    '/offer-test',
    '/test-offer',
    '/offer-debug',
    '/chat-demo',
    '/sound-demo',
    '/animation-test',
    '/favicon-generator',
    '/favicon-png-generator',
    '/pwa-test',
    '/*-test',
    '/*debug*',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: blockedPaths,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: blockedPaths,
      },
    ],
    sitemap: 'https://www.itservicesfreetown.com/sitemap.xml',
  };
}
