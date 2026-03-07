'use client'

import { useEffect, useState } from 'react'

const BANNER_IMAGES = [
  'https://static.wixstatic.com/media/b93b57_7c43712ed6a4455eba18bdd8f9ed27bf~mv2.jpg',
  'https://static.wixstatic.com/media/b93b57_1f3fa78447924d9da015333b95b79f6e~mv2.jpg',
  'https://static.wixstatic.com/media/b93b57_1f7fc4222f8b49679426e4b153ed4dbf~mv2.png',
]

interface PageBannerProps {
  title: string
  subtitle?: string
  icon?: string                // FontAwesome class e.g. "fas fa-info-circle"
  imageIndex?: number          // Force a specific image (0-2) instead of random
  compact?: boolean            // Shorter height for legal / utility pages
}

export default function PageBanner({
  title,
  subtitle,
  icon,
  imageIndex,
  compact = false,
}: PageBannerProps) {
  const [bgImage, setBgImage] = useState(BANNER_IMAGES[0])

  useEffect(() => {
    const idx =
      typeof imageIndex === 'number'
        ? imageIndex % BANNER_IMAGES.length
        : Math.floor(Math.random() * BANNER_IMAGES.length)
    setBgImage(BANNER_IMAGES[idx])
  }, [imageIndex])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: compact ? '200px' : '280px' }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Dark overlay with brand gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#040e40]/85 via-[#040e40]/70 to-red-900/60" />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 ${
          compact ? 'py-12 sm:py-16' : 'py-16 sm:py-20'
        }`}
      >
        {icon && (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-5 border border-white/20">
            <i className={`${icon} text-2xl text-white`} />
          </div>
        )}

        <h1
          className={`font-bold text-white drop-shadow-lg leading-tight ${
            compact
              ? 'text-2xl sm:text-3xl md:text-4xl'
              : 'text-3xl sm:text-4xl md:text-5xl'
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-red-100/90 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent dark:from-gray-950" />
    </section>
  )
}
