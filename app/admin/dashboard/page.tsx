'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn, getAdminSession, adminLogout } from '@/lib/admin-auth';
import { getAllBookings, updateBookingStatus, type BookingData } from '@/lib/unified-booking-storage';
import { generateDashboardAnalytics, getQuickStats, type DashboardAnalytics } from '@/lib/dashboard-analytics';
import CloudSyncSetup from '@/components/CloudSyncSetup';
import RevenueAnalytics from '../../../src/components/RevenueAnalytics';
import CustomerAnalytics from '../../../src/components/CustomerAnalytics';
import ServicePerformance from '../../../src/components/ServicePerformance';
import ActivityFeed from '../../../src/components/ActivityFeed';
import DataExport from '../../../src/components/DataExport';

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [quickStats, setQuickStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers' | 'services' | 'activity' | 'export'>('overview');

  // Check authentication on mount and auto-sync
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin/login');
      return;
    }
    
    const loadAndSync = async () => {
      loadBookings();
      try {
        setSyncMessage('Checking for new bookings...');
        console.log('🔍 Checking server for new bookings...');
        
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_bookings' })
        });
        
        const result = await response.json();
        if (result.success && result.bookings.length > 0) {
          // Merge with local bookings
          const localBookings = getAllBookings();
          const localIds = new Set(localBookings.map(b => b.trackingId));
          const newBookings = result.bookings.filter((b: any) => !localIds.has(b.trackingId));
          
          if (newBookings.length > 0) {
            // Save new bookings locally
            newBookings.forEach((booking: any) => {
              localStorage.setItem('its_bookings', JSON.stringify([...localBookings, ...newBookings]));
            });
            
            console.log('✅ Found', newBookings.length, 'new bookings from server');
            setSyncMessage(`Auto-synced ${newBookings.length} new bookings from server`);
            loadBookings(); // Refresh the bookings list
            setTimeout(() => setSyncMessage(null), 5000);
          } else {
            console.log('ℹ️ No new bookings found on server');
            setSyncMessage(null);
          }
        } else {
          console.log('ℹ️ No bookings found on server');
          setSyncMessage(null);
        }
      } catch (error) {
        console.error('❌ Server sync on load failed:', error);
        setSyncMessage(null);
      }
    };
    
    loadAndSync();
  }, [router]);

  const loadBookings = () => {
    setLoading(true);
    try {
      const allBookings = getAllBookings();
      // Sort by creation date (newest first)
      allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(allBookings);
      
      // Generate analytics
      const analyticsData = generateDashboardAnalytics(allBookings);
      setAnalytics(analyticsData);
      
      // Generate quick stats
      const quickStatsData = getQuickStats(allBookings);
      setQuickStats(quickStatsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  };

  const openEditModal = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedBooking(null);
    setIsEditModalOpen(false);
  };

  const handleUpdateBooking = async (updatedBooking: BookingData) => {
    const success = updateBookingStatus(
      updatedBooking.trackingId,
      updatedBooking.status,
      updatedBooking.notes,
      updatedBooking.estimatedCompletion,
      updatedBooking.cost
    );

    if (success) {
      loadBookings(); // Refresh the list
      closeEditModal();
      
      // Auto-sync the updated booking to server
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_booking',
            booking: {
              ...updatedBooking,
              createdAt: updatedBooking.createdAt || new Date().toISOString()
            }
          })
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('✅ Booking update automatically synced via server');
        } else {
          console.log('⚠️ Server sync failed:', result.message);
        }
      } catch (error) {
        console.log('⚠️ Server sync after update failed:', error);
      }
    } else {
      alert('Failed to update booking. Please try again.');
    }
  };

  const getStatusBadge = (status: BookingData['status']) => {
    const statusConfig = {
      'received': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'fas fa-inbox' },
      'diagnosed': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'fas fa-search' },
      'in-progress': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: 'fas fa-tools' },
      'completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: 'fas fa-check' },
      'ready-for-pickup': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: 'fas fa-bell' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color} flex items-center w-fit`}>
        <i className={`${config.icon} mr-2`}></i>
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const adminSession = getAdminSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-shield-alt text-red-600 text-xl"></i>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <span className="text-gray-500">|</span>
              <p className="text-gray-600">IT Services Freetown</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {adminSession && (
                <div className="text-sm text-gray-600">
                  <i className="fas fa-user mr-1"></i>
                  Welcome, {adminSession.username}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards with Quick Stats */}
        {quickStats && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-clipboard-list text-blue-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Total</p>
                  <p className="text-lg font-semibold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-calendar-day text-green-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Today</p>
                  <p className="text-lg font-semibold text-gray-900">{quickStats.todayBookings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-tools text-orange-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">In Progress</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {bookings.filter(b => b.status === 'in-progress').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Urgent</p>
                  <p className="text-lg font-semibold text-gray-900">{quickStats.urgentBookings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Today Revenue</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Intl.NumberFormat('en-SL', {
                      style: 'currency',
                      currency: 'SLL',
                      minimumFractionDigits: 0
                    }).format(quickStats.todayRevenue)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">This Month</p>
                  <p className="text-lg font-semibold text-gray-900">{quickStats.monthlyBookings}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cloud Sync Setup */}
        <CloudSyncSetup onSyncComplete={loadBookings} />

        {/* Sync Message */}
        {syncMessage && (
          <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              {syncMessage}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: 'fa-tachometer-alt' },
                { id: 'revenue', label: 'Revenue', icon: 'fa-chart-line' },
                { id: 'customers', label: 'Customers', icon: 'fa-users' },
                { id: 'services', label: 'Services', icon: 'fa-cogs' },
                { id: 'activity', label: 'Activity', icon: 'fa-stream' },
                { id: 'export', label: 'Export', icon: 'fa-download' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`fas ${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {analytics && (
          <div>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  {/* Bookings Table */}
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                        <div className="flex space-x-3">
                          <button
                            onClick={loadBookings}
                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors flex items-center"
                          >
                            <i className="fas fa-refresh mr-2"></i>
                            Refresh
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {bookings.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
                          <p className="text-gray-600 text-lg mb-2">No bookings yet</p>
                          <p className="text-gray-500">Bookings will appear here when customers make appointments</p>
                        </div>
                      ) : (
                        <div className="space-y-2 p-4">
                          {bookings.slice(0, 10).map((booking) => (
                            <div key={booking.trackingId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <i className="fas fa-mobile-alt text-indigo-600"></i>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{booking.customerName}</p>
                                  <p className="text-sm text-gray-600">{booking.deviceType} - {booking.serviceType}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(booking.status)}
                                <p className="text-xs text-gray-500 mt-1">{formatDate(booking.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <ActivityFeed bookings={bookings} maxItems={15} />
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <RevenueAnalytics analytics={analytics} bookings={bookings} />
            )}

            {activeTab === 'customers' && (
              <CustomerAnalytics analytics={analytics} bookings={bookings} />
            )}

            {activeTab === 'services' && (
              <ServicePerformance analytics={analytics} bookings={bookings} />
            )}

            {activeTab === 'activity' && (
              <ActivityFeed bookings={bookings} maxItems={50} />
            )}

            {activeTab === 'export' && (
              <DataExport bookings={bookings} analytics={analytics} />
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          onClose={closeEditModal}
          onUpdate={handleUpdateBooking}
        />
      )}
    </div>
  );
}

// Edit Booking Modal Component
function EditBookingModal({ 
  booking, 
  onClose, 
  onUpdate 
}: { 
  booking: BookingData;
  onClose: () => void;
  onUpdate: (booking: BookingData) => void;
}) {
  const [formData, setFormData] = useState({
    status: booking.status,
    notes: booking.notes || '',
    estimatedCompletion: booking.estimatedCompletion || '',
    cost: booking.cost || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...booking,
      ...formData
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Update Booking</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracking ID
            </label>
            <input
              type="text"
              value={booking.trackingId}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <input
              type="text"
              value={booking.customerName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="received">Received</option>
              <option value="diagnosed">Diagnosed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="ready-for-pickup">Ready for Pickup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Completion
            </label>
            <input
              type="text"
              name="estimatedCompletion"
              value={formData.estimatedCompletion}
              onChange={handleChange}
              placeholder="e.g., Tomorrow 2:00 PM, Ready now"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost (Le)
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add notes about the repair progress..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}