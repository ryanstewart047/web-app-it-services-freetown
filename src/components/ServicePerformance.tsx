'use client';

import { useMemo } from 'react';
// import { DashboardAnalytics } from '@/lib/dashboard-analytics';
import { BookingData } from '@/lib/unified-booking-storage';

interface ServicePerformanceProps {
  analytics: any; // DashboardAnalytics;
  bookings: BookingData[];
}

export default function ServicePerformance({ analytics, bookings }: ServicePerformanceProps) {
  const performanceMetrics = useMemo(() => {
    // Calculate service efficiency scores
    const serviceScores = analytics.popularServices.map((service: any) => {
      const serviceBookings = bookings.filter(b => b.serviceType === service.service);
      const completed = serviceBookings.filter(b => b.status === 'completed' || b.status === 'ready-for-pickup').length;
      const completionRate = serviceBookings.length > 0 ? (completed / serviceBookings.length) * 100 : 0;
      
      // Calculate efficiency score based on completion rate and average time
      let efficiencyScore = completionRate * 0.6; // 60% weight for completion rate
      
      if (service.averageTime > 0) {
        // Lower average time = higher score (inverse relationship)
        const timeScore = Math.max(0, 100 - (service.averageTime * 10)); // Assuming ideal time is <10 days
        efficiencyScore += timeScore * 0.4; // 40% weight for time efficiency
      }

      return {
        ...service,
        completionRate,
        efficiencyScore: Math.min(100, efficiencyScore)
      };
    });

    // Find bottlenecks (services with low completion rates or long times)
    const bottlenecks = serviceScores
      .filter((service: any) => service.completionRate < 80 || service.averageTime > 7)
      .sort((a: any, b: any) => a.efficiencyScore - b.efficiencyScore);

    // Calculate busy times and workload distribution
    const hourlyDistribution = new Array(24).fill(0);
    const dailyDistribution = new Array(7).fill(0);
    
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt);
      hourlyDistribution[date.getHours()]++;
      dailyDistribution[date.getDay()]++;
    });

    const busyHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    const busiestDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      dailyDistribution.indexOf(Math.max(...dailyDistribution))
    ];

    return {
      serviceScores,
      bottlenecks,
      busyHour,
      busiestDay,
      hourlyDistribution,
      dailyDistribution
    };
  }, [analytics.popularServices, bookings]);

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (days: number) => {
    if (days < 1) return `${Math.round(days * 24)}h`;
    return `${days.toFixed(1)}d`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'SLL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-tachometer-alt text-indigo-600 mr-2"></i>
          Service Performance
        </h3>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-green-900">
                {analytics.serviceCompletionRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Avg Completion</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatTime(analytics.averageCompletionTime)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <i className="fas fa-clock text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Active Services</p>
              <p className="text-2xl font-bold text-purple-900">
                {analytics.popularServices.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <i className="fas fa-cogs text-purple-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Busy Time</p>
              <p className="text-xl font-bold text-orange-900">
                {performanceMetrics.busyHour}:00
              </p>
              <p className="text-xs text-orange-600">{performanceMetrics.busiestDay}</p>
            </div>
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
              <i className="fas fa-business-time text-orange-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Service Performance Table */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Service Efficiency Scores</h4>
        <div className="overflow-x-auto">
          <div className="space-y-3">
            {performanceMetrics.serviceScores.slice(0, 8).map((service: any, index: number) => (
              <div key={service.service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{service.service}</p>
                    <p className="text-xs text-gray-500">
                      {service.count} bookings • {formatCurrency(service.revenue)} revenue
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Completion Rate */}
                  <div className="text-center">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getCompletionColor(service.completionRate)}`}>
                      {service.completionRate.toFixed(0)}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">completion</p>
                  </div>

                  {/* Average Time */}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {service.averageTime > 0 ? formatTime(service.averageTime) : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">avg time</p>
                  </div>

                  {/* Efficiency Score */}
                  <div className="text-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getEfficiencyColor(service.efficiencyScore)}`}
                        style={{ width: `${service.efficiencyScore}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-900 font-medium mt-1">
                      {service.efficiencyScore.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Current Status Distribution</h4>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {analytics.statusDistribution.map((status: any) => (
            <div key={status.status} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                <i className={`fas ${getStatusIcon(status.status)} text-blue-600`}></i>
              </div>
              <p className="text-lg font-bold text-gray-900">{status.count}</p>
              <p className="text-xs text-gray-600 capitalize">
                {status.status.replace('-', ' ')}
              </p>
              <p className="text-xs text-gray-500">{status.percentage.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottlenecks & Recommendations */}
      {performanceMetrics.bottlenecks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
            Performance Bottlenecks
          </h4>
          <div className="space-y-2">
            {performanceMetrics.bottlenecks.slice(0, 3).map((service: any) => (
              <div key={service.service} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.service}</p>
                    <p className="text-xs text-gray-600">
                      {service.completionRate.toFixed(0)}% completion rate • 
                      {service.averageTime > 0 ? ` ${formatTime(service.averageTime)} avg time` : ' No time data'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-yellow-700">
                      Score: {service.efficiencyScore.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <i className="fas fa-chart-line text-indigo-500 mr-2"></i>
          Performance Insights
        </h4>
        <div className="space-y-1 text-sm text-gray-600">
          {analytics.serviceCompletionRate > 85 && (
            <p>• Excellent overall completion rate of {analytics.serviceCompletionRate.toFixed(1)}%</p>
          )}
          {analytics.averageCompletionTime < 5 && (
            <p>• Fast average completion time of {formatTime(analytics.averageCompletionTime)}</p>
          )}
          {analytics.popularServices[0] && (
            <p>• &ldquo;{analytics.popularServices[0].service}&rdquo; is your most requested service</p>
          )}
          <p>• Busiest time is {performanceMetrics.busyHour}:00 on {performanceMetrics.busiestDay}s</p>
          {performanceMetrics.bottlenecks.length > 0 && (
            <p>• Consider optimizing {performanceMetrics.bottlenecks[0].service} workflow</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for status icons
function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    'received': 'fa-inbox',
    'diagnosed': 'fa-search',
    'in-progress': 'fa-tools',
    'completed': 'fa-check-circle',
    'ready-for-pickup': 'fa-bell'
  };
  return icons[status] || 'fa-question-circle';
}