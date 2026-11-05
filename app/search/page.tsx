'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CalendarDays, Package, Search, Wrench } from 'lucide-react'
import { seoServices } from '@/data/seo-services'

type SearchItem = {
  title: string
  description: string
  href: string
  type: 'Service' | 'Guide' | 'Tool' | 'Page' | 'Product' | 'Article'
  keywords?: string
}

const siteItems: SearchItem[] = [
  { title: 'Book a Repair Appointment', description: 'Schedule phone, laptop, computer, network, and device repair service.', href: '/book-appointment', type: 'Page', keywords: 'booking appointment technician repair service' },
  { title: 'Marketplace', description: 'Shop computers, phones, accessories, tools, and recommended repair products.', href: '/marketplace', type: 'Page', keywords: 'shop buy accessories devices products' },
  { title: 'Repair Cost Checker', description: 'Estimate a repair price before booking an inspection.', href: '/repair-cost-checker-freetown', type: 'Tool', keywords: 'price cost estimate quote screen battery laptop' },
  { title: 'Troubleshoot Your Device', description: 'Find common fixes for phones, computers, laptops, charging, and performance issues.', href: '/troubleshoot', type: 'Tool', keywords: 'diagnose fix help problems' },
  { title: 'Repair Guides', description: 'Practical device care, data safety, charging, water damage, and repair decision guides.', href: '/repair-guides', type: 'Guide', keywords: 'phone laptop charging water battery backup guide' },
  { title: 'Remote Support', description: 'Request secure remote technical assistance and get set up with AnyDesk.', href: '/remote-support', type: 'Service', keywords: 'remote support anydesk computer help online' },
  { title: 'Track Your Repair', description: 'Check the current progress of an existing repair.', href: '/track-repair', type: 'Page', keywords: 'status tracking repair ticket' },
  { title: 'Contact BridgeTech', description: 'Call, message, or visit BridgeTech IT Services in Freetown.', href: '/contact', type: 'Page', keywords: 'phone whatsapp email address freetown jui junction' },
  { title: 'Frequently Asked Questions', description: 'Answers about repairs, warranties, diagnostics, payments, and support.', href: '/faq', type: 'Guide', keywords: 'faq answers warranty payment diagnostic' },
  { title: 'Device Repair Blog', description: 'Tips, news, and advice for keeping your devices working well.', href: '/blog', type: 'Article', keywords: 'news advice tips technology' },
  { title: 'Digital Tools', description: 'Free online tools for documents, images, audio, cards, and more.', href: '/digital-tools', type: 'Tool', keywords: 'converter image audio document 3d business card' },
  { title: 'Tech Forum', description: 'Ask questions and join technical discussions with the community.', href: '/forum', type: 'Page', keywords: 'community questions discussion help' },
  { title: 'Data Deletion Request', description: 'Request deletion of your personal data from BridgeTech services.', href: '/data-deletion', type: 'Page', keywords: 'privacy delete account data gdpr' },
]

const guideItems: SearchItem[] = [
  ['Phone Not Charging: Step-by-Step Diagnosis', 'Safely check cables, adapters, charging ports, batteries, and motherboard warning signs.', 'phone charging port cable adapter battery'],
  ['Laptop Running Slow: Practical Performance Recovery', 'Learn about startup apps, storage health, malware, overheating, and upgrade options.', 'slow laptop computer performance ssd ram malware'],
  ['Cracked Screen: Repair vs Replace Decision Guide', 'Understand screen damage, repair value, part quality, and protecting your data.', 'broken cracked screen replacement phone display'],
  ['Water Damage Response: First 60 Minutes Checklist', 'Immediate steps after a phone or laptop gets wet.', 'water liquid damage wet phone laptop rice'],
  ['Battery Health and Safe Charging Habits', 'Improve battery lifespan and recognize swelling or charging danger signs.', 'battery swollen charging health heat charger'],
  ['Data Backup Before Repair: Customer Checklist', 'Protect accounts, photos, documents, and privacy before repair.', 'backup data recovery photos files privacy'],
].map(([title, description, keywords]) => ({ title, description, href: '/repair-guides', type: 'Guide' as const, keywords }))

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function matches(item: SearchItem, query: string) {
  const searchable = normalize(`${item.title} ${item.description} ${item.keywords || ''}`)
  const terms = normalize(query).split(' ').filter(Boolean)
  return terms.every((term) => searchable.includes(term))
}

const typeStyle: Record<SearchItem['type'], string> = {
  Service: 'bg-red-100 text-red-700', Guide: 'bg-blue-100 text-blue-700', Tool: 'bg-violet-100 text-violet-700',
  Page: 'bg-slate-100 text-slate-700', Product: 'bg-emerald-100 text-emerald-700', Article: 'bg-amber-100 text-amber-700',
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [dynamicItems, setDynamicItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { setQuery(searchParams.get('q') || '') }, [searchParams])

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/products').then((response) => response.ok ? response.json() : []),
      fetch('/api/blog').then((response) => response.ok ? response.json() : []),
    ]).then(([products, posts]) => {
      if (!active) return
      const productItems = Array.isArray(products) ? products.map((product) => ({
        title: product.name,
        description: product.description || `Shop ${product.name} in the BridgeTech marketplace.`,
        href: `/marketplace/${product.slug}`,
        type: 'Product' as const,
        keywords: `${product.brand || ''} ${product.category?.name || ''} ${(product.tags || []).join(' ')}`,
      })) : []
      const articleItems = Array.isArray(posts) ? posts.map((post) => ({
        title: post.title,
        description: String(post.content || post.excerpt || '').replace(/<[^>]*>/g, ' ').slice(0, 220),
        href: `/blog/${post.id}`,
        type: 'Article' as const,
        keywords: `${post.author || ''} ${post.category || ''}`,
      })) : []
      setDynamicItems([...productItems, ...articleItems])
    }).catch(() => undefined).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const results = useMemo(() => {
    const items = [...siteItems, ...guideItems, ...seoServices.map((service) => ({
      title: service.title,
      description: service.metaDescription,
      href: `/repairs/${service.slug}`,
      type: 'Service' as const,
      keywords: `${service.brand || ''} ${service.deviceType} ${service.problem} ${service.realAdvice.join(' ')}`,
    })), ...dynamicItems]
    return query.trim() ? items.filter((item) => matches(item, query)).slice(0, 36) : items.slice(0, 12)
  }, [dynamicItems, query])

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-[#040e40] px-4 py-14 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">BridgeTech site search</p>
          <h1 className="text-4xl font-black sm:text-5xl">Find what you need.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100">Search repair services, guides, tools, shop products, and articles—all in one place.</p>
          <form className="relative mx-auto mt-8 max-w-3xl" onSubmit={(event) => event.preventDefault()}>
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “iPhone screen”, “data recovery”, or “laptop slow”" className="w-full rounded-2xl border-0 bg-white py-5 pl-14 pr-5 text-base text-slate-900 shadow-xl outline-none ring-4 ring-white/10 transition focus:ring-cyan-300" />
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{query.trim() ? `Results for “${query.trim()}”` : 'Explore BridgeTech'}</h2><p className="mt-1 text-sm text-slate-500">{loading ? 'Loading products and articles…' : `${results.length} result${results.length === 1 ? '' : 's'} found`}</p></div><Link href="/book-appointment" className="hidden items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 sm:inline-flex"><CalendarDays className="h-4 w-4" />Book repair</Link></div>
        {results.length ? <div className="grid gap-4 md:grid-cols-2">{results.map((item) => <Link key={`${item.type}-${item.href}-${item.title}`} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><div className="flex items-start gap-3"><div className="rounded-xl bg-slate-100 p-2.5 text-[#040e40]">{item.type === 'Product' ? <Package className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><div className="mb-2 flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${typeStyle[item.type]}`}>{item.type}</span><ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-red-600" /></div><h3 className="font-bold text-slate-900">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p></div></div></Link>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Search className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 text-xl font-bold text-slate-900">No matching results yet</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-600">Try a simpler term, such as “screen”, “battery”, “laptop”, “AnyDesk”, or “backup”.</p><Link href="/contact" className="mt-6 inline-flex rounded-lg bg-[#040e40] px-4 py-2 text-sm font-bold text-white">Ask a technician</Link></div>}
      </section>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50" aria-busy="true" />}>
      <SearchPageContent />
    </Suspense>
  )
}
