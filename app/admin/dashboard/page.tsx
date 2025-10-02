'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn, getAdminSession, adminLogout } from '@/lib/admin-auth';
import { getAllBookings, updateBookingStatus, type BookingData } from '@/lib/unified-booking-storage';
import CloudSyncSetup from '@/components/CloudSyncSetup';
import { ThemeProvider, ThemeToggle } from '@/components/ThemeProvider';

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Check authentication on mount and auto-sync
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin/login');
      return;
    }
    
    const loadAndSync = async () => {
      loadBookings();
      
      // Only try server sync if we're not on GitHub Pages
      const isGitHubPages = window.location.hostname.includes('github.io') || 
                           !window.location.pathname.startsWith('/api/');
      
      if (isGitHubPages) {
        console.log('ℹ️ GitHub Pages detected - server sync not available');
        setSyncMessage(null);
        return;
      }
      
      try {
        setSyncMessage('Checking for new bookings...');
        console.log('🔍 Checking server for new bookings...');
        
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_bookings' })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success && result.bookings.length > 0) {
          // Merge with local bookings
          const localBookings = getAllBookings();
          const localIds = new Set(localBookings.map(b => b.trackingId));
          const newBookings = result.bookings.filter((b: any) => !localIds.has(b.trackingId));
          
          if (newBookings.length > 0) {
            // Save new bookings locally - fix the forEach logic
            const mergedBookings = [...localBookings, ...newBookings];
            localStorage.setItem('its_bookings', JSON.stringify(mergedBookings));
            
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
        console.log('ℹ️ Server sync not available (GitHub Pages mode):', error);
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
      
      // Auto-sync the updated booking to server (if available)
      const isGitHubPages = window.location.hostname.includes('github.io') || 
                           !window.location.pathname.startsWith('/api/');
      
      if (!isGitHubPages) {
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
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              console.log('✅ Booking update automatically synced via server');
            } else {
              console.log('⚠️ Server sync failed:', result.message);
            }
          } else {
            console.log('⚠️ Server sync failed: HTTP', response.status);
          }
        } catch (error) {
          console.log('ℹ️ Server sync not available (GitHub Pages mode):', error);
        }
      } else {
        console.log('ℹ️ GitHub Pages mode - server sync not available');
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
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt text-red-600 text-xl"></i>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                </div>
                <span className="text-gray-500 dark:text-gray-400">|</span>
                <p className="text-gray-600 dark:text-gray-300">IT Services Freetown</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {adminSession && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-clipboard-list text-blue-600 text-2xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{bookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-tools text-orange-600 text-2xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {bookings.filter(b => b.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-check text-green-600 text-2xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {bookings.filter(b => b.status === 'completed' || b.status === 'ready-for-pickup').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-clock text-yellow-600 text-2xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {bookings.filter(b => b.status === 'received' || b.status === 'diagnosed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Sync Setup */}
        <CloudSyncSetup onSyncComplete={loadBookings} />

        {/* Sync Message */}
        {syncMessage && (
          <div className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              {syncMessage}
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Bookings</h2>
              <div className="flex space-x-3">
                <button
                  onClick={loadBookings}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-lg text-sm transition-colors flex items-center"
                >
                  <i className="fas fa-refresh mr-2"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">No bookings yet</p>
              <p className="text-gray-500 dark:text-gray-400">Bookings will appear here when customers make appointments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tracking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {bookings.map((booking) => (
                    <tr key={booking.trackingId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 dark:text-white">{booking.trackingId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.customerName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.deviceType}</div>
                        <div className="text-sm text-gray-500">{booking.deviceModel}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.serviceType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(booking.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(booking)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
    </ThemeProvider>
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