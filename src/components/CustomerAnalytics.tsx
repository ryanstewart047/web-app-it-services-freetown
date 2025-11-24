'use client';

import { useMemo } from 'react';
// import { DashboardAnalytics } from '@/lib/dashboard-analytics';
import { BookingData } from '@/lib/unified-booking-storage';

interface CustomerAnalyticsProps {
  analytics: any; // DashboardAnalytics;
  bookings: BookingData[];
}

export default function CustomerAnalytics({ analytics, bookings }: CustomerAnalyticsProps) {
  // Enhanced customer insights
  const customerInsights = useMemo(() => {
    // Customer lifetime value
    const customerEmails = new Map<string, { bookings: number; revenue: number; lastBooking: Date }>();
    
    bookings.forEach(booking => {
      const email = booking.email.toLowerCase();
      const current = customerEmails.get(email) || { bookings: 0, revenue: 0, lastBooking: new Date(0) };
      
      current.bookings += 1;
      current.revenue += booking.cost || 0;
      current.lastBooking = new Date(Math.max(current.lastBooking.getTime(), new Date(booking.createdAt).getTime()));
      
      customerEmails.set(email, current);
    });

    // VIP customers (top 20% by revenue)
    const sortedCustomers = Array.from(customerEmails.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue);
    
    const vipThreshold = Math.ceil(sortedCustomers.length * 0.2);
    const vipCustomers = sortedCustomers.slice(0, vipThreshold);
    const vipRevenue = vipCustomers.reduce((sum, [_, data]) => sum + data.revenue, 0);
    
    // Recent customers (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCustomers = Array.from(customerEmails.entries())
      .filter(([_, data]) => data.lastBooking >= thirtyDaysAgo);

    // Average customer lifetime value
    const avgLifetimeValue = sortedCustomers.length > 0 
      ? sortedCustomers.reduce((sum, [_, data]) => sum + data.revenue, 0) / sortedCustomers.length 
      : 0;

    return {
      vipCustomers: vipCustomers.length,
      vipRevenue,
      vipPercentage: analytics.totalRevenue > 0 ? (vipRevenue / analytics.totalRevenue) * 100 : 0,
      recentCustomers: recentCustomers.length,
      avgLifetimeValue,
      topCustomers: vipCustomers.slice(0, 5).map(([email, data]) => ({
        email: email.replace(/(.{3}).*@/, '$1***@'), // Mask email for privacy
        bookings: data.bookings,
        revenue: data.revenue,
        lastBooking: data.lastBooking
      }))
    };
  }, [bookings, analytics.totalRevenue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'SLL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRetentionColor = (rate: number) => {
    if (rate >= 30) return 'text-green-600 bg-green-100';
    if (rate >= 15) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-users text-red-600 mr-2"></i>
          Customer Analytics
        </h3>
      </div>

      {/* Customer Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-[#040e40]">{analytics.totalCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
              <i className="fas fa-user-friends text-red-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">New Customers</p>
              <p className="text-2xl font-bold text-green-900">{analytics.newCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <i className="fas fa-user-plus text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#040e40] font-medium">Returning</p>
              <p className="text-2xl font-bold text-[#040e40]">{analytics.returningCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <i className="fas fa-redo text-[#040e40]"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">VIP Customers</p>
              <p className="text-2xl font-bold text-orange-900">{customerInsights.vipCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
              <i className="fas fa-crown text-orange-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Retention Rate */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-gray-900">Customer Retention</h4>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getRetentionColor(analytics.customerRetentionRate)}`}>
              {analytics.customerRetentionRate.toFixed(1)}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-600 to-[#040e40] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(analytics.customerRetentionRate, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {analytics.returningCustomers} out of {analytics.totalCustomers} customers have returned
          </p>
        </div>

        {/* Average Lifetime Value */}
        <div className="border rounded-lg p-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Customer Value</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Lifetime Value:</span>
              <span className="text-sm font-semibold">{formatCurrency(customerInsights.avgLifetimeValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">VIP Revenue Share:</span>
              <span className="text-sm font-semibold">{customerInsights.vipPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recent Active:</span>
              <span className="text-sm font-semibold">{customerInsights.recentCustomers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device Types Distribution */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Popular Device Types</h4>
        <div className="space-y-3">
          {analytics.popularDeviceTypes.slice(0, 6).map((device: any, index: number) => (
            <div key={device.type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-mobile-alt text-indigo-600 text-sm"></i>
                </div>
                <span className="text-sm font-medium text-gray-900">{device.type}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 min-w-[60px] text-right">
                  {device.count} ({device.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Customers */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Top Customers</h4>
        <div className="space-y-2">
          {customerInsights.topCustomers.map((customer, index) => (
            <div key={customer.email} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-medal text-yellow-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                  <p className="text-xs text-gray-500">
                    {customer.bookings} booking{customer.bookings !== 1 ? 's' : ''} • 
                    Last: {customer.lastBooking.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(customer.revenue)}
                </p>
                <p className="text-xs text-gray-500">lifetime value</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <i className="fas fa-brain text-red-600 mr-2"></i>
          Customer Insights
        </h4>
        <div className="space-y-1 text-sm text-gray-600">
          {analytics.customerRetentionRate > 25 && (
            <p>• Great customer retention rate of {analytics.customerRetentionRate.toFixed(1)}%</p>
          )}
          {customerInsights.vipPercentage > 40 && (
            <p>• Top 20% of customers generate {customerInsights.vipPercentage.toFixed(1)}% of revenue</p>
          )}
          {analytics.popularDeviceTypes[0] && (
            <p>• {analytics.popularDeviceTypes[0].type} devices are most popular</p>
          )}
          {analytics.newCustomers > analytics.returningCustomers && (
            <p>• Strong new customer acquisition this period</p>
          )}
        </div>
      </div>
    </div>
  );
}