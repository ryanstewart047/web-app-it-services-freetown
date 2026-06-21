import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const blockedPaths = [
    '/admin',
    '/api/',
    '/checkout',
    '/cart',
    '/order-confirmation/',
    '/_next/',
    '/admin-panel',
    '/admin-panel.html',
    '/ads-admin',
    '/banner-admin',
    '/blog/admin',
    '/forum/admin',
    '/forum/auth/',
    '/forum/settings',
    '/forum/verify',
    '/madinaface3bridgeproject/admin',
    '/offer-admin',
    '/receipt',
    '/unsubscribe',
    '/offline',
    '/s/',
    '/loading-demo',
    '/loading-status',
    '/network-test',
    '/offer-test',
    '/test-offer',
    '/test-ads',
    '/offer-debug',
    '/chat-demo',
    '/sound-demo',
    '/animation-test',
    '/favicon-generator',
    '/favicon-png-generator',
    '/pwa-test',
    '/articles-viewer',
    '/connect-agent',
    '/test-',
    '/*-test$',
    '/*debug*',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ads.txt'],
        disallow: blockedPaths,
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/ads.txt'],
        disallow: blockedPaths,
      },
    ],
    sitemap: 'https://www.itservicesfreetown.com/sitemap.xml',
  };
}
