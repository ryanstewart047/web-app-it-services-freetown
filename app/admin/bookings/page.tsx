'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Smartphone, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
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
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
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

  useEffect(() => {
    fetchAppointments();
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

  const updateStatus = async (id: string, newStatus: string) => {
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

      await fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(error instanceof Error ? error.message : 'Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer.phone.includes(searchTerm);
    
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookings & Appointments</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage customer appointments and service bookings
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-300">Database Configuration Required</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                Please see <code className="px-2 py-1 bg-red-100 dark:bg-red-900/40 rounded">DATABASE_SETUP_REQUIRED.md</code> for setup instructions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{stats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Confirmed</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.confirmed}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 dark:text-red-400">Cancelled</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Idle Warning Banner */}
      {showIdleWarning && (
        <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-xl"></i>
            <span className="font-semibold">
              Your session will expire in {getRemainingTime()} seconds due to inactivity. Move your mouse to stay logged in.
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, device, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
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
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Main Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {appointment.customer.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          📧 {appointment.customer.email}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          📱 {appointment.customer.phone}
                        </span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusColors[appointment.status as keyof typeof statusColors]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Smartphone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {appointment.deviceType} - {appointment.deviceModel}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Service: {appointment.serviceType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {appointment.preferredDate}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Time: {appointment.preferredTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Description:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.issueDescription}</p>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Created: {new Date(appointment.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(appointment.id, 'confirmed')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(appointment.id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(appointment.id, 'completed')}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                    >
                      Complete
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
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No appointments found' : 'No appointments yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Appointments will appear here when customers book services'}
          </p>
        </div>
      )}
    </div>
  );
}
