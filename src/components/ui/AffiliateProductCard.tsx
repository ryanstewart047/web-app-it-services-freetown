import Image from 'next/image'
import { ShoppingCart, Wrench, Sparkles, Smartphone, LucideIcon } from 'lucide-react'

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  wrench: Wrench,
  sparkles: Sparkles,
  smartphone: Smartphone,
  cart: ShoppingCart,
}

// Gradient backgrounds for each card type
const gradientMap: Record<string, string> = {
  wrench: 'from-slate-700 to-slate-900',
  sparkles: 'from-blue-700 to-blue-900',
  smartphone: 'from-red-700 to-red-900',
  cart: 'from-[#040e40] to-slate-900',
}

interface AffiliateProductCardProps {
  title: string
  description: string
  imageUrl?: string
  affiliateLink: string
  buttonText?: string
  iconName?: 'wrench' | 'sparkles' | 'smartphone' | 'cart'
  badge?: string
}

export function AffiliateProductCard({
  title,
  description,
  imageUrl,
  affiliateLink,
  buttonText = 'View on Amazon',
  iconName = 'cart',
  badge,
}: AffiliateProductCardProps) {
  const Icon = iconMap[iconName] ?? ShoppingCart
  const gradient = gradientMap[iconName] ?? gradientMap.cart

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image / Placeholder */}
      <div className="relative w-full aspect-square overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          // Premium styled placeholder with gradient + icon
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-4 p-6`}>
            <div className="p-5 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
              <Icon className="h-12 w-12 text-white" />
            </div>
            <p className="text-white/80 text-sm font-medium text-center leading-snug">{title}</p>
          </div>
        )}

        {/* Amazon badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 bg-[#ff9900] text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow">
            <span className="text-base leading-none">a</span> Amazon
          </span>
        </div>

        {badge && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-[#040e40] leading-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mb-5 flex-1 leading-relaxed">
          {description}
        </p>

        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          {buttonText}
        </a>

        <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-wider leading-relaxed">
          As an Amazon Associate we earn from qualifying purchases.
        </p>
      </div>
    </div>
  )
}
