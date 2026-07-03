import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'

interface AffiliateProductCardProps {
  title: string
  description: string
  imageUrl?: string
  affiliateLink: string
  buttonText?: string
}

export function AffiliateProductCard({
  title,
  description,
  imageUrl,
  affiliateLink,
  buttonText = 'View on Amazon'
}: AffiliateProductCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 p-6">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain p-4 mix-blend-multiply"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
            <span className="text-sm font-medium">Product Image</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-[#040e40] leading-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3">
          {description}
        </p>
        
        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          {buttonText}
        </a>
        <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-wider">
          As an Amazon Associate we earn from qualifying purchases.
        </p>
      </div>
    </div>
  )
}
