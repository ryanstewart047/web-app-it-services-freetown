'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Smartphone, CheckCircle, XCircle, AlertCircle, Search, RefreshCw, User, MapPin, Mail, Phone, FileText, X, ChevronRight } from 'lucide-react';
import { useAdminSession } from '../../../src/hooks/useAdminSession';

interface Appointment {
  id: string;
  customerId: string;
  deviceType: string;
  deviceModel: string;
  issueDescription: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800'
};

const statusIcons = {
  pending: AlertCircle,
  confirmed: Clock,
  completed: CheckCircle,
  cancelled: XCircle
};

export default function AdminBookingsPage() {
  // Admin session management - auto-logout after 5 minutes of inactivity
  const { showIdleWarning, getRemainingTime } = useAdminSession({
    idleTimeout: 5 * 60 * 1000, // 5 minutes
    warningTime: 30 * 1000 // 30 seconds warning
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Detail modal state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments().then(() => {
      // Perform a silent sync on initial load to automatically pull in any legacy data
      syncLegacyBookings(true);
    });
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments');
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 503) {
          setError(data.message || 'Database not configured. Please check your environment variables.');
        } else {
          setError(data.error || 'Failed to fetch appointments');
        }
        setAppointments(data.appointments || []);
      } else {
        setAppointments(Array.isArray(data) ? data : []);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to connect to the server. Please check your connection.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const syncLegacyBookings = async (silent = false) => {
    try {
      if (!silent) setSyncing(true);
      setSyncMessage(null);
      
      let localBookings = [];
      if (typeof window !== 'undefined') {
        const { getAllBookings } = await import('../../../lib/unified-booking-storage');
        localBookings = getAllBookings();
      }

      const res = await fetch('/api/appointments/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localBookings })
      });

      const data = await res.json();
      if (res.ok && data.syncedCount > 0) {
        if (!silent) {
          setSyncMessage(`✅ Successfully synced ${data.syncedCount} legacy booking(s)!`);
          setTimeout(() => setSyncMessage(null), 6000);
        }
        await fetchAppointments();
      } else if (!silent) {
        if (data.syncedCount === 0) {
          setSyncMessage('ℹ️ All booking records are already fully synchronized.');
          setTimeout(() => setSyncMessage(null), 4000);
        }
      }
    } catch (error) {
      console.error('Error syncing legacy bookings:', error);
      if (!silent) {
        setSyncMessage('❌ Failed to synchronize legacy records.');
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } finally {
      if (!silent) setSyncing(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update appointment');
      }

      // Update state locally for fast UI responsiveness
      setAppointments(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(error instanceof Error ? error.message : 'Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer.phone.includes(searchTerm) ||
      appointment.issueDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading appointments data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Sync Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-300">Operations Control</span>
          <h1 className="text-3xl font-bold mt-1">Bookings & Appointments</h1>
          <p className="mt-2 text-purple-200/80 max-w-xl text-sm">
            Manage incoming repair requests, schedule client service windows, and review device diagnostic records.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => syncLegacyBookings()}
            disabled={syncing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-medium rounded-2xl backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Legacy Data'}</span>
          </button>
        </div>
      </div>

      {/* Sync feedback banner */}
      {syncMessage && (
        <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-4 shadow-sm flex items-center justify-between animate-fadeIn">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-200">{syncMessage}</p>
          <button onClick={() => setSyncMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-300">Database Configuration Required</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                Please see <code className="px-2 py-1 bg-red-100 dark:bg-red-900/40 rounded font-mono">DATABASE_SETUP_REQUIRED.md</code> for setup instructions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-yellow-600 dark:text-yellow-400 tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-blue-600 dark:text-blue-400 tracking-wider">Confirmed</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-green-600 dark:text-green-400 tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-red-600 dark:text-red-400 tracking-wider">Cancelled</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-1">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Idle Warning Banner */}
      {showIdleWarning && (
        <div className="bg-yellow-500 text-black px-6 py-4 rounded-2xl shadow-md flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-semibold text-sm">
              Your session will expire in {getRemainingTime()} seconds due to inactivity. Move your mouse or click to stay authenticated.
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/80">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name, device, phone, or issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 dark:text-white transition-all outline-none text-sm font-medium"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 dark:text-white text-sm font-semibold outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => {
          const StatusIcon = statusIcons[appointment.status as keyof typeof statusIcons] || AlertCircle;
          return (
            <div
              key={appointment.id}
              onClick={() => setSelectedAppointment(appointment)}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/80 p-6 hover:shadow-lg hover:border-purple-500/50 dark:hover:border-purple-500/50 cursor-pointer transition-all duration-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Main Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2">
                        <span>{appointment.customer.name}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-purple-500" />
                          <span>{appointment.customer.email}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-purple-500" />
                          <span>{appointment.customer.phone}</span>
                        </span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${statusColors[appointment.status as keyof typeof statusColors]}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{appointment.status}</span>
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {appointment.deviceType} - {appointment.deviceModel}
                        </p>
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                          {appointment.serviceType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {appointment.preferredDate}
                        </p>
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                          Preferred Window: {appointment.preferredTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Reported Issue</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 bg-white dark:bg-gray-900/40 p-3 rounded-lg border border-gray-200/60 dark:border-gray-800">
                      {appointment.issueDescription}
                    </p>
                  </div>

                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    Booked on: {new Date(appointment.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => updateStatus(appointment.id, 'confirmed', e)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={(e) => updateStatus(appointment.id, 'cancelled', e)}
                        className="px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 font-semibold text-sm rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={(e) => updateStatus(appointment.id, 'completed', e)}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
                    >
                      Complete Job
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAppointments.length === 0 && !error && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700/80 p-8 shadow-sm">
          <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No matching appointments found' : 'No appointments scheduled yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try resetting your search query or selecting "All Statuses" above.' 
              : 'As clients book repairs through the website form or legacy records are synced, they will instantly populate here.'}
          </p>
        </div>
      )}

      {/* Detail Modal / Drawer */}
      {selectedAppointment && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedAppointment(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <FileText className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Booking Record Overview</h3>
                  <p className="text-xs text-purple-200/80">Reference ID: {selectedAppointment.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[selectedAppointment.status as keyof typeof statusColors]}`}>
                  {selectedAppointment.status}
                </span>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              {/* Client Info Card */}
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Client Profile</h4>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Customer Name</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedAppointment.customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedAppointment.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email Address</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedAppointment.customer.email}</p>
                    </div>
                  </div>
                  {selectedAppointment.customer.address && (
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location Address</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedAppointment.customer.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service & Device Details */}
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Service & Hardware Specifications</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-purple-500/20">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Target Device</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{selectedAppointment.deviceType}</p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Model: {selectedAppointment.deviceModel}</p>
                      <span className="inline-block mt-2 px-2.5 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
                        {selectedAppointment.serviceType}
                      </span>
                    </div>
                  </div>
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Preferred Time Window</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{selectedAppointment.preferredDate}</p>
                      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Window: {selectedAppointment.preferredTime}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive Issue Description */}
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Client Problem Description</h4>
                <div className="bg-gray-50 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                  {selectedAppointment.issueDescription}
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-xs font-medium text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span>Created: {new Date(selectedAppointment.createdAt).toLocaleString()}</span>
                <span>Updated: {new Date(selectedAppointment.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Update Job Status</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedAppointment.id, 'cancelled')}
                      className="px-5 py-2.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 font-semibold text-sm transition-all"
                    >
                      Cancel Job
                    </button>
                    <button
                      onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all"
                    >
                      Confirm Booking
                    </button>
                  </>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                    className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-md transition-all"
                  >
                    Mark as Completed
                  </button>
                )}
                {(selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') && (
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold text-sm shadow transition-all"
                  >
                    Close Overview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
