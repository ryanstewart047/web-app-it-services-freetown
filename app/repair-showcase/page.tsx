import { Metadata } from 'next'
import { beforeAfterCases } from '@/data/before-after-cases'
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider'
import { DisplayAd } from '@/components/AdSense'
import Link from 'next/link'


export const metadata: Metadata = {
  title: 'Repair Showcase | Before & After Fixes - IT Services Freetown',
  description: 'See our real repair successes. From smashed screens to dead motherboards, check out our before and after gallery of device repairs in Freetown.',
}

export default function RepairShowcasePage() {
  return (
    <>
      <section className="bg-[#040e40] text-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            Repair Showcase
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Don't just take our word for it. Slide to see how we bring dead and damaged devices back to life in Freetown.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <DisplayAd />
      </div>

      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-16">
          {beforeAfterCases.map((caseStudy) => (
            <div key={caseStudy.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{caseStudy.title}</h2>
                    <p className="text-red-600 font-medium mt-1">{caseStudy.device} - {caseStudy.issue}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {caseStudy.cost && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        Cost: {caseStudy.cost}
                      </span>
                    )}
                    {caseStudy.turnaround && (
                      <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                        Time: {caseStudy.turnaround}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  {caseStudy.description}
                </p>
              </div>
              <div className="p-4 md:p-8 bg-slate-50">
                <BeforeAfterSlider 
                  beforeImage={caseStudy.beforeImage} 
                  afterImage={caseStudy.afterImage} 
                  alt={caseStudy.title}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Have a device that looks like the "Before" pictures?</h2>
          <p className="text-slate-600 text-lg">Let us turn it into an "After" masterpiece.</p>
          <div className="pt-4">
            <Link href="/book-appointment">
              <span className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">
                Book a Repair Now
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
