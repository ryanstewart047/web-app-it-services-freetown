import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  getPublicShirleyGalleryItems,
  type ShirleyGalleryItem,
} from '@/lib/shirley-gallery-storage'
import { ShirleyGallerySection } from '@/components/shirleys/ShirleyGallerySection'
import {
  CakeSlice,
  ChefHat,
  Cookie,
  Facebook,
  GlassWater,
  Heart,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
  Shirt,
  Sparkles,
  Star,
  Twitter,
  Utensils,
  Youtube,
} from 'lucide-react'

const brandName = "Shirley's Stiches & Sweet"
const canonicalUrl = 'https://www.itservicesfreetown.com/shirleys'
const whatsappNumber = '23299781649'
const whatsappMessage = encodeURIComponent(
  `Hi Shirley, I found ${brandName} on itservicesfreetown.com and I want to ask about an order.`
)

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    absolute: `${brandName} | Bakery, Pastries & Fashion in Freetown`
  },
  description:
    "Order homemade pastries, celebration treats, custom fashion pieces, alterations, and event bundles from Shirley's Stiches & Sweet in Freetown, Sierra Leone.",
  keywords: [
    "Shirley's Stiches and Sweet",
    "Shirley's Stitches and Sweet",
    'bakery in Freetown',
    'pastries in Freetown',
    'custom cakes Freetown',
    'fashion designer Freetown',
    'tailoring in Freetown',
    'African fashion Sierra Leone',
    'special day cakes Freetown',
    'small chops Freetown',
    'custom outfits Freetown'
  ],
  alternates: {
    canonical: canonicalUrl
  },
  openGraph: {
    type: 'website',
    locale: 'en_SL',
    url: canonicalUrl,
    title: `${brandName} | Bakery, Pastries & Fashion`,
    description:
      'Sweet pastries, celebration treats, custom styles, and stitch-made outfits for everyday joy and special events in Freetown.',
    siteName: brandName,
    images: [
      {
        url: '/shirleys/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${brandName} bakery, pastries and fashion`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brandName} | Bakery, Pastries & Fashion`,
    description:
      'Sweet pastries, celebration treats, custom styles, and stitch-made outfits in Freetown.',
    images: ['/shirleys/opengraph-image']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }
}

const services = [
  {
    title: 'Bakery & pastries',
    text: 'Cupcakes, cookies, doughnuts, meat pies, small chops, and soft pastries for home treats, offices, special days, and weekend orders.',
    icon: ChefHat,
    color: 'bg-[#8a2746] text-white'
  },
  {
    title: 'Custom celebration treats',
    text: 'Special treat boxes, party trays, dessert tables, simple cakes, and custom sweet packages made to match your event mood.',
    icon: CakeSlice,
    color: 'bg-[#f7c948] text-[#2f1f2a]'
  },
  {
    title: 'Beverages',
    text: 'Fresh fruit juices, bottled soft drinks, and other refreshing drinks served cold — perfect as add-ons to any pastry or event order.',
    icon: GlassWater,
    color: 'bg-[#1a6f5a] text-white'
  },
  {
    title: 'Fashion & tailoring',
    text: 'Women and kids outfits, alterations, matching sets, modest pieces, and made-to-measure designs for everyday wear and events.',
    icon: Scissors,
    color: 'bg-[#2f6f6a] text-white'
  }
]

const bundles = [
  'Special treat box with a matching outfit',
  'Bridal shower pastries and simple custom styles',
  'Kids party pastries with coordinated dresses or shirts',
  'Office snack tray plus branded apron or fabric detail',
  'Sunday best outfit with a dessert box for family visits'
]

const keywords = [
  'Custom cakes in Freetown',
  'Pastries and small chops',
  'Fresh juice in Freetown',
  'Soft drinks and beverages',
  'Fashion designer in Freetown',
  'Dress alterations',
  'Special treat boxes',
  'African wear and matching outfits'
]

const socialLinks = [
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'X', href: '#', icon: Twitter },
  { label: 'YouTube', href: '#', icon: Youtube }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': ['Bakery', 'ClothingStore'],
  name: brandName,
  alternateName: [
    "Shirley's Stitches & Sweet",
    "Shirley's Stiches and Sweet"
  ],
  url: canonicalUrl,
  logo: 'https://www.itservicesfreetown.com/assets/shirleys-stiches-sweet-logo.svg',
  image: 'https://www.itservicesfreetown.com/shirleys/opengraph-image',
  description:
    "Freetown bakery, pastries, custom treats, fashion, tailoring, and event bundle brand.",
  telephone: '+23299781649',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Freetown',
    addressCountry: 'SL'
  },
  areaServed: ['Freetown', 'Jui', 'Waterloo', 'Western Area', 'Sierra Leone'],
  priceRange: 'Le',
  makesOffer: [
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Pastry and custom treat orders'
      }
    },
    {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Custom fashion and tailoring'
      }
    }
  ],
  parentOrganization: {
    '@type': 'Organization',
    name: 'IT Services Freetown',
    url: 'https://www.itservicesfreetown.com'
  }
}

function SocialLinks({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const classes =
    tone === 'dark'
      ? 'border-white/15 bg-white/10 text-white hover:bg-white hover:text-[#8a2746]'
      : 'border-[#8a2746]/15 bg-white text-[#8a2746] hover:bg-[#8a2746] hover:text-white'

  return (
    <div className="flex items-center gap-2" aria-label={`${brandName} social media links`}>
      {socialLinks.map((social) => {
        const Icon = social.icon
        return (
          <a
            key={social.label}
            href={social.href}
            aria-label={`${social.label} placeholder link`}
            title={`${social.label} link coming soon`}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${classes}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        )
      })}
    </div>
  )
}

function ShirleyHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#8a2746]/15 bg-[#fffdf8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/shirleys" className="flex items-center gap-3" aria-label={`${brandName} home`}>
          <Image
            src="/assets/shirleys-stiches-sweet-logo.svg"
            alt={`${brandName} logo`}
            width={174}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold text-[#4d3039] md:flex">
          <a href="#gallery" className="transition hover:text-[#8a2746]">Gallery</a>
          <a href="#treats" className="transition hover:text-[#8a2746]">Treats</a>
          <a href="#beverages" className="transition hover:text-[#8a2746]">Drinks</a>
          <a href="#fashion" className="transition hover:text-[#8a2746]">Fashion</a>
          <a href="#bundles" className="transition hover:text-[#8a2746]">Bundles</a>
          <a href="#order" className="transition hover:text-[#8a2746]">Order</a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <SocialLinks />
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#8a2746] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#6f1f38]"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            Order
          </a>
        </div>
      </div>
    </header>
  )
}

function ProductScene() {
  return (
    <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] border border-white/50 bg-[#fffdf8] shadow-2xl shadow-[#8a2746]/20">
      <div className="absolute inset-x-0 top-0 h-32 bg-[#8a2746]" />
      <div className="absolute left-6 top-6 rounded-full bg-[#f7c948] px-4 py-2 text-sm font-black text-[#2f1f2a]">
        Fresh + fitted
      </div>
      <div className="absolute right-8 top-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#2f6f6a] text-white">
        <Sparkles className="h-11 w-11" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 gap-3 p-6">
        <div className="flex h-44 flex-col justify-between rounded-2xl bg-[#f7c948] p-4 text-[#2f1f2a] shadow-lg">
          <CakeSlice className="h-10 w-10" />
          <div>
            <p className="text-xs font-black uppercase tracking-wide">Sweet</p>
            <p className="mt-1 text-2xl font-black leading-none">Cake boxes</p>
          </div>
        </div>
        <div className="flex h-56 flex-col justify-between rounded-2xl bg-[#8a2746] p-4 text-white shadow-lg">
          <Shirt className="h-10 w-10" />
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#ffd9e7]">Stiches</p>
            <p className="mt-1 text-2xl font-black leading-none">Custom looks</p>
          </div>
        </div>
        <div className="flex h-44 flex-col justify-between self-end rounded-2xl bg-[#2f6f6a] p-4 text-white shadow-lg">
          <Cookie className="h-10 w-10" />
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#d7fff7]">Pastries</p>
            <p className="mt-1 text-2xl font-black leading-none">Party trays</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-24 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full border-[14px] border-[#fffdf8] bg-[#f3a6bd]" />
    </div>
  )
}



export default async function ShirleysPage() {
  const galleryItems = await getPublicShirleyGalleryItems()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-[#fffdf8] text-[#2f1f2a]">
        <ShirleyHeader />

        <main>
          <section className="relative overflow-hidden bg-[#fffdf8]">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#8a2746] via-[#f7c948] to-[#2f6f6a]" />
            <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.88fr] lg:px-8">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8a2746]/20 bg-white px-4 py-2 text-sm font-black text-[#8a2746] shadow-sm">
                  <Heart className="h-4 w-4 fill-[#8a2746]" />
                  Bakery, pastries and fashion in Freetown
                </div>
                <h1 className="max-w-4xl text-4xl font-black leading-tight text-[#2f1f2a] sm:text-5xl lg:text-6xl">
                  Sweet treats and stitch-made style for joyful moments.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6d4c57]">
                  {brandName} creates soft pastries, custom celebration treats, and made-to-measure fashion pieces for special days, family events, church outings, office snacks, and everyday confidence.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8a2746] px-6 py-3 text-base font-black text-white shadow-lg shadow-[#8a2746]/20 transition hover:bg-[#6f1f38]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Start an order
                  </a>
                  <a
                    href="#services"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#2f6f6a] px-6 py-3 text-base font-black text-[#2f6f6a] transition hover:bg-[#2f6f6a] hover:text-white"
                  >
                    View services
                  </a>
                </div>
                <div className="mt-8 grid max-w-2xl gap-3 text-sm font-bold text-[#4d3039] sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <Star className="mb-2 h-5 w-5 fill-[#f7c948] text-[#f7c948]" />
                    Celebration-ready treats
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <Scissors className="mb-2 h-5 w-5 text-[#8a2746]" />
                    Custom outfits
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <MapPin className="mb-2 h-5 w-5 text-[#2f6f6a]" />
                    Serving Freetown
                  </div>
                </div>
              </div>

              <ProductScene />
            </div>
          </section>

          <ShirleyGallerySection items={galleryItems} />

          <section id="services" className="border-y border-[#8a2746]/10 bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8a2746]">What Shirley makes</p>
                <h2 className="mt-3 text-3xl font-black text-[#2f1f2a] sm:text-4xl">
                  One brand for the outfit, the treats, and the little details.
                </h2>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {services.map((service) => {
                  const Icon = service.icon
                  return (
                    <article key={service.title} className="rounded-3xl border border-[#8a2746]/10 bg-[#fffdf8] p-6 shadow-sm">
                      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${service.color}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-black text-[#2f1f2a]">{service.title}</h3>
                      <p className="mt-3 leading-7 text-[#6d4c57]">{service.text}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          <section id="treats" className="bg-[#fffdf8] py-16">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f6f6a]">Bakery and pastries</p>
                <h2 className="mt-3 text-3xl font-black text-[#2f1f2a]">Fresh sweetness for small orders and special days.</h2>
                <p className="mt-4 leading-8 text-[#6d4c57]">
                  From soft pastries to party trays, Shirley prepares treats that feel personal, presentable, and easy to share.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Cupcakes and cookies', 'Doughnuts and pastries', 'Meat pies and small chops', 'Special treat boxes'].map((item) => (
                  <div key={item} className="rounded-2xl border border-[#f7c948]/40 bg-white p-5">
                    <Utensils className="mb-3 h-5 w-5 text-[#8a2746]" />
                    <p className="font-black text-[#2f1f2a]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="beverages" className="border-t border-[#8a2746]/10 bg-[#f8edf2]/50 py-16">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1a6f5a]">Fresh Juices & Drinks</p>
                <h2 className="mt-3 text-3xl font-black text-[#2f1f2a]">Cold beverages to complement your treats & events.</h2>
                <p className="mt-4 leading-8 text-[#6d4c57]">
                  From natural homemade fruit juices to chilled soft drinks, Shirley provides refreshing drinks for parties, office orders, and personal enjoyments.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Fresh fruit juices', 'Bottled soft drinks', 'Chilled event drink buckets', 'Custom juice & snack packages'].map((item) => (
                  <div key={item} className="rounded-2xl border border-[#1a6f5a]/20 bg-white p-5">
                    <GlassWater className="mb-3 h-5 w-5 text-[#1a6f5a]" />
                    <p className="font-black text-[#2f1f2a]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="fashion" className="bg-[#2f6f6a] py-16 text-white">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f7c948]">Fashion and tailoring</p>
                <h2 className="mt-3 text-3xl font-black sm:text-4xl">Made-to-measure looks with a soft, feminine finish.</h2>
                <p className="mt-4 max-w-3xl leading-8 text-white/80">
                  Shirley works on everyday outfits, event pieces, women and kids styles, fabric matching, and simple alterations so customers can look ready without stress.
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-6">
                <ul className="space-y-4">
                  {['Custom dresses and skirts', 'Matching family or kids outfits', 'Alterations and fitting adjustments', 'Event styling ideas with pastry bundles'].map((item) => (
                    <li key={item} className="flex gap-3">
                      <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#f7c948]" />
                      <span className="font-bold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="bundles" className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8a2746]">Signature bundle ideas</p>
                <h2 className="mt-3 text-3xl font-black text-[#2f1f2a]">The memorable part is how everything matches.</h2>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {bundles.map((bundle) => (
                  <div key={bundle} className="rounded-3xl border border-[#8a2746]/10 bg-[#fffdf8] p-5">
                    <Sparkles className="mb-4 h-6 w-6 text-[#f7c948]" />
                    <p className="text-sm font-black leading-6 text-[#2f1f2a]">{bundle}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#f8edf2] py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8a2746]">Search-friendly services</p>
                  <h2 className="mt-3 text-3xl font-black text-[#2f1f2a]">Built to be found by Freetown customers.</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#4d3039] shadow-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="order" className="bg-[#8a2746] py-16 text-white">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f7c948]">Ready to order?</p>
                <h2 className="mt-3 text-3xl font-black sm:text-4xl">Send the date, quantity, style idea, and your budget.</h2>
                <p className="mt-4 max-w-2xl leading-8 text-white/80">
                  Shirley can guide you on what is possible for your timeline, whether you need pastries, an outfit, or both.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f7c948] px-6 py-3 font-black text-[#2f1f2a] transition hover:bg-white"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp order
                </a>
                <a
                  href={`tel:+${whatsappNumber}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-6 py-3 font-black text-white transition hover:bg-white hover:text-[#8a2746]"
                >
                  <Phone className="h-5 w-5" />
                  Call now
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-[#2f1f2a] px-4 py-8 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/shirleys-stiches-sweet-logo.svg"
                alt={`${brandName} logo`}
                width={150}
                height={52}
                className="h-12 w-auto rounded-xl bg-white p-1"
              />
              <div>
                <p className="font-black">{brandName}</p>
                <p className="text-sm text-white/65">Bakery, pastries and fashion in Freetown.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <SocialLinks tone="dark" />
              <p className="text-sm text-white/65">
                Hosted on itservicesfreetown.com as a family brand page.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
