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

  const [actionLoadingProId, setActionLoadingProId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [resetModal, setResetModal] = useState<{
    isOpen: boolean;
    pro: OnDemandPro | null;
    pin: string;
    copied: boolean;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    pro: null,
    pin: '',
    copied: false,
    isSubmitting: false,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    try {
      const res = await fetch(`/api/on-demand?t=${Date.now()}`, { cache: 'no-store' });
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
      if (showSpinner) setIsLoading(false);
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
        loadData(false);
        setEditingRequestId(null);
        showToast('Job financials updated successfully.', 'success');
      }
    } catch (e) {
      showToast('Failed to update request financials', 'error');
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
        loadData(false);
        showToast(`Assigned ${pro.fullName} to job.`, 'success');
      }
    } catch (e) {
      showToast('Failed to assign pro', 'error');
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
        loadData(false);
        showToast(newFeeStatus === 'paid' ? 'Le 30 commitment fee verified (Paid).' : 'Fee set to unpaid.', 'success');
      }
    } catch (e) {
      showToast('Failed to update pro fee status', 'error');
    }
  };

  const handleUpdateProStatus = async (proId: string, newStatus: string) => {
    const previousPros = [...pros];
    const previousViewing = viewingPro;
    setActionLoadingProId(proId);

    // Optimistic state update: immediate UI reflection
    setPros(prev => prev.map(p => p.id === proId ? { ...p, status: newStatus as any } : p));
    if (viewingPro && viewingPro.id === proId) {
      setViewingPro(p => p ? { ...p, status: newStatus as any } : null);
    }

    try {
      const res = await fetch('/api/on-demand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_pro',
          id: proId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const statusLabels: Record<string, string> = {
          suspended: 'Account suspended. Technician cannot log in.',
          blocked: 'Account blocked. Technician is permanently banned.',
          verified_active: 'Account unsuspended & verified active.',
          pending_review: 'Account unblocked & returned to review.',
        };
        showToast(statusLabels[newStatus] || `Account status updated to ${newStatus}.`, 'success');
        loadData(false);
      } else {
        // Revert on error
        setPros(previousPros);
        setViewingPro(previousViewing);
        showToast(data.error || 'Failed to update account status', 'error');
      }
    } catch (e: any) {
      // Revert on network exception
      setPros(previousPros);
      setViewingPro(previousViewing);
      showToast(e.message || 'Failed to update account status', 'error');
    } finally {
      setActionLoadingProId(null);
    }
  };

  const openResetPasswordModal = (pro: OnDemandPro) => {
    const defaultPin = Math.floor(100000 + Math.random() * 900000).toString();
    setResetModal({
      isOpen: true,
      pro,
      pin: defaultPin,
      copied: false,
      isSubmitting: false,
    });
  };

  const handleConfirmResetPassword = async () => {
    if (!resetModal.pro || !resetModal.pin?.trim()) return;
    const newPin = resetModal.pin.trim();
    if (newPin.length < 4) {
      showToast('Password must be at least 4 characters or digits.', 'error');
      return;
    }

    setResetModal(prev => ({ ...prev, isSubmitting: true }));
    const proId = resetModal.pro.id;
    const proName = resetModal.pro.fullName;

    try {
      const res = await fetch('/api/on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_reset_password',
          id: proId,
          newPassword: newPin,
          expiryHours: 24,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Temporary PIN set for ${proName}. Expires in 24h & forces password change on first login.`, 'success');
        setPros(prev => prev.map(p => p.id === proId ? { 
          ...p, 
          password: newPin, 
          mustChangePassword: true, 
          tempPasswordExpiresAt: data.tempPasswordExpiresAt 
        } : p));
        if (viewingPro && viewingPro.id === proId) {
          setViewingPro(p => p ? { 
            ...p, 
            password: newPin, 
            mustChangePassword: true, 
            tempPasswordExpiresAt: data.tempPasswordExpiresAt 
          } : null);
        }
        setResetModal({ isOpen: false, pro: null, pin: '', copied: false, isSubmitting: false });
        loadData(false);
      } else {
        showToast(data.error || 'Failed to reset password', 'error');
        setResetModal(prev => ({ ...prev, isSubmitting: false }));
      }
    } catch (e: any) {
      showToast(e.message || 'Network error resetting password', 'error');
      setResetModal(prev => ({ ...prev, isSubmitting: false }));
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

  const handleDeletePro = async (id: string, name?: string) => {
    if (!confirm(`Are you sure you want to permanently delete pro ${name || id}? This will remove all their profile data and cannot be undone.`)) return;
    try {
      const res = await fetch('/api/on-demand', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_pro', id }),
      });
      if (res.ok) {
        loadData();
        if (viewingPro && viewingPro.id === id) {
          setViewingPro(null);
        }
      }
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
            onClick={() => loadData()}
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
            <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
              <i className="fas fa-clipboard-list text-3xl text-slate-600 mb-1" />
              <p className="text-sm font-bold text-slate-300">No service requests yet</p>
              <p className="text-xs text-slate-500">Live customer bookings submitted through the on-demand portal will appear here immediately.</p>
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
            <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
              <i className="fas fa-hard-hat text-3xl text-slate-600 mb-1" />
              <p className="text-sm font-bold text-slate-300">No registered artisans yet</p>
              <p className="text-xs text-slate-500">Newly registered technician profiles and Le 30 fee submissions will appear here immediately.</p>
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

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            pro.status === 'blocked' ? 'bg-red-700/30 text-red-400 border border-red-600/30' :
                            pro.status === 'suspended' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {pro.status === 'blocked' ? '🚫 Blocked' : pro.status === 'suspended' ? '⏸ Suspended' : isActive ? 'Active Pro' : 'Pending'}
                          </span>
                          {pro.mustChangePassword && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1" title="Temporary PIN active. Requires password change on next login.">
                              <i className="fas fa-clock text-[8px]" /> Temp PIN Active
                            </span>
                          )}
                        </div>
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
                      <div className="space-y-2">
                        {/* Contact row */}
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
                          <button
                            type="button"
                            onClick={() => openResetPasswordModal(pro)}
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-[11px] font-bold border border-blue-500/30 flex items-center gap-1"
                            title="Reset account password"
                          >
                            <i className="fas fa-key text-[9px]" /> Reset PW
                          </button>
                        </div>

                        {/* Account control row: Suspend / Block / Delete */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {pro.status !== 'suspended' && pro.status !== 'blocked' && (
                            <button
                              type="button"
                              disabled={actionLoadingProId === pro.id}
                              onClick={() => handleUpdateProStatus(pro.id, 'suspended')}
                              className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-[10px] font-bold border border-orange-500/30 flex items-center gap-1 disabled:opacity-50"
                            >
                              {actionLoadingProId === pro.id ? <i className="fas fa-circle-notch fa-spin text-[9px]" /> : <i className="fas fa-pause-circle text-[9px]" />}
                              <span>Suspend</span>
                            </button>
                          )}
                          {pro.status === 'suspended' && (
                            <button
                              type="button"
                              disabled={actionLoadingProId === pro.id}
                              onClick={() => handleUpdateProStatus(pro.id, 'verified_active')}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 disabled:opacity-50"
                            >
                              {actionLoadingProId === pro.id ? <i className="fas fa-circle-notch fa-spin text-[9px]" /> : <i className="fas fa-play-circle text-[9px]" />}
                              <span>Unsuspend</span>
                            </button>
                          )}
                          {pro.status !== 'blocked' ? (
                            <button
                              type="button"
                              disabled={actionLoadingProId === pro.id}
                              onClick={() => handleUpdateProStatus(pro.id, 'blocked')}
                              className="px-2.5 py-1 bg-red-700/20 hover:bg-red-700/30 text-red-400 rounded-lg text-[10px] font-bold border border-red-700/30 flex items-center gap-1 disabled:opacity-50"
                            >
                              {actionLoadingProId === pro.id ? <i className="fas fa-circle-notch fa-spin text-[9px]" /> : <i className="fas fa-ban text-[9px]" />}
                              <span>Block</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoadingProId === pro.id}
                              onClick={() => handleUpdateProStatus(pro.id, 'pending_review')}
                              className="px-2.5 py-1 bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-600/30 flex items-center gap-1 disabled:opacity-50"
                            >
                              {actionLoadingProId === pro.id ? <i className="fas fa-circle-notch fa-spin text-[9px]" /> : <i className="fas fa-undo text-[9px]" />}
                              <span>Unblock</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeletePro(pro.id, pro.fullName)}
                            className="ml-auto text-slate-600 hover:text-rose-400 text-xs p-1 transition-colors"
                            title="Permanently delete profile"
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
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
                <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Account Password / PIN</span>
                    <span className="font-mono text-amber-300 font-bold">{viewingPro.password}</span>
                  </div>
                  {viewingPro.mustChangePassword ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <i className="fas fa-clock text-[8px]" /> Temp PIN (First Use Pending)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Permanent Password
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Fee & Action Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              {/* Fee Row */}
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

              {/* Account Controls */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Account Controls</span>
                <div className="flex flex-wrap gap-2">
                  {/* Reset Password */}
                  <button
                    type="button"
                    onClick={() => openResetPasswordModal(viewingPro)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow"
                  >
                    <i className="fas fa-key text-[9px]" />
                    <span>Reset Password</span>
                  </button>

                  {/* Suspend / Unsuspend */}
                  {viewingPro.status === 'suspended' ? (
                    <button
                      type="button"
                      disabled={actionLoadingProId === viewingPro.id}
                      onClick={() => handleUpdateProStatus(viewingPro.id, 'verified_active')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoadingProId === viewingPro.id ? <i className="fas fa-circle-notch fa-spin text-[9px]" /> : <i className="fas fa-play-circle text-[9px]" />}
                      <span>Unsuspend</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoadingProId === viewingPro.id}
                      onClick={() => handleUpdateProStatus(viewingPro.id, 'suspended')}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoadingProId === viewingPro.id ? <i className="fas fa-circle-notch fa-spin text-[9px]" /> : <i className="fas fa-pause-circle text-[9px]" />}
                      <span>Suspend</span>
                    </button>
                  )}

                  {/* Block / Unblock */}
                  {viewingPro.status === 'blocked' ? (
                    <button
                      type="button"
                      disabled={actionLoadingProId === viewingPro.id}
                      onClick={() => handleUpdateProStatus(viewingPro.id, 'pending_review')}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoadingProId === viewingPro.id ? <i className="fas fa-circle-notch fa-spin text-[9px]" /> : <i className="fas fa-undo text-[9px]" />}
                      <span>Unblock</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoadingProId === viewingPro.id}
                      onClick={() => handleUpdateProStatus(viewingPro.id, 'blocked')}
                      className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoadingProId === viewingPro.id ? <i className="fas fa-circle-notch fa-spin text-[9px]" /> : <i className="fas fa-ban text-[9px]" />}
                      <span>Block</span>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeletePro(viewingPro.id, viewingPro.fullName)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 ml-auto"
                  >
                    <i className="fas fa-trash-alt text-[9px]" />
                    <span>Delete Profile</span>
                  </button>
                </div>
              </div>

              {/* Close */}
              <div className="flex justify-end pt-1">
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
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[999] px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
          toast.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/95 border-rose-500/40 text-rose-200'
        }`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-emerald-400' : 'fa-exclamation-circle text-rose-400'}`} />
          <span className="text-xs font-bold">{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* ── RESET PASSWORD INTERACTIVE MODAL ── */}
      {resetModal.isOpen && resetModal.pro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => !resetModal.isSubmitting && setResetModal({ isOpen: false, pro: null, pin: '', copied: false, isSubmitting: false })}
        >
          <div
            className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 text-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">
                  <i className="fas fa-key" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Reset Account Password</h3>
                  <p className="text-[11px] text-slate-400">{resetModal.pro.fullName} ({resetModal.pro.primaryTrade})</p>
                </div>
              </div>
              <button
                type="button"
                disabled={resetModal.isSubmitting}
                onClick={() => setResetModal({ isOpen: false, pro: null, pin: '', copied: false, isSubmitting: false })}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate a temporary 6-digit PIN for <strong>{resetModal.pro.fullName}</strong>. They will use their phone number (<span className="font-mono text-emerald-400">{resetModal.pro.phone}</span>) and this temporary PIN to sign in.
              </p>

              <div className="p-2.5 bg-blue-950/40 border border-blue-800/50 rounded-xl flex items-start gap-2 text-xs text-blue-200">
                <i className="fas fa-shield-alt text-blue-400 mt-0.5 shrink-0" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-white block">24-Hour Expiration &amp; First-Use Enforcement:</span>
                  This temporary PIN expires in <strong>24 hours</strong>. Upon signing in, the artisan is immediately required to set their own permanent password before gaining dashboard access.
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Temporary 6-Digit PIN (Expires in 24h)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={resetModal.pin}
                    onChange={e => setResetModal(prev => ({ ...prev, pin: e.target.value, copied: false }))}
                    placeholder="e.g. 582914"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base font-black tracking-widest focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPin = Math.floor(100000 + Math.random() * 900000).toString();
                      setResetModal(prev => ({ ...prev, pin: newPin, copied: false }));
                    }}
                    title="Generate new PIN"
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <i className="fas fa-dice text-blue-400" />
                    <span>Dice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(resetModal.pin);
                      setResetModal(prev => ({ ...prev, copied: true }));
                      setTimeout(() => setResetModal(prev => ({ ...prev, copied: false })), 2000);
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <i className={`fas ${resetModal.copied ? 'fa-check text-emerald-400' : 'fa-copy'}`} />
                    <span>{resetModal.copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp notification helper link */}
              <div className="p-3 bg-green-950/30 border border-green-800/40 rounded-xl flex items-center justify-between text-xs">
                <div className="text-[11px] text-green-300">
                  <span className="font-bold">Send PIN to Artisan on WhatsApp:</span>
                  <div className="font-mono text-[10px] text-slate-400">{resetModal.pro.whatsapp || resetModal.pro.phone}</div>
                </div>
                <a
                  href={`https://wa.me/${(resetModal.pro.whatsapp || resetModal.pro.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hello ${resetModal.pro.fullName}, your BridgeTech Artisan Portal temporary login PIN is: ${resetModal.pin}. NOTE: This PIN expires in 24 hours. When you log in at https://www.itservicesfreetown.com/on-demand with your phone number and this PIN, you will be prompted to create your private permanent password.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm"
                >
                  <i className="fab fa-whatsapp" />
                  <span>Send via WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={resetModal.isSubmitting}
                onClick={() => setResetModal({ isOpen: false, pro: null, pin: '', copied: false, isSubmitting: false })}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetModal.isSubmitting || !resetModal.pin?.trim() || resetModal.pin.trim().length < 4}
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                {resetModal.isSubmitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin text-xs" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-check text-xs" />
                    <span>Set Temp PIN (24h)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
