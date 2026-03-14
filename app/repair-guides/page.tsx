import type { Metadata } from 'next';
import Link from 'next/link';
import PageBanner from '@/components/PageBanner';

export const metadata: Metadata = {
  title: 'Device Repair Guides | IT Services Freetown',
  description:
    'Practical repair and maintenance guides for phones, laptops, and computers in Sierra Leone. Learn symptoms, quick checks, prevention, and when to seek professional repair.',
  keywords: [
    'device repair guides',
    'phone repair tips Freetown',
    'laptop troubleshooting Sierra Leone',
    'computer maintenance guide',
    'battery health tips',
    'screen repair advice',
  ],
};

const guides = [
  {
    title: 'Phone Not Charging: Step-by-Step Diagnosis',
    slug: 'phone-not-charging-diagnosis',
    summary:
      'Identify whether the issue is cable, adapter, charging port, battery, or motherboard with a safe check sequence.',
    readTime: '8 min read',
    sections: [
      'Start with known-good cable and adapter',
      'Inspect and clean charging port safely',
      'Check battery health and heat behavior',
      'Know when board-level repair is required',
    ],
  },
  {
    title: 'Laptop Running Slow: Practical Performance Recovery',
    slug: 'laptop-running-slow-recovery',
    summary:
      'Fix common slowdown causes including startup bloat, failing storage, thermal throttling, and malware.',
    readTime: '10 min read',
    sections: [
      'Measure startup and background load',
      'Disk health checks and SSD upgrade signs',
      'Safe cleanup and thermal maintenance basics',
      'When RAM upgrade gives real benefit',
    ],
  },
  {
    title: 'Cracked Screen: Repair vs Replace Decision Guide',
    slug: 'cracked-screen-repair-replace',
    summary:
      'Understand cost factors, device age, part quality, and data risk before deciding on screen replacement.',
    readTime: '7 min read',
    sections: [
      'Classify damage type and urgency',
      'Compare replacement quality tiers',
      'Estimate total value after repair',
      'Protect data before service intake',
    ],
  },
  {
    title: 'Water Damage Response: First 60 Minutes Checklist',
    slug: 'water-damage-first-60-minutes',
    summary:
      'Immediate actions that reduce corrosion and data loss risk for phones and laptops exposed to liquid.',
    readTime: '9 min read',
    sections: [
      'Power-off rules that prevent short circuits',
      'What to avoid (heat, rice myths, charging)',
      'Time window for best recovery outcomes',
      'Professional cleaning and board inspection',
    ],
  },
  {
    title: 'Battery Health and Safe Charging Habits',
    slug: 'battery-health-safe-charging',
    summary:
      'Improve device battery lifespan with daily charging habits, heat control, and charger compatibility checks.',
    readTime: '6 min read',
    sections: [
      'Best charge range for lithium batteries',
      'Heat management in local weather',
      'How to choose safe chargers and cables',
      'Battery replacement warning signs',
    ],
  },
  {
    title: 'Data Backup Before Repair: Customer Checklist',
    slug: 'backup-before-repair-checklist',
    summary:
      'Prepare your device for service with backup, account security, and privacy steps that prevent avoidable loss.',
    readTime: '7 min read',
    sections: [
      'Cloud and local backup options',
      'Account logout and security preparation',
      'Essential info to share with technician',
      'Post-repair restore and verification',
    ],
  },
];

export default function RepairGuidesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PageBanner
        title="Repair Guides"
        subtitle="Actionable guides to help you diagnose issues, protect your data, and make better repair decisions."
        icon="fas fa-book-medical"
      />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How These Guides Help</h2>
          <p className="text-gray-700 leading-7 mb-4">
            These guides are written for real device owners in Sierra Leone. Each guide explains what symptoms usually
            mean, what checks you can do safely at home, and when professional repair is the best choice.
          </p>
          <p className="text-gray-700 leading-7 mb-4">
            We focus on practical decisions: cost versus value, data safety, part quality, and turnaround time. That
            means you can avoid unnecessary expenses and reduce the risk of bigger failures.
          </p>
          <p className="text-gray-700 leading-7">
            If your issue is urgent, book an appointment and mention the guide topic you read. Our team will use that
            context during diagnosis to speed up service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <article key={guide.slug} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#040e40] bg-blue-50 px-3 py-1 rounded-full">
                  Practical Guide
                </span>
                <span className="text-sm text-gray-500">{guide.readTime}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{guide.title}</h3>
              <p className="text-gray-700 mb-4">{guide.summary}</p>
              <ul className="space-y-2 mb-5">
                {guide.sections.map((item) => (
                  <li key={item} className="text-sm text-gray-700 flex items-start gap-2">
                    <i className="fas fa-check-circle mt-1 text-green-600"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)' }}
                >
                  Book Inspection
                  <i className="fas fa-arrow-right"></i>
                </Link>
                <Link href="/contact" className="text-sm font-semibold text-[#040e40] hover:underline">
                  Ask a Technician
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 bg-[#040e40] text-white rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-3">Need a Fast Answer?</h2>
          <p className="text-blue-100 mb-5 leading-7">
            For urgent phone or laptop issues, contact IT Services Freetown directly. We provide diagnostics, honest
            repair recommendations, and clear warranty terms.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/book-appointment" className="px-5 py-3 rounded-lg font-semibold bg-white text-[#040e40] hover:bg-gray-100 transition-colors">
              Book Appointment
            </Link>
            <Link href="/troubleshoot" className="px-5 py-3 rounded-lg font-semibold border border-white/40 hover:bg-white/10 transition-colors">
              Use Troubleshooter
            </Link>
            <Link href="/blog" className="px-5 py-3 rounded-lg font-semibold border border-white/40 hover:bg-white/10 transition-colors">
              Read Blog Articles
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
