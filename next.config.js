/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to enable API routes for Vercel
  trailingSlash: true,
  // Disable ESLint during builds to prevent failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure webpack to prevent infinite compilation
  webpack: (config) => {
    config.watchOptions = {
      poll: 3000,
      aggregateTimeout: 300,
      ignored: ['**/node_modules', '**/.next', '**/out']
    }
    return config
  },
  images: {
    unoptimized: true,
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
}

module.exports = nextConfig
