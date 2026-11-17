'use client'

import Link from 'next/link'

export default function Services() {
  const services = [
    {
      icon: 'fas fa-laptop',
      title: 'Computer Repair in Freetown',
      description: 'Expert laptop, desktop, and motherboard repair services for all major brands in Freetown, Sierra Leone',
      features: [
        'Motherboard micro-soldering',
        'Hardware diagnostics',
        'Virus & malware removal',
        'OS & performance upgrade'
      ],
      gradientColors: 'from-[#040e40] to-[#0a1a5c]',
      accentColor: 'blue',
      href: '/repair-showcase',
      ctaText: 'Explore Repairs'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Mobile Repair & Unlocking',
      description: 'iPhone repair, screen replacement, iCloud removal, and FRP Google bypass with warranty in Freetown',
      features: [
        'Same-day screen replacement',
        'Battery & charging port fix',
        'iCloud removal & unlock',
        'FRP & network unlocking'
      ],
      gradientColors: 'from-red-600 to-red-700',
      accentColor: 'red',
      href: '/repairs/iphone-screen-replacement-freetown',
      ctaText: 'View Phone Repairs'
    },
    {
      icon: 'fas fa-wand-magic-sparkles',
      title: '3D Card & Digital Tools',
      description: 'Design 300 DPI executive business cards, staff ID badges, erase backgrounds with AI, and convert media free',
      features: [
        '300 DPI business & ID studio',
        'AI background eraser',
        'Video & audio to MP3',
        'Word DOCX to PDF converter'
      ],
      gradientColors: 'from-amber-500 to-orange-600',
      accentColor: 'amber',
      href: '/digital-tools',
      ctaText: 'Open Free Studio'
    },
    {
      icon: 'fas fa-usb',
      title: 'USB Device Diagnostics',
      description: 'Advanced real-time browser-based USB device diagnostics and hardware detection for Android & PC',
      features: [
        'Real-time device info',
        'Support for 15+ brands',
        'Hardware telemetry scan',
        '100% private browser tool'
      ],
      gradientColors: 'from-green-600 to-green-700',
      accentColor: 'green',
      href: '/device-detection',
      ctaText: 'Run Diagnostic'
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden services-bg-pattern">
      {/* Background Design Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 opacity-70"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-animate="fade">
            Professional IT Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" data-animate="fade">
            From simple fixes to complex repairs, we provide comprehensive IT solutions 
            with cutting-edge technology and expert craftsmanship
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              data-animate="zoom"
              className="service-card bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-500 p-8 group cursor-pointer relative"
            >
              {/* Card accent decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${service.gradientColors} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
              <div className={`absolute bottom-0 left-0 w-32 h-32 -ml-8 -mb-8 rounded-full bg-gradient-to-tr ${service.gradientColors} opacity-10 group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              {/* Card Content */}
              <div className="relative z-10">
                <div className={`icon-container w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br ${service.gradientColors}`}>
                  <i className={`${service.icon} text-2xl`}></i>
                </div>
                
                <h3 className={`text-xl font-bold mb-3 group-hover:text-${service.accentColor}-600 transition-colors duration-300`}>
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <i className={`fas fa-check-circle text-${service.accentColor}-${service.accentColor === 'red' || service.accentColor === 'green' ? '500' : '600'} mr-2 group-hover:scale-110 transition-all duration-300`}></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href={service.href || "/learn-more"}
                  className="rounded-full px-5 py-2.5 bg-white shadow-md font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center group-hover:shadow-lg border-2 border-[#040e40] text-[#040e40] hover:bg-[#040e40] hover:text-white"
                >
                  {service.ctaText || 'Learn More'} <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* On-Demand Service & Pro Network Featured Callout */}
        <div className="mt-12 bg-gradient-to-r from-[#040e40] via-slate-900 to-[#040e40] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/30 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider">
                <i className="fas fa-bolt text-xs" />
                <span>New: BridgeTech On-Demand Services</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Need a Printer Tech, Console Repairer, Electrician, or Plumber?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Book background-checked, vetted professionals across Freetown. Fast emergency dispatch, fair local pricing, and backed by the <strong>BridgeTech 15% Quality Guarantee</strong>.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs text-amber-200/90 font-semibold">
                <span className="flex items-center gap-1.5"><i className="fas fa-check text-emerald-400" /> 13+ Specialized Trades</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5"><i className="fas fa-check text-emerald-400" /> Vetted Artisans</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5"><i className="fas fa-check text-emerald-400" /> 14-Day Warranty</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/on-demand"
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-950/60 transition-all text-center flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Request a Pro Now</span>
                <i className="fas fa-arrow-right text-xs" />
              </Link>
              <Link
                href="/on-demand"
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl font-bold text-sm border border-slate-700 transition-all text-center"
              >
                <span>Join as a Pro (Artisans)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Internal Discovery Strip (Boosts Page Views & Internal Linking) */}
        <div className="mt-12 p-4 sm:p-6 bg-white/90 rounded-2xl shadow-sm border border-gray-200/80 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-600">
          <span className="flex items-center gap-2 text-gray-800 font-bold">
            <i className="fas fa-compass text-red-600 text-sm"></i>
            <span>Looking for more solutions?</span>
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/digital-tools" className="hover:text-red-600 transition flex items-center gap-1">
              <span>🛠️ 13+ Free Digital Tools</span>
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/repair-cost-checker-freetown" className="hover:text-red-600 transition flex items-center gap-1">
              <span>💰 Check Repair Costs</span>
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/blog" className="hover:text-red-600 transition flex items-center gap-1">
              <span>📖 Read DIY Tech Guides</span>
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/book-appointment" className="text-red-600 hover:text-red-700 font-bold transition flex items-center gap-1">
              <span>📅 Book Free Diagnosis →</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
