import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, MapPin, MessageCircle, Phone, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react'
import { seoServices } from '@/data/seo-services'
import { DisplayAd, MultiplexAd } from '@/components/AdSense'
import Image from 'next/image'

export const dynamicParams = false

export async function generateStaticParams() {
  return seoServices.map((service) => ({
    slug: service.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = seoServices.find((s) => s.slug === params.slug)
  if (!service) return {}

  const url = `https://www.itservicesfreetown.com/repairs/${service.slug}`

  return {
    title: service.title,
    description: service.metaDescription,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: service.title,
      description: service.metaDescription,
      url,
      siteName: 'IT Services Freetown',
      locale: 'en_SL',
      type: 'website'
    }
  }
}

export default function RepairServicePage({ params }: { params: { slug: string } }) {
  const service = seoServices.find((s) => s.slug === params.slug)

  if (!service) {
    notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.problem,
    provider: {
      '@type': 'LocalBusiness',
      name: 'IT Services Freetown',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'No. 1 Regent Highway, Jui Junction',
        addressLocality: 'Freetown',
        addressCountry: 'SL'
      }
    },
    areaServed: 'Freetown, Sierra Leone',
    description: service.metaDescription,
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        description: service.estimatedPriceRange
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Hero Section */}
      <section className="bg-[#040e40] text-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {service.heroTitle}
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            {service.heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Link href="/book-appointment">
              <span className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">
                Book Appointment
              </span>
            </Link>
            <Link href="https://wa.me/23233399391">
              <span className="inline-flex items-center border border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-all duration-300">
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp Us
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing and Details */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-red-600" />
              Estimated Repair Time
            </h3>
            <p className="text-3xl font-bold text-slate-800">{service.estimatedTime}</p>
            <p className="text-sm text-slate-500 mt-2">Times may vary based on part availability in Freetown.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-red-600" />
              Estimated Price Range
            </h3>
            <p className="text-3xl font-bold text-slate-800">{service.estimatedPriceRange}</p>
            <p className="text-sm text-slate-500 mt-2">Final price confirmed after free diagnostic.</p>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <DisplayAd />
      </div>

      {/* Real Advice Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Expert Advice for Freetown</h2>
          <div className="space-y-4">
            {service.realAdvice.map((advice, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-slate-700 pt-1 leading-relaxed">{advice}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex justify-center items-center gap-2">
              <HelpCircle className="h-8 w-8 text-red-600" />
              Frequently Asked Questions
            </h2>
          </div>
          <div className="w-full space-y-4">
            {service.faqs.map((faq, i) => (
              <details key={i} className="group border-b border-slate-200 pb-4">
                <summary className="flex items-center justify-between font-medium cursor-pointer text-slate-900 list-none">
                  {faq.question}
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-slate-600 mt-3 leading-relaxed group-open:animate-fadeIn">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Ad */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MultiplexAd />
      </div>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-[#040e40] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to get your {service.deviceType} fixed?</h2>
          <p className="text-slate-300 text-lg">Visit us at Jui Junction or book an appointment online.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/book-appointment">
              <span className="inline-flex items-center bg-white text-[#040e40] hover:bg-slate-100 font-bold py-3 px-8 rounded-full transition-all duration-300">
                Book Now <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
