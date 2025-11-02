import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout',
          '/cart',
          '/order-confirmation/',
          '/_next/',
          '/admin-panel.html',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout',
          '/cart',
          '/order-confirmation/',
        ],
      },
    ],
    sitemap: 'https://www.itservicesfreetown.com/sitemap.xml',
  };
}
