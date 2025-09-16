/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server deployment configuration (Vercel, Netlify, etc.)
  // This version supports API routes and dynamic features
  images: {
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
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
