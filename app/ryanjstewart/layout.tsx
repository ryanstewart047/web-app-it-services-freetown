import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://itservicesfreetown.com'),
    title: 'Ryan J Stewart - Full Stack Developer',
    description: 'Full Stack Developer specializing in modern web applications. Experienced in Next.js, React, Node.js, and database technologies. Check out my portfolio and professional experience.',
    openGraph: {
      type: 'profile',
      locale: 'en_US',
      url: 'https://itservicesfreetown.com/ryanjstewart',
      siteName: 'Ryan J Stewart Portfolio',
      title: 'Ryan J Stewart - Full Stack Developer',
      description: 'Full Stack Developer specializing in modern web applications. Experienced in Next.js, React, Node.js, and database technologies.',
      images: [
        {
          url: '/api/og-image',
          width: 1200,
          height: 630,
          alt: 'Ryan J Stewart - Full Stack Developer',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Ryan J Stewart - Full Stack Developer',
      description: 'Full Stack Developer specializing in modern web applications. Experienced in Next.js, React, Node.js, and database technologies.',
      images: ['/api/og-image'],
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
  }
}

export default function RyanJStewartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
