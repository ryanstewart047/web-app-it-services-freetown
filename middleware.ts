import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    '/blog/admin',
    '/offer-admin',
    '/admin-panel',
  ];

  const lowValuePrefixPaths = [
    '/admin/',
    '/api/',
    '/pwa-test',
    '/loading-',
    '/test-',
    '/debug',
  ];

  const isLowValuePath =
    lowValueExactPaths.includes(pathname) ||
    lowValuePrefixPaths.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.includes('-test');

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
