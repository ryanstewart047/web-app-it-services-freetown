'use client';

import { useMemo } from 'react';
import { BookingData } from '@/lib/unified-booking-storage';

interface ActivityFeedProps {
  bookings: BookingData[];
  maxItems?: number;
}

interface ActivityItem {
  id: string;
  type: 'booking_created' | 'status_changed' | 'milestone' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

export default function ActivityFeed({ bookings, maxItems = 20 }: ActivityFeedProps) {
  const activities = useMemo(() => {
    const activityList: ActivityItem[] = [];

    // Generate activities from bookings
    bookings.forEach(booking => {
      // Booking created activity
      activityList.push({
        id: `booking-${booking.trackingId}`,
        type: 'booking_created',
        title: 'New Booking Received',
        description: `${booking.customerName} booked ${booking.serviceType} for ${booking.deviceType}`,
        timestamp: new Date(booking.createdAt),
        icon: 'fa-plus-circle',
        color: 'text-blue-600 bg-blue-100',
        priority: 'medium',
        data: booking
      });

      // Status change activities (simulate based on current status)
      if (booking.status !== 'received') {
        const statusTimestamp = new Date(booking.updatedAt || booking.createdAt);
        
        activityList.push({
          id: `status-${booking.trackingId}-${booking.status}`,
          type: 'status_changed',
          title: `Status Updated`,
          description: `${booking.customerName}'s ${booking.deviceType} moved to ${booking.status.replace('-', ' ')}`,
          timestamp: statusTimestamp,
          icon: getStatusIcon(booking.status),
          color: getStatusColor(booking.status),
          priority: booking.status === 'ready-for-pickup' ? 'high' : 'medium',
          data: booking
        });
      }

      // Milestone activities
      if (booking.cost && booking.cost > 0) {
        activityList.push({
          id: `cost-${booking.trackingId}`,
          type: 'milestone',
          title: 'Service Cost Updated',
          description: `${booking.customerName}'s repair quoted at ${formatCurrency(booking.cost)}`,
          timestamp: new Date(booking.updatedAt || booking.createdAt),
          icon: 'fa-dollar-sign',
          color: 'text-green-600 bg-green-100',
          priority: 'low',
          data: booking
        });
      }

      // Alert for long-pending bookings
      const daysSinceCreated = (Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated > 7 && (booking.status === 'received' || booking.status === 'diagnosed')) {
        activityList.push({
          id: `alert-${booking.trackingId}`,
          type: 'alert',
          title: 'Long Pending Booking',
          description: `${booking.customerName}'s ${booking.deviceType} has been pending for ${Math.floor(daysSinceCreated)} days`,
          timestamp: new Date(booking.createdAt),
          icon: 'fa-exclamation-triangle',
          color: 'text-red-600 bg-red-100',
          priority: 'high',
          data: booking
        });
      }
    });

    // Sort by timestamp (newest first) and priority
    return activityList
      .sort((a, b) => {
        // First sort by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Then by timestamp
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, maxItems);
  }, [bookings, maxItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'SLL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="fas fa-stream text-purple-600 mr-2"></i>
            Recent Activity
          </h3>
        </div>
        <div className="text-center py-8">
          <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-500">No recent activity to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-stream text-purple-600 mr-2"></i>
          Recent Activity
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <i className="fas fa-clock"></i>
          <span>Last {activities.length} activities</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity.id} className={`relative flex items-start space-x-4 ${
            activity.priority === 'high' ? 'ring-1 ring-red-200 rounded-lg p-3 bg-red-50' : 
            activity.priority === 'medium' ? 'ring-1 ring-yellow-200 rounded-lg p-3 bg-yellow-50' : 
            'p-3'
          }`}>
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-6 top-12 w-px h-8 bg-gray-200"></div>
            )}
            
            {/* Activity Icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
              <i className={`fas ${activity.icon} text-sm`}></i>
            </div>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  {activity.priority === 'high' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                      High Priority
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              
              {/* Additional Info */}
              {activity.data && (
                <div className="mt-2">
                  {activity.type === 'booking_created' && (
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>📧 {activity.data.email}</span>
                      <span>📱 {activity.data.phone}</span>
                      <span>🆔 {activity.data.trackingId}</span>
                    </div>
                  )}
                  {activity.type === 'status_changed' && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(activity.data.status)} border`}>
                        {activity.data.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                  {activity.type === 'alert' && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <p className="text-red-700">
                        <i className="fas fa-info-circle mr-1"></i>
                        Consider following up with the customer or updating the status.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600">
              {activities.filter(a => a.type === 'booking_created').length}
            </p>
            <p className="text-xs text-gray-600">New Bookings</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">
              {activities.filter(a => a.type === 'status_changed').length}
            </p>
            <p className="text-xs text-gray-600">Status Changes</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">
              {activities.filter(a => a.type === 'milestone').length}
            </p>
            <p className="text-xs text-gray-600">Milestones</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600">
              {activities.filter(a => a.type === 'alert').length}
            </p>
            <p className="text-xs text-gray-600">Alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
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

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'received': 'text-blue-600 bg-blue-100',
    'diagnosed': 'text-yellow-600 bg-yellow-100',
    'in-progress': 'text-orange-600 bg-orange-100',
    'completed': 'text-green-600 bg-green-100',
    'ready-for-pickup': 'text-purple-600 bg-purple-100'
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
}