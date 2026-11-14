'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Wallet, 
  Clock, 
  Check
} from 'lucide-react';
import { TRADE_CATEGORIES } from '@/lib/on-demand-categories';

interface JobPosting {
  id: string;
  title: string;
  subtitle: string;
  department: string;
  icon: string;
  badge: string;
  type: 'tech' | 'trade';
  image: string;
  payEstimate: string;
  requirements: string[];
  keyTools: string[];
  location: string;
}

export default function CareersPortalPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Load jobs from API
  useEffect(() => {
    fetch('/api/careers?type=jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      })
      .catch(err => console.error('Failed to load jobs catalog:', err))
      .finally(() => setLoadingJobs(false));
  }, []);

  // Filter jobs
  const departments = ['all', 'Digital & IT Hardware', 'Electrical & Clean Energy', 'Plumbing & Mechanical', 'Construction & Finishing'];

  const filteredJobs = jobs.filter(job => {
    const matchesDept = selectedDepartment === 'all' || job.department === selectedDepartment;
    const matchesSearch = !searchQuery.trim() || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* ── 1. PROFESSIONAL HEADER / HERO ── */}
      <section className="bg-white border-b border-gray-200 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Clean Main Title */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight leading-tight">
              Join Our Verified Technician &amp; Artisan Network
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              BridgeTech connects certified trade professionals and electronics technicians with daily residential and commercial jobs across Freetown. Receive reliable bookings, keep <strong>85% take-home pay</strong>, and get weekly mobile money payouts.
            </p>
          </div>

          {/* Clean Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="/careers/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <span>Apply Online</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* 4 Clean Value Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Keep 85% Take-Home</span>
              </div>
              <p className="text-xs text-gray-600">Standard 15% platform commission on completed call-outs.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Weekly Settlements</span>
              </div>
              <p className="text-xs text-gray-600">Direct cashout to your Orange Money or Afrimoney account.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>14-Day Warranty Backing</span>
              </div>
              <p className="text-xs text-gray-600">BridgeTech backs your craftsmanship with a standard customer warranty.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Local Freetown Jobs</span>
              </div>
              <p className="text-xs text-gray-600">Dispatched to call-outs within or near your residential zone.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. JOBS DIRECTORY SECTION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        
        {/* Navigation & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              Open Positions ({TRADE_CATEGORIES.length})
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Click &ldquo;Apply&rdquo; on any position to open the application portal in a new tab.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trade or role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDepartment === dept
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {dept === 'all' ? 'All Roles' : dept}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-200 rounded-xl space-y-2">
            <Briefcase className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-800">No matching jobs found</p>
            <p className="text-xs text-gray-500">Try adjusting your search query or department filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm"
              >
                <div>
                  {/* Job Header Image */}
                  <div className="h-40 w-full relative overflow-hidden bg-gray-100">
                    <img
                      src={job.image}
                      alt={job.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/95 text-gray-800 shadow-xs border border-gray-200">
                        {job.badge}
                      </span>
                    </div>
                  </div>

                  {/* Job Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 block">
                        {job.department}
                      </span>
                      <h3 className="text-sm font-bold text-gray-950 mt-0.5 line-clamp-1">
                        {job.title}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {job.subtitle}
                    </p>

                    <div className="pt-2 border-t border-gray-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block">
                        Key Requirements:
                      </span>
                      {job.requirements.slice(0, 2).map((req, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between gap-2 mt-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    {job.payEstimate}
                  </span>

                  <a
                    href={`/careers/apply?job=${job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors bg-gray-900 hover:bg-red-600 text-white flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

      {/* ── 3. READY TO APPLY CTA BANNER ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Ready to Join Us?</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              Submit Your Job Application Today
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
              Complete our fast online registration to verify your trade credentials, tools, and receive daily residential and commercial jobs across Freetown.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="/careers/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <span>Submit Job Application</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
