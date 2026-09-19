import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Phone, 
  ShieldAlert, 
  CheckCircle2, 
  ZapOff, 
  Heart, 
  Home, 
  Share2, 
  LifeBuoy, 
  ArrowLeft,
  Users,
  Compass
} from 'lucide-react';
import ShareGuideButton from './ShareGuideButton';

export const metadata: Metadata = {
  title: 'Freetown Emergency Flood & Heavy Rain Safety Guide | BridgeTech IT Services',
  description: 'Step-by-step life safety, home protection, tech equipment preservation, and emergency contacts (Dial 117) during severe rainfall across Freetown, Sierra Leone.',
  openGraph: {
    title: '🚨 Freetown Emergency Flood & Heavy Rain Safety Guide',
    description: 'Step-by-step community safety guide for heavy rainfall in Freetown. Emergency hotline 117, life safety steps, and electronics protection.',
    type: 'website',
  },
};

const EMERGENCY_CONTACTS = [
  {
    name: 'National Disaster Management Agency (NDMA)',
    number: '117',
    label: 'Toll-Free (All Networks: Africell, Orange, QCell)',
    color: 'bg-red-600 hover:bg-red-700 text-white',
    border: 'border-red-500',
    primary: true,
  },
  {
    name: 'Sierra Leone Police Emergency',
    number: '112 / 999',
    tel: '112',
    label: 'Emergency Police Dispatch',
    color: 'bg-slate-800 hover:bg-slate-700 text-white',
    border: 'border-slate-700',
  },
  {
    name: 'National Fire Force (Freetown HQ)',
    number: '076 611 999',
    tel: '+23276611999',
    label: 'Fire & Water Rescue Command',
    color: 'bg-slate-800 hover:bg-slate-700 text-white',
    border: 'border-slate-700',
  },
  {
    name: 'BridgeTech IT Services Helpline',
    number: '+232 33 399391',
    tel: '+23233399391',
    label: 'Emergency Community Support & Tech Advice',
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
    border: 'border-blue-500',
  },
];

const SAFETY_STEPS = [
  {
    step: '1',
    title: 'Life Safety & Immediate Evacuation to Higher Ground',
    icon: Compass,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    guidelines: [
      'Do not wait until rising waters surround your premises. If water begins accumulating or entering your compound, move immediately to higher ground.',
      'Residents in low-lying flood basins (Kroo Bay, Susan’s Bay, Culvert, Dwarzark, Congo Market, Lumley, Juba, Regent) must monitor nearby streams and drainage channels constantly.',
      'Residents living near steep slopes or loose hillsides prone to mudslides and rockfalls must evacuate early to designated community centers or relatives on stable, flat ground.',
      'Never sleep on the ground floor in flood-prone structures during overnight torrential downpours.',
    ],
  },
  {
    step: '2',
    title: 'Critical Moving Water & Drainage Hazards',
    icon: LifeBuoy,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    guidelines: [
      'NEVER attempt to walk, wade, or swim through moving floodwater. Just 15 cm (6 inches) of swift current can sweep an adult off their feet.',
      'NEVER drive a car, taxi, or motorcycle (keke / okada) into flooded roads. As little as 30 cm (12 inches) of water can carry a vehicle away into deep gutters.',
      'Stay far away from open drainage canals, gutters, and low bridges. Fast-moving rainwater creates violent underground suction, and concrete slab covers can dislodge without warning.',
      'Assume all floodwater is contaminated and could carry sharp debris, submerged broken glass, or exposed fallen electrical cables.',
    ],
  },
  {
    step: '3',
    title: 'Caring for Children, the Elderly & Vulnerable Neighbors',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    guidelines: [
      'Keep children strictly indoors and away from open windows, balconies, gutters, and fast-flowing rainwater streams.',
      'Check on elderly relatives, nursing mothers, pregnant women, and neighbors with mobility challenges who may need assistance moving to safer ground before escape paths are blocked.',
      'Prepare an emergency grab-bag with essential medicines, identity cards, flashlights, non-perishable food, and drinking water.',
    ],
  },
  {
    step: '4',
    title: 'Electrical Power & Household Safety',
    icon: ZapOff,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    guidelines: [
      'If water begins entering your home or office, turn off your MAIN electrical breaker switch immediately to eliminate the danger of lethal electrocution.',
      'Never touch electrical switches, circuit breakers, or appliance cords with wet hands or while standing in damp areas or standing water.',
      'Turn off gas cylinder regulators and place gas bottles in an upright, elevated position away from water.',
      'If you see downed power lines or spark-emitting utility poles, stay at least 15 meters away and report immediately to 117 or EDSA.',
    ],
  },
  {
    step: '5',
    title: 'Protecting Computers, Laptops, Phones & Appliances',
    icon: ShieldAlert,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    guidelines: [
      'UNPLUG IMMEDIATELY: Disconnect laptops, desktop computers, TVs, Wi-Fi routers, and extension multi-plugs from wall sockets. Lightning strikes and storm surges can destroy motherboards and power supplies in seconds.',
      'ELEVATE VALUABLES: Move laptops, desktop CPUs, external backup drives, and important personal documents off the floor onto high tables or upper shelves.',
      'NEVER TURN ON WET ELECTRONICS: If a phone, laptop, or charger comes into contact with water, DO NOT power it on and DO NOT plug it into a charger. Supplying power to wet internal circuits causes instant, permanent short-circuits. Keep it powered off, remove the battery if detachable, and let it dry thoroughly.',
      'Back up important phone and computer documents to cloud storage (Google Drive, iCloud, OneDrive) while network connectivity is active.',
    ],
  },
  {
    step: '6',
    title: 'What to Do After the Floodwaters Recede',
    icon: CheckCircle2,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    guidelines: [
      'Do not drink tap or well water until it has been boiled or treated with chlorine, as floodwaters frequently contaminate shallow water wells with sewage and bacteria.',
      'Have a certified electrician inspect your building before restoring main electrical power if the premises were flooded.',
      'Disinfect all floors, walls, and surfaces that came into contact with floodwater to protect your family from waterborne illnesses like cholera and dysentery.',
    ],
  },
];

export default function FloodSafetyGuidePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white pb-24">
      
      {/* Top Advisory Bar */}
      <div className="bg-red-600 px-4 py-2.5 text-center text-xs sm:text-sm font-bold text-white shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 animate-pulse shrink-0" />
          <span>URGENT COMMUNITY ADVISORY: Persistent Heavy Rain Across Freetown — Dial 117 for Emergency Rescue</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to BridgeTech IT Services Home
          </Link>
        </div>

        {/* Hero Section */}
        <header className="mb-10 text-center sm:text-left border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            Freetown Community Safety Protocol
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
            Freetown Emergency Flood &amp; Heavy Rain Safety Guide
          </h1>
          
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            Due to hours of persistent heavy rainfall across Freetown, flood and mudslide risks are elevated. 
            This step-by-step guide is provided by <strong>BridgeTech IT Services</strong> to help every family and business protect what matters most: human life and safety.
          </p>
        </header>

        {/* Emergency Hotline 117 Highlight Banner */}
        <div className="mb-12 rounded-3xl border-2 border-red-500 bg-gradient-to-br from-red-950 via-slate-900 to-red-950/80 p-6 sm:p-8 shadow-2xl shadow-red-950/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-400">
                National Emergency Toll-Free Hotline
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                DIAL <span className="text-red-500 underline underline-offset-4">117</span>
              </h2>
              <p className="text-sm text-slate-300 max-w-lg">
                <strong>Free call from all networks</strong> (Africell, Orange, QCell) 24 hours a day to report trapped persons, rising floodwaters, structural collapses, or mudslides to the National Disaster Management Agency (NDMA).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
              <a
                href="tel:117"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black px-8 py-4 text-base shadow-xl shadow-red-900/60 transition hover:scale-105 text-center"
              >
                <Phone className="h-5 w-5" />
                Call 117 Now (Free)
              </a>

              <ShareGuideButton />
            </div>
          </div>
        </div>

        {/* Emergency Contacts Directory */}
        <section className="mb-12">
          <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Phone className="h-4 w-4 text-red-400" />
            Official Emergency Contacts in Sierra Leone
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EMERGENCY_CONTACTS.map((contact, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl border ${contact.border} bg-slate-900/80 p-5 flex items-center justify-between gap-4`}
              >
                <div>
                  <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{contact.label}</p>
                  <p className="text-lg font-black text-emerald-400 mt-2 font-mono tracking-wide">{contact.number}</p>
                </div>
                <a
                  href={`tel:${contact.tel || contact.number.replace(/[^0-9]/g, '')}`}
                  className={`p-3 rounded-xl ${contact.color} shrink-0 transition hover:scale-105 shadow-md`}
                  title={`Call ${contact.name}`}
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Safety Guidelines */}
        <section className="mb-12 space-y-6">
          <div className="border-b border-slate-800 pb-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Step-by-Step Life &amp; Property Safety Guide
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Follow these six essential rules to navigate severe weather safely.
            </p>
          </div>

          {SAFETY_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <article 
                key={item.step}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 shadow-sm transition hover:border-slate-700"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.bg} border ${item.border} ${item.color} font-black text-lg`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {item.title}
                      </h3>
                    </div>
                    <ul className="mt-4 space-y-2.5">
                      {item.guidelines.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* A Nice Ending - Solidarity & Community Message */}
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600/20 text-red-400 border border-red-500/30 mb-2">
              <Heart className="h-7 w-7 text-red-500 fill-red-500/20" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Stay Safe, Freetown. We Are in This Together.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              To our dear customers, neighbors, and fellow residents of Freetown: Your life and the safety of your loved ones are far more precious than any machine, computer, or piece of property.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              Floods can be overwhelming, but with vigilance, care, and checking on one another, we will come through this safely. Please stay indoors, keep your children close, protect your electrical appliances, and call <strong>117</strong> immediately if you or anyone around you is in danger.
            </p>

            <div className="pt-4 border-t border-slate-800/80 mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                BridgeTech IT Services Community Care Team
              </p>
              <p className="text-xs text-slate-500 mt-1">
                #1 Regent Highway, Jui Junction | Freetown, Sierra Leone
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <ShareGuideButton />
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 text-xs font-bold transition border border-slate-700"
              >
                <Home className="h-4 w-4" />
                Return to Website
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
