'use client';

import { useState, useMemo } from 'react';
import { BookingData } from '@/lib/unified-booking-storage';
import { DashboardAnalytics } from '@/lib/dashboard-analytics';

interface RevenueAnalyticsProps {
  analytics: DashboardAnalytics;
  bookings: BookingData[];
}

export default function RevenueAnalytics({ analytics, bookings }: RevenueAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Calculate previous period for comparison
  const previousPeriodData = useMemo(() => {
    const now = new Date();
    let startDate: Date, endDate: Date;
    
    switch (selectedPeriod) {
      case 'daily':
        startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const previousBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= startDate && bookingDate <= endDate && booking.cost && booking.cost > 0;
    });

    return previousBookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);
  }, [selectedPeriod, bookings]);

  const getCurrentRevenue = () => {
    switch (selectedPeriod) {
      case 'daily': return analytics.dailyRevenue;
      case 'weekly': return analytics.weeklyRevenue;
      case 'monthly': return analytics.monthlyRevenue;
      default: return analytics.monthlyRevenue;
    }
  };

  const currentRevenue = getCurrentRevenue();
  const growthPercentage = previousPeriodData > 0 
    ? ((currentRevenue - previousPeriodData) / previousPeriodData) * 100 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'SLL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return 'fas fa-arrow-up';
    if (growth < 0) return 'fas fa-arrow-down';
    return 'fas fa-minus';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-chart-line text-green-600 mr-2"></i>
          Revenue Analytics
        </h3>
        
        {/* Period Selector */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Revenue Display */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-3">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(currentRevenue)}
          </span>
          <div className={`flex items-center text-sm font-medium ${getGrowthColor(growthPercentage)}`}>
            <i className={`${getGrowthIcon(growthPercentage)} mr-1`}></i>
            {Math.abs(growthPercentage).toFixed(1)}%
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} revenue
          {growthPercentage !== 0 && (
            <span className={`ml-2 ${getGrowthColor(growthPercentage)}`}>
              vs previous {selectedPeriod}
            </span>
          )}
        </p>
      </div>

      {/* Revenue Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <i className="fas fa-coins text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Avg Order Value</p>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(analytics.averageOrderValue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <i className="fas fa-calculator text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Revenue Growth</p>
              <p className="text-xl font-bold text-purple-900">
                {analytics.revenueGrowth.monthly > 0 ? '+' : ''}
                {analytics.revenueGrowth.monthly.toFixed(1)}%
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <i className="fas fa-trending-up text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Top Revenue Services */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Top Revenue Services</h4>
        <div className="space-y-2">
          {analytics.popularServices.slice(0, 5).map((service, index) => (
            <div key={service.service} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{service.service}</p>
                  <p className="text-xs text-gray-500">{service.count} bookings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(service.revenue)}
                </p>
                <p className="text-xs text-gray-500">
                  avg: {formatCurrency(service.count > 0 ? service.revenue / service.count : 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
          Revenue Insights
        </h4>
        <div className="space-y-1 text-sm text-gray-600">
          {analytics.revenueGrowth.monthly > 10 && (
            <p>• Strong monthly growth of {analytics.revenueGrowth.monthly.toFixed(1)}%</p>
          )}
          {analytics.averageOrderValue > 0 && (
            <p>• Average order value is {formatCurrency(analytics.averageOrderValue)}</p>
          )}
          {analytics.popularServices[0] && (
            <p>• "{analytics.popularServices[0].service}" is your top revenue service</p>
          )}
          {analytics.dailyRevenue > analytics.monthlyRevenue / 30 && (
            <p>• Today's revenue is above the monthly average</p>
          )}
        </div>
      </div>
    </div>
  );
}