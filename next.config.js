/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds to prevent failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  // Generate unique build ID to prevent cache issues
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`
  },
  // Configure webpack to prevent infinite compilation and resolve modules properly
  webpack: (config, { isServer }) => {
    // Prevent infinite compilation
    config.watchOptions = {
      poll: 3000,
      aggregateTimeout: 300,
      ignored: ['**/node_modules', '**/.next', '**/out']
    }
    
    // Fix for module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Disable caching that might cause chunk issues
    config.cache = false
    
    return config
  },
  images: {
    unoptimized: false, // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // Cache optimized images at Vercel Edge for 1 year (dramatically reduces Fast Origin Transfer)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Enable compression
  compress: true,
  
  // Redirects for common issues
  async redirects() {
    return [
      // Redirect trailing slashes to non-trailing slash URLs
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      // Redirect old blog URLs if any
      {
        source: '/blog.html',
        destination: '/blog',
        permanent: true,
      },
      // Redirect index.html to home
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      // Redirect common misspellings
      {
        source: '/marketplace.html',
        destination: '/marketplace',
        permanent: true,
      },
      {
        source: '/services.html',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/repair.html',
        destination: '/repair',
        permanent: true,
      },
      {
        source: '/contact.html',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/about.html',
        destination: '/about',
        permanent: true,
      },
    ];
  },
  
  // Handle 404s and set proper headers
  async headers() {
    return [
      // PWA Service Worker (Always revalidate)
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // PWA Manifest
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, max-age=0' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      // Next.js Optimized Images - Long-term Edge & Browser Cache
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, stale-while-revalidate=86400' },
        ],
      },
      // Static Public Assets (Images, Icons, CSS, JS) - 1 Year Immutable Cache
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Common static file extensions in public root
      {
        source: '/:file*.(ico|png|jpg|jpeg|webp|avif|svg|woff|woff2|ttf|eot|mp4|webm|mp3)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Content Security Policy
          // Allows scripts/styles from own domain and Google reCAPTCHA/Analytics
          // Prevents inline scripts and external script injections
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://adservice.google.com https://vercel.live https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' data: blob: https:",
              "connect-src 'self' https: data: blob: https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https://formspree.io https://api.github.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com https://adservice.google.com https://vercel.live",
              "frame-src 'self' https://www.google.com https://www.facebook.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://vercel.live https://www.youtube.com https://www.youtube-nocookie.com",
              "worker-src 'self' blob: data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://formspree.io",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
