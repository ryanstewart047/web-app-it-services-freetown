'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Briefcase, CalendarDays, Package, Search, Wrench } from 'lucide-react'
import { seoServices } from '@/data/seo-services'
import { TRADE_CATEGORIES, getCategoryDetails } from '@/lib/on-demand-categories'

type SearchItem = {
  title: string
  description: string
  href: string
  type: 'Service' | 'Guide' | 'Tool' | 'Page' | 'Product' | 'Article' | 'Career'
  keywords?: string
}

const TRADE_CATEGORY_SYNONYMS: Record<string, string> = {
  'printer-tech': 'printer printers copier copiers printing printhead toner cartridge ink paper jam ciss laserjet pixma ecotank ricoh brother kyocera error code scan scanner',
  'pc-laptop': 'computer computers laptop laptops macbook pc desktop mac os windows screen hinge keyboard ssd ram virus motherboard format os install power ic blue screen hard drive',
  'phone-tablet': 'phone phones smartphone smartphones tablet tablets mobile iphone samsung screen battery charging port tecno infinix oled display icloud unlock frp water damage glass',
  'gaming-console': 'console consoles gaming game playstation ps4 ps5 xbox nintendo switch hdmi overheating controller pad repair thermal paste power fault disk drive',
  'cctv-security': 'cctv camera cameras security surveillance dvr nvr hikvision dahua ip camera remote monitoring mobile viewing night vision security system installation',
  'networking-wifi': 'network networking wifi wi-fi wi fi router internet office lan cable ethernet patch panel ubiquiti mikrotik switch access point fiber optic speed connection wireless',
  'solar-inverter': 'solar inverter inverters battery batteries lithium tubular panel panels clean energy hybrid power backup edsa blackout charger controller installation sizing',
  'audio-visual': 'audio visual tv television wall mount mounting home theater projector sound system speakers conference smart tv display hdmi audio setup',
  'satellite-dstv': 'satellite dstv canal plus free to air dish alignment lnb signal decoder multiroom remote television cabling dish installation',
  'electrician': 'electrician electricians electrical electricity wiring rewire domestic commercial breaker panel short circuit edsa changeover single phase 3 phase lighting switch socket fuse fault',
  'plumber': 'plumber plumbers plumbing pipe pipes pipe fitting water pump leak leaking water tank overhead geepee tank bathroom toilet shower drainage clog drain fitting pvc ppr hot weld',
  'ac-refrigeration': 'ac air conditioner air conditioning conditioner repair fridge refrigerator refrigeration cooling gas refill r410a r32 r22 compressor split ac deep clean coil cold freezer',
  'generator-mechanic': 'generator generators mechanic mechanics perkins lister diesel petrol avr alternator injector oil filter servicing elepaq kipor starter coil rewinding power machine engine',
  'auto-electrician': 'auto electrician car automobile vehicle automotive diagnostics scanner obd2 ecu alternator starter motor wiring toyota honda mercedes benz hyundai kia car ac sensor battery',
  'appliance-repair': 'appliance appliances microwave washing machine dryer cooker electric oven water dispenser blender kettle iron toaster heating element kitchen home repair',
  'water-pump-borehole': 'water pump borehole well submersible pump deep well pressure tank booster pump float switch control box borehole drilling water supply geepee',
  'welder-metal': 'welder welders welding weld metal steel iron fabrication burglar bars security gate gates railings staircase roof truss arc mig inverter',
  'carpenter': 'carpenter carpenters carpentry wood woodwork woodworking furniture kitchen cabinet cabinets door hanging lock locks mortise roof timber ceiling desk wardrobe',
  'mason-builder': 'mason masons masonry tiler tilers tiling tile tiles floor wall plastering screeding bricklayer bricklaying concrete building renovation repair foundation',
  'painter': 'painter painters painting paint damp waterproofing weatherproofing wall painting interior exterior skim coat screed gloss emulsion putty spray roller decoration',
}

const onDemandServiceItems: SearchItem[] = TRADE_CATEGORIES.map(cat => {
  const details = getCategoryDetails(cat)
  const synonyms = TRADE_CATEGORY_SYNONYMS[cat.id] || ''
  const whatWeFix = (details.whatWeFix || []).join(' ')
  const brands = (details.supportedBrands || []).join(' ')
  return {
    title: `${cat.title} (On-Demand Pro)`,
    description: `${cat.subtitle}. ${details.overview || ''} Rapid on-site dispatch across Freetown with 14-day warranty.`,
    href: `/on-demand?service=${cat.id}`,
    type: 'Service' as const,
    keywords: `services service on-demand on demand pro pros artisan artisans technician technicians trades handyman freetown hire booking ${cat.type} ${cat.badge} ${synonyms} ${whatWeFix} ${brands} fix repair /on-demand /services`,
  }
})

const careerJobItems: SearchItem[] = TRADE_CATEGORIES.map(cat => {
  const synonyms = TRADE_CATEGORY_SYNONYMS[cat.id] || ''
  return {
    title: `Job Opening: ${cat.title} (Apply Now)`,
    description: `Join BridgeTech Pro Network as a ${cat.title}. Keep 85% take-home pay with weekly mobile money payouts across Freetown. Immediate openings.`,
    href: `/careers/apply?job=${cat.id}`,
    type: 'Career' as const,
    keywords: `careers career jobs job apply /apply application hiring recruitment vacancy vacancies employment work technician artisan freetown ${cat.type} ${cat.badge} ${cat.title} ${synonyms} 85% keep rate payout national id /careers /apply`,
  }
})

const siteItems: SearchItem[] = [
  // ── Services & On-Demand Core Pages ──
  {
    title: 'On-Demand Services & Verified Artisan Pros',
    description: 'Book verified local electricians, plumbers, AC technicians, generator mechanics, carpenters, painters, and 20+ trade pros in Freetown with 14-day warranty.',
    href: '/on-demand',
    type: 'Service',
    keywords: 'services on-demand on demand pro pros artisan artisans technician technicians trades handyman freetown hire booking local certified emergency home office repair work /services /on-demand',
  },
  {
    title: 'Join as a Service Pro (Artisan Registration)',
    description: 'Register your trade business or craftsmanship with BridgeTech On-Demand. Get customer dispatch across Freetown and keep 85% with weekly mobile money payouts.',
    href: '/on-demand?tab=artisan',
    type: 'Service',
    keywords: 'artisan registration register join pro provider technician account signup earn money mobile money freetown on-demand trade apply partner',
  },

  // ── Careers & Apply Core Pages ──
  {
    title: 'Careers & Technician Opportunities',
    description: 'Join the BridgeTech Pro Network in Freetown. 20 trade & technical positions open with 85% take-home pay, weekly mobile money payouts, and verified client jobs.',
    href: '/careers',
    type: 'Career',
    keywords: 'careers career jobs job hiring recruitment employment openings vacancies work freetown 85% weekly payouts pro network positions apply /careers',
  },
  {
    title: 'Job Application Portal (/apply)',
    description: 'Submit your job application online to join BridgeTech as a technician or certified artisan in Freetown. Fast onboarding with National ID / NIN.',
    href: '/careers/apply',
    type: 'Career',
    keywords: 'apply /apply application apply online job application submit application candidate form registration careers jobs hiring technician artisan freetown Western Area',
  },
  {
    title: 'Technician Recruitment Flyer & Requirements',
    description: 'Official BridgeTech recruitment flyer and hiring requirements for all 20 technician trade positions in Freetown. Review vetting criteria and payout details.',
    href: '/careers/flyer',
    type: 'Guide',
    keywords: 'recruitment flyer requirements qualifications vetting criteria careers jobs hiring pay freetown western area /careers/flyer flyer',
  },

  // ── General Site Pages ──
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
  const searchable = normalize(`${item.title} ${item.description} ${item.href} ${item.keywords || ''}`)
  const terms = normalize(query).split(' ').filter(Boolean)
  return terms.every((term) => searchable.includes(term))
}

function scoreItem(item: SearchItem, query: string): number {
  const q = normalize(query)
  if (!q) return 0
  const titleNorm = normalize(item.title)
  const hrefNorm = normalize(item.href)
  const descNorm = normalize(item.description)
  const kwNorm = normalize(item.keywords || '')

  let score = 0

  // Exact title match
  if (titleNorm === q) score += 120
  else if (titleNorm.startsWith(q)) score += 80
  else if (titleNorm.includes(q)) score += 50

  // Href match (e.g. searching "apply", "/apply", "careers", "/careers", "on-demand")
  if (hrefNorm === q || hrefNorm.endsWith(`/${q}`) || hrefNorm.includes(`/${q}`)) score += 70
  else if (hrefNorm.includes(q)) score += 40

  // Term matches
  const qTerms = q.split(' ').filter(Boolean)
  for (const term of qTerms) {
    if (titleNorm.includes(term)) score += 25
    if (kwNorm.includes(term)) score += 15
    if (descNorm.includes(term)) score += 5
  }

  // Priority boost for primary hub pages if relevant
  if (
    (q.includes('career') || q.includes('job') || q.includes('hiring')) &&
    item.href === '/careers'
  ) {
    score += 50
  }
  if (
    (q.includes('apply') || q.includes('application') || q === 'apply') &&
    item.href === '/careers/apply'
  ) {
    score += 70
  }
  if (
    (q.includes('service') || q.includes('demand') || q.includes('pro') || q.includes('artisan')) &&
    item.href === '/on-demand'
  ) {
    score += 50
  }

  return score
}

const typeStyle: Record<SearchItem['type'], string> = {
  Service: 'bg-red-100 text-red-700',
  Career: 'bg-purple-100 text-purple-700',
  Guide: 'bg-blue-100 text-blue-700',
  Tool: 'bg-violet-100 text-violet-700',
  Page: 'bg-slate-100 text-slate-700',
  Product: 'bg-emerald-100 text-emerald-700',
  Article: 'bg-amber-100 text-amber-700',
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
    const items = [
      ...siteItems,
      ...onDemandServiceItems,
      ...careerJobItems,
      ...guideItems,
      ...seoServices.map((service) => ({
        title: service.title,
        description: service.metaDescription,
        href: `/repairs/${service.slug}`,
        type: 'Service' as const,
        keywords: `${service.brand || ''} ${service.deviceType} ${service.problem} ${service.realAdvice.join(' ')}`,
      })),
      ...dynamicItems,
    ]
    if (!query.trim()) return items.slice(0, 16)

    return items
      .filter((item) => matches(item, query))
      .sort((a, b) => scoreItem(b, query) - scoreItem(a, query))
      .slice(0, 48)
  }, [dynamicItems, query])

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-[#040e40] px-4 py-14 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">BridgeTech site search</p>
          <h1 className="text-4xl font-black sm:text-5xl">Find what you need.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100">Search on-demand services, technician jobs, careers, repair guides, tools, and shop products.</p>
          <form className="relative mx-auto mt-8 max-w-3xl" onSubmit={(event) => event.preventDefault()}>
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “electrician”, “careers”, “/apply”, “plumber”, “laptop screen”, or “generator”..." className="w-full rounded-2xl border-0 bg-white py-5 pl-14 pr-5 text-base text-slate-900 shadow-xl outline-none ring-4 ring-white/10 transition focus:ring-cyan-300" />
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{query.trim() ? `Results for “${query.trim()}”` : 'Explore BridgeTech'}</h2>
            <p className="mt-1 text-sm text-slate-500">{loading ? 'Loading products and articles…' : `${results.length} result${results.length === 1 ? '' : 's'} found`}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/careers/apply" className="hidden items-center gap-1.5 rounded-lg bg-purple-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-800 sm:inline-flex">
              <Briefcase className="h-3.5 w-3.5" />
              Apply for Job
            </Link>
            <Link href="/book-appointment" className="hidden items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-700 sm:inline-flex">
              <CalendarDays className="h-3.5 w-3.5" />
              Book repair
            </Link>
          </div>
        </div>
        {results.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((item) => (
              <Link key={`${item.type}-${item.href}-${item.title}`} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-[#040e40]">
                    {item.type === 'Product' ? (
                      <Package className="h-5 w-5" />
                    ) : item.type === 'Career' ? (
                      <Briefcase className="h-5 w-5 text-purple-700" />
                    ) : (
                      <Wrench className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${typeStyle[item.type]}`}>{item.type}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-red-600" />
                    </div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">No matching results yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">Try a simpler term, such as “electrician”, “plumber”, “careers”, “/apply”, “screen”, “generator”, or “AnyDesk”.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/on-demand" className="inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700">Explore Services</Link>
              <Link href="/careers/apply" className="inline-flex rounded-lg bg-purple-700 px-4 py-2 text-sm font-bold text-white hover:bg-purple-800">Job Application</Link>
              <Link href="/contact" className="inline-flex rounded-lg bg-[#040e40] px-4 py-2 text-sm font-bold text-white">Ask a technician</Link>
            </div>
          </div>
        )}
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
