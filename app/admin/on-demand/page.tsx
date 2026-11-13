'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OnDemandRequest, OnDemandPro, OnDemandStats } from '@/lib/on-demand-storage';

export default function AdminOnDemandPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'pros'>('requests');
  const [requests, setRequests] = useState<OnDemandRequest[]>([]);
  const [pros, setPros] = useState<OnDemandPro[]>([]);
  const [stats, setStats] = useState<OnDemandStats>({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalPros: 0,
    verifiedPros: 0,
    totalCommissionEarned: 0,
    totalOnboardingFeesCollected: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<OnDemandRequest>>({});
  const [viewingPro, setViewingPro] = useState<OnDemandPro | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/on-demand', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setPros(data.pros || []);
        setStats(data.stats || {
          totalRequests: 0,
          activeRequests: 0,
          completedRequests: 0,
          totalPros: 0,
          verifiedPros: 0,
          totalCommissionEarned: 0,
          totalOnboardingFeesCollected: 0,
        });
      }
    } catch (e) {
      console.error('Failed to load on-demand data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateJobFinancials = async (id: string, jobTotalCost: number, paymentStatus: 'pending' | 'part_payment' | 'paid', status: any) => {
    try {
      const res = await fetch('/api/on-demand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_request',
          id,
          jobTotalCost,
          paymentStatus,
          status,
          platformCommissionRate: 0.15,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
        setEditingRequestId(null);
      }
    } catch (e) {
      alert('Failed to update request financials');
    }
  };

  const handleAssignPro = async (requestId: string, proId: string) => {
    const pro = pros.find(p => p.id === proId);
    if (!pro) return;

    try {
      const res = await fetch('/api/on-demand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_request',
          id: requestId,
          assignedProId: pro.id,
          assignedProName: pro.fullName,
          assignedProPhone: pro.phone,
          status: 'assigned',
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      alert('Failed to assign pro');
    }
  };

  const handleVerifyProFee = async (proId: string, currentStatus: string) => {
    const newFeeStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    const newStatus = newFeeStatus === 'paid' ? 'verified_active' : 'pending_review';

    try {
      const res = await fetch('/api/on-demand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_pro',
          id: proId,
          onboardingFeeStatus: newFeeStatus,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      alert('Failed to update pro fee status');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm(`Delete request ${id}?`)) return;
    try {
      const res = await fetch('/api/on-demand', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_request', id }),
      });
      if (res.ok) loadData();
    } catch (e) {
      alert('Failed to delete request');
    }
  };

  const handleDeletePro = async (id: string) => {
    if (!confirm(`Remove pro ${id}?`)) return;
    try {
      const res = await fetch('/api/on-demand', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_pro', id }),
      });
      if (res.ok) loadData();
    } catch (e) {
      alert('Failed to delete pro');
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.locationArea.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  // Filter pros
  const filteredPros = pros.filter(p => {
    return (
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryTrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center gap-1">
              &larr; Admin Console
            </Link>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400 font-semibold">Pro Network &amp; Gig Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <i className="fas fa-handshake text-red-500 text-xl" />
            <span>On-Demand Service Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage customer job dispatches, match verified artisans, and collect your <strong>15% platform commission</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/on-demand"
            target="_blank"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <i className="fas fa-external-link-alt text-[10px]" />
            <span>View Public Portal</span>
          </Link>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
          >
            <i className={`fas fa-sync-alt text-[10px] ${isLoading ? 'fa-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Active Jobs</span>
            <i className="fas fa-briefcase text-sky-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.activeRequests}</span>
          <p className="text-[10px] text-slate-500 mt-0.5">{stats.totalRequests} total jobs received</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>15% Commission Earned</span>
            <i className="fas fa-coins text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            Le {stats.totalCommissionEarned.toLocaleString()}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">From completed customer jobs</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Verified Pros</span>
            <i className="fas fa-user-check text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.verifiedPros}</span>
          <p className="text-[10px] text-slate-500 mt-0.5">{stats.totalPros} registered artisans</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Le 30 Onboarding Fees</span>
            <i className="fas fa-ticket-alt text-purple-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
            Le {stats.totalOnboardingFeesCollected.toLocaleString()}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">Commitment fees collected</p>
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-red-600 text-white shadow-md shadow-red-950'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <i className="fas fa-tasks text-xs" />
            <span>Service Requests ({requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pros')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'pros'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <i className="fas fa-hard-hat text-xs" />
            <span>Artisan Pro Directory ({pros.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <i className="fas fa-search absolute left-3 top-2.5 text-slate-500 text-xs" />
          <input
            type="text"
            placeholder={activeTab === 'requests' ? 'Search jobs, customer, area...' : 'Search pros by name, trade...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* ── TAB 1: SERVICE REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          
          {/* Status Filter Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['all', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 space-y-2">
              <i className="fas fa-clipboard-list text-3xl opacity-30" />
              <p className="text-xs">No service requests match the current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map(job => {
                const isEditing = editingRequestId === job.id;
                const totalCost = editFormData.jobTotalCost !== undefined ? (editFormData.jobTotalCost || 0) : (job.jobTotalCost || 0);
                const commission = Math.round(totalCost * 0.15 * 100) / 100;
                const payout = Math.round(totalCost * 0.85 * 100) / 100;

                return (
                  <div
                    key={job.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-black text-red-400">{job.id}</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="font-bold text-white text-sm">{job.categoryTitle}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          job.urgency === 'emergency' ? 'bg-red-950 text-red-300 border border-red-700' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {job.urgency === 'emergency' ? '🚨 Emergency' : job.urgency}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : job.status === 'in_progress' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : job.status === 'assigned' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : job.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                        }`}>
                          {job.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Customer</span>
                        <span className="font-bold text-white block text-sm">{job.customerName}</span>
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={`tel:${job.phone}`}
                            className="px-2 py-1 bg-emerald-600/20 text-emerald-300 rounded font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-600/30"
                          >
                            <i className="fas fa-phone-alt text-[9px]" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${(job.whatsapp || job.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${job.customerName}, this is BridgeTech IT regarding your on-demand service request (${job.id}) for ${job.categoryTitle}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-green-600/20 text-green-300 rounded font-bold text-[10px] flex items-center gap-1 hover:bg-green-600/30"
                          >
                            <i className="fab fa-whatsapp text-[10px]" /> WhatsApp
                          </a>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Location &amp; Landmark</span>
                        <span className="font-bold text-amber-300 block">{job.locationArea}</span>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{job.addressDetails || 'No exact address specified'}</p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Assigned Pro</span>
                        {job.assignedProName ? (
                          <div>
                            <span className="font-bold text-emerald-400 block">{job.assignedProName}</span>
                            <span className="text-[10px] text-slate-400 block">{job.assignedProPhone}</span>
                            {job.assignedProPhone && (
                              <a
                                href={`https://wa.me/${job.assignedProPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${job.assignedProName}, job dispatch from BridgeTech (${job.id}): Customer: ${job.customerName}, Area: ${job.locationArea}, Work: ${job.problemDescription}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-green-400 font-bold mt-1 hover:underline"
                              >
                                <i className="fab fa-whatsapp" /> Dispatch Pro on WhatsApp
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="text-[11px] text-slate-500 italic block">No pro assigned yet</span>
                            <select
                              onChange={e => e.target.value && handleAssignPro(job.id, e.target.value)}
                              defaultValue=""
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-red-500"
                            >
                              <option value="" disabled>Assign Verified Pro &rarr;</option>
                              {pros
                                .filter(p => p.status === 'verified_active')
                                .map(p => (
                                  <option key={p.id} value={p.id}>{p.fullName} ({p.primaryTrade})</option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Problem Description */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Issue Details</span>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{job.problemDescription}</p>
                    </div>

                    {/* Financials & 15% Commission Split */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <i className="fas fa-calculator text-red-400" />
                          <span>Job Pricing &amp; 15% Platform Split</span>
                        </span>
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRequestId(job.id);
                              setEditFormData({
                                jobTotalCost: job.jobTotalCost || 0,
                                paymentStatus: job.paymentStatus || 'pending',
                                status: job.status,
                              });
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold border border-slate-700"
                          >
                            <i className="fas fa-edit mr-1" /> Edit Job Cost
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingRequestId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px]"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateJobFinancials(
                                job.id,
                                editFormData.jobTotalCost || 0,
                                editFormData.paymentStatus as any || 'pending',
                                editFormData.status || job.status
                              )}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                            >
                              Save Split
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Customer Price (Le)</label>
                            <input
                              type="number"
                              value={editFormData.jobTotalCost || ''}
                              onChange={e => setEditFormData(p => ({ ...p, jobTotalCost: parseFloat(e.target.value) || 0 }))}
                              placeholder="e.g. 800"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Payment Status</label>
                            <select
                              value={editFormData.paymentStatus}
                              onChange={e => setEditFormData(p => ({ ...p, paymentStatus: e.target.value as any }))}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            >
                              <option value="pending">Pending (Unpaid)</option>
                              <option value="part_payment">Deposit Received</option>
                              <option value="paid">Paid (Fully Settled)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Job Status</label>
                            <select
                              value={editFormData.status}
                              onChange={e => setEditFormData(p => ({ ...p, status: e.target.value as any }))}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="assigned">Assigned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Charged</span>
                          <span className="text-sm font-black text-white font-mono">
                            {job.jobTotalCost ? `Le ${job.jobTotalCost.toLocaleString()}` : 'Unquoted'}
                          </span>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30">
                          <span className="text-[10px] text-emerald-400 uppercase block font-semibold">BridgeTech 15%</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            {job.jobTotalCost ? `Le ${commission.toLocaleString()}` : 'Le 0'}
                          </span>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Pro Payout (85%)</span>
                          <span className="text-sm font-black text-amber-300 font-mono">
                            {job.jobTotalCost ? `Le ${payout.toLocaleString()}` : 'Le 0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        {job.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateJobFinancials(job.id, job.jobTotalCost || 0, 'paid', 'completed')}
                            className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <i className="fas fa-check-double text-[9px]" /> Mark Job Completed &amp; Paid
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(job.id)}
                        className="text-slate-500 hover:text-rose-400 text-[11px] transition-colors"
                      >
                        <i className="fas fa-trash-alt mr-1" /> Delete
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ── TAB 2: ARTISAN PRO DIRECTORY ── */}
      {activeTab === 'pros' && (
        <div className="space-y-4">
          
          {filteredPros.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 space-y-2">
              <i className="fas fa-users-slash text-3xl opacity-30" />
              <p className="text-xs">No artisans found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPros.map(pro => {
                const isPaid = pro.onboardingFeeStatus === 'paid';
                const isActive = pro.status === 'verified_active';

                return (
                  <div
                    key={pro.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          {pro.profilePhoto ? (
                            <img
                              src={pro.profilePhoto}
                              alt={pro.fullName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold shrink-0">
                              <i className="fas fa-user text-sm" />
                            </div>
                          )}
                          <div>
                            <span className="font-mono text-[10px] font-bold text-slate-500">{pro.id}</span>
                            <h3 className="font-extrabold text-white text-sm leading-snug">{pro.fullName}</h3>
                            <span className="text-xs text-red-400 font-semibold">{pro.primaryTrade}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                          isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isActive ? 'Active Pro' : 'Pending'}
                        </span>
                      </div>

                      {/* Contact & MoMo */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">Phone:</span>
                          <span className="font-mono font-bold">{pro.phone}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">Payout MoMo:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {pro.mobileMoneyNumber} ({pro.mobileMoneyProvider})
                          </span>
                        </div>
                        {pro.address && (
                          <div className="flex items-start justify-between text-slate-300 gap-2">
                            <span className="text-slate-500 shrink-0">Address:</span>
                            <span className="text-right text-[11px] text-slate-200">{pro.address}</span>
                          </div>
                        )}
                        {pro.email && (
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-mono text-[11px] text-slate-300 truncate max-w-[160px]">{pro.email}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">Experience:</span>
                          <span className="font-bold">{pro.yearsOfExperience} years</span>
                        </div>
                        {pro.nationalIdNumber && (
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-500">ID / Voter No:</span>
                            <span className="font-mono">{pro.nationalIdNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Coverage */}
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Coverage Areas</span>
                        <div className="flex flex-wrap gap-1">
                          {(pro.coverageAreas || []).map(a => (
                            <span key={a} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[10px] rounded text-slate-300">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bio */}
                      {pro.bioOrWorkSummary && (
                        <p className="text-[11px] text-slate-400 mt-2 bg-slate-900/40 p-2 rounded-lg italic">
                          "{pro.bioOrWorkSummary}"
                        </p>
                      )}

                      {/* View Profile & ID Photos Button */}
                      <button
                        type="button"
                        onClick={() => setViewingPro(pro)}
                        className="w-full mt-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <i className="fas fa-id-card text-xs text-blue-400" />
                        <span>View Profile &amp; ID Photos</span>
                      </button>
                    </div>

                    {/* Onboarding Fee Status Box */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Le 30 Commitment Fee</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Ref: {pro.onboardingPaymentRef || 'Not provided'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVerifyProFee(pro.id, pro.onboardingFeeStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                            isPaid
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                          }`}
                        >
                          {isPaid ? '✓ Fee Paid' : 'Verify Paid'}
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${pro.phone}`}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-800"
                          >
                            <i className="fas fa-phone-alt text-[9px]" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${(pro.whatsapp || pro.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${pro.fullName}, this is BridgeTech IT Services regarding your Artisan Pro membership.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-[11px] font-bold border border-green-500/30"
                          >
                            <i className="fab fa-whatsapp text-[10px]" /> WhatsApp
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeletePro(pro.id)}
                          className="text-slate-600 hover:text-rose-400 text-xs p-1"
                          title="Remove pro"
                        >
                          <i className="fas fa-trash-alt" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ── ARTISAN PROFILE & ID PHOTOS LIGHTBOX MODAL ── */}
      {viewingPro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setViewingPro(null)}
        >
          <div
            className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-5 text-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-slate-500">{viewingPro.id}</span>
                <h3 className="text-lg font-black text-white">{viewingPro.fullName}</h3>
                <p className="text-xs text-red-400 font-bold">{viewingPro.primaryTrade}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingPro(null)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {/* Photos Grid: Profile Photo + 2 ID Card Photos (Front & Back) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Photo 1: Profile Photo */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">1. Full Profile Photo</span>
                {viewingPro.profilePhoto ? (
                  <a href={viewingPro.profilePhoto} target="_blank" rel="noopener noreferrer" className="block group">
                    <img
                      src={viewingPro.profilePhoto}
                      alt={viewingPro.fullName}
                      className="w-full h-44 object-cover rounded-xl border border-slate-800 group-hover:border-emerald-500 transition-colors shadow-sm"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block group-hover:text-emerald-400">Click to open full size &rarr;</span>
                  </a>
                ) : (
                  <div className="w-full h-44 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-xs italic">
                    No photo uploaded
                  </div>
                )}
              </div>

              {/* Photo 2: ID Card Front */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">2. ID Card (Front Side)</span>
                {(viewingPro.idCardFrontPhoto || viewingPro.idCardPhoto) ? (
                  <a href={viewingPro.idCardFrontPhoto || viewingPro.idCardPhoto} target="_blank" rel="noopener noreferrer" className="block group">
                    <img
                      src={viewingPro.idCardFrontPhoto || viewingPro.idCardPhoto}
                      alt="ID Card Front"
                      className="w-full h-44 object-cover rounded-xl border border-slate-800 group-hover:border-blue-500 transition-colors shadow-sm"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block group-hover:text-blue-400">Click to open full size &rarr;</span>
                  </a>
                ) : (
                  <div className="w-full h-44 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-xs italic">
                    No front ID photo
                  </div>
                )}
              </div>

              {/* Photo 3: ID Card Back */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">3. ID Card (Back Side)</span>
                {viewingPro.idCardBackPhoto ? (
                  <a href={viewingPro.idCardBackPhoto} target="_blank" rel="noopener noreferrer" className="block group">
                    <img
                      src={viewingPro.idCardBackPhoto}
                      alt="ID Card Back"
                      className="w-full h-44 object-cover rounded-xl border border-slate-800 group-hover:border-blue-500 transition-colors shadow-sm"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block group-hover:text-blue-400">Click to open full size &rarr;</span>
                  </a>
                ) : (
                  <div className="w-full h-44 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-xs italic">
                    No back ID photo
                  </div>
                )}
              </div>
            </div>

            {/* Complete Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Phone</span>
                <span className="font-bold font-mono text-white">{viewingPro.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Mobile Money Payout</span>
                <span className="font-bold text-emerald-400 font-mono">{viewingPro.mobileMoneyNumber} ({viewingPro.mobileMoneyProvider})</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Residential Address (Must)</span>
                <span className="font-bold text-white text-xs">{viewingPro.address || 'Not provided'}</span>
              </div>

              {viewingPro.email && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Email Address (Optional)</span>
                  <span className="font-mono text-slate-300">{viewingPro.email}</span>
                </div>
              )}

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Experience</span>
                <span className="font-bold text-white">{viewingPro.yearsOfExperience} years</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">National ID / Voter ID</span>
                <span className="font-mono text-white">{viewingPro.nationalIdNumber || 'Not provided'}</span>
              </div>

              {viewingPro.password && (
                <div className="sm:col-span-2 pt-1 border-t border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Account Password (PIN)</span>
                  <span className="font-mono text-amber-300 font-bold">{viewingPro.password}</span>
                </div>
              )}
            </div>

            {/* Fee & Action Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Le 30 Fee:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  viewingPro.onboardingFeeStatus === 'paid' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {viewingPro.onboardingFeeStatus === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleVerifyProFee(viewingPro.id, viewingPro.onboardingFeeStatus);
                    setViewingPro(p => p ? { ...p, onboardingFeeStatus: p.onboardingFeeStatus === 'paid' ? 'unpaid' : 'paid' } : null);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
                >
                  Toggle Fee Status
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingPro(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
