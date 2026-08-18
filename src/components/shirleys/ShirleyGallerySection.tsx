'use client'

import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MessageCircle,
  Share2,
  ShoppingBag,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react'
import type { ShirleyGalleryItem } from '@/lib/shirley-gallery-storage'

const whatsappNumber = '23299781649'

function getGalleryVideoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }

    if (host.includes('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }

    if (host.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : ''
    }
  } catch {
    return ''
  }

  return ''
}

function GalleryMedia({ item, autoPlay = false }: { item: ShirleyGalleryItem; autoPlay?: boolean }) {
  const embedUrl = item.type === 'video' ? getGalleryVideoEmbedUrl(item.url) : ''

  if (item.type === 'video') {
    return embedUrl ? (
      <iframe
        src={`${embedUrl}${autoPlay ? '?autoplay=1' : ''}`}
        title={item.title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <video
        src={item.url}
        controls
        autoPlay={autoPlay}
        className="h-full w-full object-contain"
        preload="metadata"
      />
    )
  }

  return (
    <img
      src={item.url}
      alt={item.title}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  )
}

function ShareButton({
  item,
  className = '',
  iconSize = 'h-4 w-4',
  label = 'Share',
}: {
  item: ShirleyGalleryItem
  className?: string
  iconSize?: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation()

    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/shirleys${item.id ? `#item-${item.id}` : '#gallery'}`
      : 'https://example.com/shirleys'

    const shareData = {
      title: item.title,
      text: item.caption
        ? `${item.title} — ${item.caption}${item.price ? ` · ${item.price}` : ''}`
        : `${item.title}${item.price ? ` · ${item.price}` : ''} — Shirley's Stitches & Sugar`,
      url: shareUrl,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        )
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // User cancelled or browser blocked — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share this item"
      className={className}
    >
      {copied ? <Check className={iconSize} /> : <Share2 className={iconSize} />}
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  )
}

export function ShirleyGallerySection({ items }: { items: ShirleyGalleryItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const activeItem = selectedIndex !== null ? items[selectedIndex] : null

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedIndex === null) return
      if (e.key === 'Escape') {
        setSelectedIndex(null)
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : items.length - 1) : null))
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev < items.length - 1 ? prev + 1 : 0) : null))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, items.length])

  function getWhatsAppOrderUrl(item: ShirleyGalleryItem) {
    if (item.orderUrl) return item.orderUrl

    const text = encodeURIComponent(
      `Hi Shirley! I saw "${item.title}"${item.price ? ` (${item.price})` : ''} in your gallery on your website and I'd like to place an order!`
    )
    return `https://wa.me/${whatsappNumber}?text=${text}`
  }

  return (
    <section id="gallery" className="bg-[#fff7ea] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8a2746]">
              Shirley's gallery &amp; available creations
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#2f1f2a] sm:text-4xl">
              A closer look at the treats, stitches, and finished details.
            </h2>
            <p className="mt-2 text-sm text-[#6d4c57]">
              Click any photo or video to view full screen or place a direct order.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Shirley, I'm looking at your gallery and want to ask about a custom order.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8a2746] px-5 py-3 text-sm font-black text-white transition hover:bg-[#6f1f38] shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Ask about an order
          </a>
        </div>

        {items.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const isProduct = item.isAvailableProduct || item.price || item.orderButtonText
              const orderUrl = getWhatsAppOrderUrl(item)

              return (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-[#8a2746]/10 bg-white shadow-sm transition hover:shadow-xl hover:shadow-[#8a2746]/10"
                >
                  <div>
                    {/* Clickable Media Header */}
                    <div
                      onClick={() => setSelectedIndex(index)}
                      className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-[#f8edf2]"
                      title="Click to expand full screen"
                    >
                      <GalleryMedia item={item} />
                      <div className="absolute inset-0 flex items-center justify-center bg-[#2f1f2a]/0 opacity-0 backdrop-blur-[2px] transition duration-300 group-hover:bg-[#2f1f2a]/40 group-hover:opacity-100">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-[#8a2746] shadow-md">
                          <ZoomIn className="h-4 w-4" />
                          Expand View
                        </div>
                      </div>

                      {/* Type Badge & Price Badge */}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#2f1f2a]/80 px-3 py-1 text-xs font-black text-white backdrop-blur-sm">
                          <Sparkles className="h-3 w-3 text-[#f7c948]" />
                          {item.type === 'video' ? 'Video' : 'Photo'}
                        </span>
                        {isProduct && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#8a2746] px-3 py-1 text-xs font-black text-white shadow-sm">
                            <ShoppingBag className="h-3 w-3" />
                            Available
                          </span>
                        )}
                      </div>

                      {/* Brand Avatar Watermark Badge */}
                      {item.showWatermark !== false && (
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-md border border-white/25 shadow-md pointer-events-none group-hover:bg-black/65 transition">
                          <img
                            src="/assets/shirleys-logo-transparent.png"
                            alt="Shirley's Watermark"
                            className="h-6 w-6 rounded-full object-contain"
                          />
                          <span className="font-serif italic font-bold text-[10px] text-rose-100 tracking-wide">
                            Shirley's
                          </span>
                        </div>
                      )}

                      {item.price && (
                        <div className="absolute bottom-3 right-3 rounded-full bg-[#f7c948] px-3.5 py-1 text-xs font-black text-[#2f1f2a] shadow-md">
                          {item.price}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <h3
                        onClick={() => setSelectedIndex(index)}
                        className="cursor-pointer text-lg font-black text-[#2f1f2a] hover:text-[#8a2746] transition"
                      >
                        {item.title}
                      </h3>
                      {item.caption && <p className="mt-2 text-sm leading-6 text-[#6d4c57]">{item.caption}</p>}
                    </div>
                  </div>

                  {/* Footer: Order + Share */}
                  <div className="p-5 pt-0 flex items-center gap-2">
                    {isProduct ? (
                      <a
                        href={orderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8a2746] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#6f1f38] shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {item.orderButtonText || 'Order This Item'}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#8a2746]/20 bg-[#fffdf8] px-4 py-2 text-xs font-black text-[#8a2746] transition hover:bg-[#8a2746] hover:text-white"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                        View Fullscreen
                      </button>
                    )}

                    {/* Share button — always visible on product cards */}
                    <ShareButton
                      item={item}
                      label=""
                      iconSize="h-4 w-4"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#8a2746]/20 bg-[#fffdf8] text-[#8a2746] transition hover:bg-[#8a2746] hover:text-white"
                    />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#8a2746]/25 bg-white p-8 text-center">
            <Sparkles className="mx-auto h-9 w-9 text-[#f7c948]" />
            <p className="mt-4 text-lg font-black text-[#2f1f2a]">Gallery coming soon.</p>
            <p className="mt-2 text-sm leading-6 text-[#6d4c57]">
              Shirley's latest handmade treats and stitched looks will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="absolute right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-black transition"
            title="Close (Esc)"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setSelectedIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : items.length - 1) : 0))}
                className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-black transition"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndex((prev) => (prev !== null ? (prev < items.length - 1 ? prev + 1 : 0) : 0))}
                className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-black transition"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-[#fffdf8] shadow-2xl">
            <div className="relative max-h-[65vh] min-h-[300px] w-full overflow-hidden bg-black flex items-center justify-center">
              <GalleryMedia item={activeItem} autoPlay={true} />
              {activeItem.showWatermark !== false && (
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-1.5 backdrop-blur-md border border-white/20 shadow-lg pointer-events-none">
                  <img
                    src="/assets/shirleys-logo-transparent.png"
                    alt="Shirley's Watermark"
                    className="h-8 w-8 rounded-full object-contain drop-shadow"
                  />
                  <div className="flex flex-col text-left">
                    <span className="font-serif italic font-bold text-xs text-rose-100 leading-tight">Shirley's</span>
                    <span className="text-[9px] font-black text-[#f7c948] tracking-wider uppercase">Stitches &amp; Sweet</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#8a2746]/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#8a2746]">
                    {activeItem.type === 'video' ? 'Video Showcase' : 'Gallery Photo'}
                  </span>
                  {activeItem.price && (
                    <span className="rounded-full bg-[#f7c948] px-3 py-1 text-xs font-black text-[#2f1f2a]">
                      {activeItem.price}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-2xl font-black text-[#2f1f2a]">{activeItem.title}</h3>
                {activeItem.caption && <p className="mt-2 leading-7 text-[#6d4c57]">{activeItem.caption}</p>}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {/* Share button in lightbox */}
                <ShareButton
                  item={activeItem}
                  label="Share"
                  iconSize="h-4 w-4"
                  className="inline-flex items-center gap-2 rounded-full border border-[#8a2746]/30 px-5 py-3 text-sm font-black text-[#8a2746] transition hover:bg-[#8a2746] hover:text-white"
                />

                <a
                  href={getWhatsAppOrderUrl(activeItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8a2746] px-6 py-3 text-sm font-black text-white transition hover:bg-[#6f1f38] shadow-lg shadow-[#8a2746]/20"
                >
                  <MessageCircle className="h-5 w-5" />
                  {activeItem.orderButtonText || 'Order This Item'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
