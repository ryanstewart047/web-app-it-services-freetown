'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Trash2, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Download, 
  Star, 
  AlertCircle, 
  RefreshCw, 
  Printer, 
  FileText,
  UserCheck,
  ChevronRight,
  Eye,
  Wrench,
  ShieldCheck,
  Wallet,
  Camera,
  Share2
} from 'lucide-react';
import { JobApplication, CareersStats } from '@/lib/careers-storage';
import { TRADE_CATEGORIES } from '@/lib/on-demand-categories';

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<CareersStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');

  // Candidate Detail Drawer / Modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<JobApplication['status']>('pending');
  const [rating, setRating] = useState(5);
  const [interviewDate, setInterviewDate] = useState('');

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    try {
      const res = await fetch(`/api/careers?type=applications&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      showToast('Failed to load applications', 'error');
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = (app: JobApplication) => {
    setSelectedApp(app);
    setAdminNotes(app.adminNotes || '');
    setNewStatus(app.status);
    setRating(app.rating || 5);
    setInterviewDate(app.interviewDate || '');
    setDetailModalOpen(true);
  };

  const handleSaveStatusAndNotes = async () => {
    if (!selectedApp) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          id: selectedApp.id,
          status: newStatus,
          adminNotes,
          rating,
          interviewDate: interviewDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update application');
      }

      showToast(`Updated application for ${selectedApp.fullName}`);
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? data.application : a));
      if (data.stats) setStats(data.stats);
      setSelectedApp(data.application);
    } catch (err: any) {
      showToast(err.message || 'Error updating application', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvertToPro = async (app: JobApplication) => {
    if (!confirm(`Are you sure you want to onboard ${app.fullName} as an active On-Demand Pro? This will create an active pro profile and update their status to 'Hired'.`)) {
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'convert_to_pro',
          id: app.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to onboard candidate');
      }

      showToast(`Successfully onboarded ${app.fullName} as Pro #${data.pro.id}!`);
      loadData(false);
      setDetailModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error converting candidate', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteApplication = async (app: JobApplication) => {
    if (!confirm(`Permanently delete application #${app.id} (${app.fullName})? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_application',
          id: app.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete application');
      }

      showToast('Application permanently deleted');
      setApplications(prev => prev.filter(a => a.id !== app.id));
      if (data.stats) setStats(data.stats);
      if (selectedApp?.id === app.id) setDetailModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error deleting application', 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) {
      showToast('No applications to export', 'error');
      return;
    }

    const headers = [
      'Application ID',
      'Full Name',
      'Phone',
      'WhatsApp',
      'Email',
      'Job Applied',
      'Location Area',
      'Residential Address',
      'Experience',
      'Tool Ownership',
      'Transport Mode',
      'Availability',
      'Mobile Money Provider',
      'Mobile Money Number',
      'Status',
      'Rating',
      'Admin Notes',
      'Date Applied',
    ];

    const rows = applications.map(a => [
      `"${a.id}"`,
      `"${a.fullName}"`,
      `"${a.phone}"`,
      `"${a.whatsapp || ''}"`,
      `"${a.email || ''}"`,
      `"${a.jobTitle}"`,
      `"${a.locationArea}"`,
      `"${a.residentialAddress.replace(/"/g, '""')}"`,
      `"${a.yearsExperience}"`,
      `"${a.toolOwnership}"`,
      `"${a.transportMode || ''}"`,
      `"${a.availability}"`,
      `"${a.mobileMoneyProvider}"`,
      `"${a.mobileMoneyNumber}"`,
      `"${a.status}"`,
      `"${a.rating || 5}"`,
      `"${(a.adminNotes || '').replace(/"/g, '""')}"`,
      `"${new Date(a.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bridgetech_job_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List
  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchJob = jobFilter === 'all' || a.jobId === jobFilter;
      const matchSearch = !searchQuery.trim() ||
        a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone.includes(searchQuery) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.locationArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.residentialAddress.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchJob && matchSearch;
    });
  }, [applications, statusFilter, jobFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-bottom ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── TOP HEADER & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20">
              Recruitment Module
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500">
              20 Open Technician Trades
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
            Job Applications &amp; Hiring Pipeline
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Collect, review, interview, and onboard candidates for Freetown&rsquo;s On-Demand Service Network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadData(true)}
            type="button"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors"
            title="Refresh candidate data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-500' : ''}`} />
          </button>

          <Link
            href="/careers/flyer"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Open printable full page recruitment advert flyer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>View Advert Flyer (Printable Full Page)</span>
          </Link>

          <Link
            href="/careers/social-flyer"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Open professional social media advert flyer studio (Instagram, WhatsApp, Facebook)"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
            <span>Social Media Flyer</span>
          </Link>

          <Link
            href="/careers"
            target="_blank"
            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Portal</span>
          </Link>

          <Link
            href="/admin/on-demand#category-images"
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Update card images for both Services and Live Portal"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Update Card Images</span>
          </Link>

          <button
            onClick={handleExportCSV}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-bold">
            <span>Total Applicants</span>
            <Users className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.totalApplications || applications.length}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-slate-500">Across 20 trades</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold">
            <span>Pending Review</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats?.pendingCount || 0}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-slate-500">Needs screening</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-bold">
            <span>Shortlisted</span>
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {stats?.shortlistedCount || 0}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-slate-500">Ready for interview</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span>Hired &amp; Active</span>
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.hiredCount || 0}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-slate-500">Onboarded as Pros</div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-bold">
            <span>Rejected</span>
            <XCircle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats?.rejectedCount || 0}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-slate-500">Did not meet criteria</div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, phone, ref..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses ({applications.length})</option>
            <option value="pending">Pending Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="hired">Hired / Onboarded</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Job Filter */}
          <select
            value={jobFilter}
            onChange={e => setJobFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All 20 Trade Categories</option>
            {TRADE_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

      </div>

      {/* ── APPLICANT TABLE / ROSTER ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        
        {isLoading ? (
          <div className="p-16 text-center text-gray-500 dark:text-slate-400 text-xs flex items-center justify-center gap-2">
            <i className="fas fa-circle-notch fa-spin text-red-500 text-base" />
            <span>Loading candidates database...</span>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-16 text-center text-gray-400 dark:text-slate-500 space-y-2">
            <Users className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-700" />
            <p className="text-sm font-bold">No candidates found matching the selected filters.</p>
            <p className="text-xs">Applications submitted via the public portal will appear here immediately.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Ref &amp; Candidate</th>
                  <th className="py-3.5 px-4">Trade Role</th>
                  <th className="py-3.5 px-4">Contact &amp; Location</th>
                  <th className="py-3.5 px-4">Experience &amp; Tools</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {filteredApps.map(app => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                    reviewed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
                    shortlisted: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
                    interview_scheduled: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
                    hired: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
                    rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
                  };

                  return (
                    <tr 
                      key={app.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-slate-850/50 transition-colors cursor-pointer group"
                      onClick={() => handleOpenDetail(app)}
                    >
                      {/* Candidate Name & Ref */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[10px] text-gray-400 dark:text-slate-500 font-bold">
                          {app.id}
                        </div>
                        <div className="font-black text-sm text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
                          {app.fullName}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Trade Role */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 dark:text-slate-200 block">
                          {app.jobTitle}
                        </span>
                        {app.secondarySkills && (
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate max-w-[180px] block">
                            + {app.secondarySkills}
                          </span>
                        )}
                      </td>

                      {/* Contact & Location */}
                      <td className="py-3.5 px-4 space-y-0.5" onClick={e => e.stopPropagation()}>
                        <div className="font-mono text-gray-700 dark:text-slate-300 font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{app.phone}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>{app.locationArea}</span>
                        </div>
                      </td>

                      {/* Experience & Tools */}
                      <td className="py-3.5 px-4 text-[11px] text-gray-600 dark:text-slate-300">
                        <div><strong>{app.yearsExperience} yrs</strong> experience</div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 capitalize">
                          {app.toolOwnership.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColors[app.status] || statusColors.pending}`}>
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/${app.whatsapp?.replace(/[^0-9]/g, '') || app.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${app.fullName}, this is the BridgeTech Recruitment Team regarding your application #${app.id} for ${app.jobTitle}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <i className="fab fa-whatsapp text-sm" />
                          </a>

                          <button
                            onClick={() => handleOpenDetail(app)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition-colors"
                            title="View candidate details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteApplication(app)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 transition-colors"
                            title="Delete application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── CANDIDATE PROFILE MODAL / DRAWER ── */}
      {detailModalOpen && selectedApp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => !isUpdating && setDetailModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                    {selectedApp.id}
                  </span>
                  <span className="text-xs text-gray-400">· Applied {new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  {selectedApp.fullName}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                  {selectedApp.jobTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-gray-500 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            {/* Candidate Dossier Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 block">
                  Contact Information
                </span>
                <div><strong>Phone:</strong> <a href={`tel:${selectedApp.phone}`} className="text-blue-500 hover:underline">{selectedApp.phone}</a></div>
                <div><strong>WhatsApp:</strong> <a href={`https://wa.me/${selectedApp.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">{selectedApp.whatsapp || selectedApp.phone}</a></div>
                <div><strong>Email:</strong> {selectedApp.email || 'None provided'}</div>
                <div><strong>Area:</strong> {selectedApp.locationArea}</div>
                <div><strong>Address:</strong> {selectedApp.residentialAddress}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 block">
                  Trade &amp; Equipment
                </span>
                <div><strong>Experience:</strong> {selectedApp.yearsExperience} Years</div>
                <div><strong>Tool Status:</strong> <span className="capitalize">{selectedApp.toolOwnership.replace(/_/g, ' ')}</span></div>
                <div><strong>Transport:</strong> <span className="capitalize">{selectedApp.transportMode || 'Commercial'}</span></div>
                <div><strong>Availability:</strong> <span className="capitalize">{selectedApp.availability.replace(/_/g, ' ')}</span></div>
                <div><strong>Payout ({selectedApp.mobileMoneyProvider}):</strong> {selectedApp.mobileMoneyNumber}</div>
              </div>

            </div>

            {/* Experience Summary */}
            {selectedApp.workSummary && (
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 block">
                  Work Summary &amp; Past Experience
                </span>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  {selectedApp.workSummary}
                </p>
              </div>
            )}

            {/* Attached Documents: ID Card & Trade Certificate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedApp.idCardPhoto ? (
                <div className="space-y-1.5 p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block">
                    National ID Card / Passport
                  </span>
                  <div className="h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 bg-black flex items-center justify-center">
                    <img
                      src={selectedApp.idCardPhoto}
                      alt="ID Card"
                      className="max-h-full max-w-full object-contain cursor-pointer"
                      onClick={() => window.open(selectedApp.idCardPhoto, '_blank')}
                      title="Click to view full size"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block text-center">Click to open full size</span>
                </div>
              ) : null}

              {selectedApp.certificatePhoto ? (
                <div className="space-y-1.5 p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Trade / Professional Certificate
                  </span>
                  <div className="h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 bg-black flex items-center justify-center">
                    <img
                      src={selectedApp.certificatePhoto}
                      alt="Certificate"
                      className="max-h-full max-w-full object-contain cursor-pointer"
                      onClick={() => window.open(selectedApp.certificatePhoto, '_blank')}
                      title="Click to view full size"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block text-center">Click to open full size</span>
                </div>
              ) : null}
            </div>

            {!selectedApp.idCardPhoto && !selectedApp.certificatePhoto && (
              <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-400 text-xs text-center">
                No identity or certification documents were attached with this application.
              </div>
            )}

            {/* Admin Controls: Status, Rating, Notes */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span>Recruiter Evaluation &amp; Status</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-400">Application Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed (In Pipeline)</option>
                    <option value="shortlisted">Shortlisted for Interview</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="hired">Hired (Approved Pro)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-400">Internal Rating (1-5 Stars)</label>
                  <div className="flex items-center gap-1 pt-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-base transition-transform hover:scale-125 ${
                          star <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-slate-700'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-500 ml-2">({rating} Stars)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-slate-400">Interview / Evaluation Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Spoke on phone, very confident with inverter sizing. Invited for practical testing on Wednesday."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
              
              <button
                onClick={() => handleConvertToPro(selectedApp)}
                disabled={isUpdating}
                type="button"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Convert to Active On-Demand Pro</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveStatusAndNotes}
                  disabled={isUpdating}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-all shadow flex items-center gap-1.5"
                >
                  {isUpdating ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
