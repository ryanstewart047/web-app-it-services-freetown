import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, protocol } = request.nextUrl;

  // Enforce HTTPS in production only (skip for development, Docker, and localhost)
  if (
    process.env.NODE_ENV === 'production' && 
    protocol === 'http:' && 
    !process.env.DOCKER_ENV
  ) {
    const secureUrl = new URL(request.url);
    secureUrl.protocol = 'https:';
    return NextResponse.redirect(secureUrl, 308);
  }

  // Remove trailing slashes (except for root)
  if (pathname !== '/' && pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  // Handle .html extensions
  if (pathname.endsWith('.html')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('.html', '');
    return NextResponse.redirect(url, 301);
  }

  // Handle common variations
  const lowercasePath = pathname.toLowerCase();
  if (pathname !== lowercasePath && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    const url = request.nextUrl.clone();
    url.pathname = lowercasePath;
    return NextResponse.redirect(url, 301);
  }

  const lowValueExactPaths = [
    '/admin',
    '/ads-admin',
    '/banner-admin',
    '/checkout',
    '/cart',
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
    '/blog/admin',
    '/forum/admin',
    '/forum/settings',
    '/forum/verify',
    '/madinaface3bridgeproject/admin',
    '/offer-admin',
    '/admin-panel',
    '/receipt',
    '/unsubscribe',
    '/articles-viewer',
    '/connect-agent',
    '/offline',
  ];

  const lowValuePrefixPaths = [
    '/admin/',
    '/api/',
    '/forum/admin/',
    '/forum/auth/',
    '/order-confirmation/',
    '/pwa-test',
    '/loading-',
    '/s/',
    '/test-',
    '/debug',
  ];

  const lowValueSuffixPaths = ['-test'];

  const isLowValuePath =
    lowValueExactPaths.includes(pathname) ||
    lowValuePrefixPaths.some((prefix) => pathname.startsWith(prefix)) ||
    lowValueSuffixPaths.some((suffix) => pathname.endsWith(suffix));

  const response = NextResponse.next();

  if (isLowValuePath) {
    // Keep utility and test routes out of search/AdSense quality evaluation.
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     * - ads.txt, robots.txt, sitemap.xml (must be served directly)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|ads\\.txt|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
