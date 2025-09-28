'use client';

import { BookingData } from './unified-booking-storage';
import { DashboardAnalytics } from './dashboard-analytics';

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel-csv';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeFields: string[];
  groupBy?: 'none' | 'status' | 'service' | 'month';
}

// Export bookings data
export function exportBookings(bookings: BookingData[], options: ExportOptions): string | Blob {
  let filteredBookings = bookings;

  // Apply date range filter
  if (options.dateRange) {
    filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= options.dateRange!.start && bookingDate <= options.dateRange!.end;
    });
  }

  switch (options.format) {
    case 'csv':
      return exportToCSV(filteredBookings, options);
    case 'excel-csv':
      return exportToExcelCSV(filteredBookings, options);
    case 'json':
      return exportToJSON(filteredBookings, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// Export analytics data
export function exportAnalytics(analytics: DashboardAnalytics, format: 'csv' | 'json' = 'json'): string {
  const analyticsData = {
    export_date: new Date().toISOString(),
    revenue_analytics: {
      total_revenue: analytics.totalRevenue,
      monthly_revenue: analytics.monthlyRevenue,
      weekly_revenue: analytics.weeklyRevenue,
      daily_revenue: analytics.dailyRevenue,
      average_order_value: analytics.averageOrderValue,
      revenue_growth: analytics.revenueGrowth
    },
    customer_analytics: {
      total_customers: analytics.totalCustomers,
      new_customers: analytics.newCustomers,
      returning_customers: analytics.returningCustomers,
      customer_retention_rate: analytics.customerRetentionRate,
      popular_device_types: analytics.popularDeviceTypes
    },
    service_analytics: {
      popular_services: analytics.popularServices,
      service_completion_rate: analytics.serviceCompletionRate,
      average_completion_time: analytics.averageCompletionTime,
      status_distribution: analytics.statusDistribution
    },
    operational_metrics: {
      busy_hours: analytics.busyHours,
      busy_days: analytics.busyDays,
      daily_bookings: analytics.dailyBookingsCount,
      monthly_trends: analytics.monthlyTrends
    }
  };

  if (format === 'csv') {
    return convertAnalyticsToCSV(analyticsData);
  }

  return JSON.stringify(analyticsData, null, 2);
}

// CSV Export Functions
function exportToCSV(bookings: BookingData[], options: ExportOptions): string {
  if (bookings.length === 0) {
    return 'No data to export';
  }

  // Define all possible fields
  const allFields = [
    'trackingId', 'customerName', 'email', 'phone', 'address',
    'deviceType', 'deviceModel', 'serviceType', 'issueDescription',
    'preferredDate', 'preferredTime', 'status', 'createdAt', 'updatedAt',
    'cost', 'estimatedCompletion', 'notes'
  ];

  // Use selected fields or all fields
  const fields = options.includeFields.length > 0 ? options.includeFields : allFields;

  // Create CSV header
  const header = fields.join(',');

  // Create CSV rows
  const rows = bookings.map(booking => {
    return fields.map(field => {
      let value = booking[field as keyof BookingData] || '';
      
      // Format dates
      if ((field === 'createdAt' || field === 'updatedAt' || field === 'estimatedCompletion') && value) {
        value = new Date(value as string).toLocaleDateString();
      }
      
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

// Excel-compatible CSV export with BOM for proper UTF-8 handling
function exportToExcelCSV(bookings: BookingData[], options: ExportOptions): string {
  if (bookings.length === 0) {
    return 'No data to export';
  }

  // Define all possible fields with Excel-friendly headers
  const fieldMapping = {
    trackingId: 'Tracking ID',
    customerName: 'Customer Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address',
    deviceType: 'Device Type',
    deviceModel: 'Device Model',
    serviceType: 'Service Type',
    issueDescription: 'Issue Description',
    preferredDate: 'Preferred Date',
    preferredTime: 'Preferred Time',
    status: 'Status',
    createdAt: 'Date Created',
    updatedAt: 'Last Updated',
    cost: 'Cost (SLL)',
    estimatedCompletion: 'Estimated Completion',
    notes: 'Notes'
  };

  // Use selected fields or all fields
  const fields = options.includeFields.length > 0 ? options.includeFields : Object.keys(fieldMapping);

  // Create Excel-friendly header
  const header = fields.map(field => fieldMapping[field as keyof typeof fieldMapping] || field).join(',');

  // Create CSV rows with proper Excel formatting
  const rows = bookings.map(booking => {
    return fields.map(field => {
      let value = booking[field as keyof BookingData] || '';
      
      // Format dates for Excel
      if ((field === 'createdAt' || field === 'updatedAt' || field === 'estimatedCompletion') && value) {
        const date = new Date(value as string);
        value = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) + ' ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      
      // Format currency
      if (field === 'cost' && typeof value === 'number') {
        value = value.toFixed(2);
      }
      
      // Format status to be more readable
      if (field === 'status' && typeof value === 'string') {
        value = value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // Escape commas, quotes, and newlines for Excel
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
          value = `"${value.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, ' ')}"`;
        }
      }
      
      return value;
    }).join(',');
  });

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  return BOM + [header, ...rows].join('\r\n'); // Use Windows line endings for Excel
}

// JSON Export Functions
function exportToJSON(bookings: BookingData[], options: ExportOptions): string {
  const exportData = {
    export_info: {
      date: new Date().toISOString(),
      total_records: bookings.length,
      date_range: options.dateRange ? {
        start: options.dateRange.start.toISOString(),
        end: options.dateRange.end.toISOString()
      } : null,
      fields_included: options.includeFields.length > 0 ? options.includeFields : 'all'
    },
    bookings: options.groupBy === 'none' || !options.groupBy 
      ? bookings 
      : groupBookings(bookings, options.groupBy)
  };

  return JSON.stringify(exportData, null, 2);
}

// Helper Functions
function groupBookings(bookings: BookingData[], groupBy: string): any {
  const grouped: any = {};

  bookings.forEach(booking => {
    let key: string;
    
    switch (groupBy) {
      case 'status':
        key = booking.status;
        break;
      case 'service':
        key = booking.serviceType || 'Unknown';
        break;
      case 'month':
        key = new Date(booking.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        break;
      default:
        key = 'all';
        break;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(booking);
  });

  // Add summary for each group
  Object.keys(grouped).forEach(key => {
    const groupBookings = grouped[key];
    const totalRevenue = groupBookings.reduce((sum: number, booking: BookingData) => 
      sum + (booking.cost || 0), 0);
    
    grouped[key] = {
      summary: {
        count: groupBookings.length,
        total_revenue: totalRevenue,
        average_revenue: groupBookings.length > 0 ? totalRevenue / groupBookings.length : 0
      },
      bookings: groupBookings
    };
  });

  return grouped;
}

function convertAnalyticsToCSV(analyticsData: any): string {
  const csvSections = [];

  // Revenue Analytics
  csvSections.push('REVENUE ANALYTICS');
  csvSections.push('Metric,Value');
  csvSections.push(`Total Revenue,${analyticsData.revenue_analytics.total_revenue}`);
  csvSections.push(`Monthly Revenue,${analyticsData.revenue_analytics.monthly_revenue}`);
  csvSections.push(`Weekly Revenue,${analyticsData.revenue_analytics.weekly_revenue}`);
  csvSections.push(`Daily Revenue,${analyticsData.revenue_analytics.daily_revenue}`);
  csvSections.push(`Average Order Value,${analyticsData.revenue_analytics.average_order_value}`);
  csvSections.push('');

  // Customer Analytics
  csvSections.push('CUSTOMER ANALYTICS');
  csvSections.push('Metric,Value');
  csvSections.push(`Total Customers,${analyticsData.customer_analytics.total_customers}`);
  csvSections.push(`New Customers,${analyticsData.customer_analytics.new_customers}`);
  csvSections.push(`Returning Customers,${analyticsData.customer_analytics.returning_customers}`);
  csvSections.push(`Retention Rate,${analyticsData.customer_analytics.customer_retention_rate}%`);
  csvSections.push('');

  // Popular Services
  csvSections.push('POPULAR SERVICES');
  csvSections.push('Service,Count,Revenue,Average Time');
  analyticsData.service_analytics.popular_services.forEach((service: any) => {
    csvSections.push(`${service.service},${service.count},${service.revenue},${service.averageTime}`);
  });

  return csvSections.join('\n');
}

// Download Functions
export function downloadFile(content: string | Blob, filename: string, contentType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}

// Generate filename with timestamp
export function generateFilename(prefix: string, format: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const extension = format === 'excel-csv' ? 'csv' : format;
  return `${prefix}_${timestamp}.${extension}`;
}

// Get content type for download
export function getContentType(format: string): string {
  switch (format) {
    case 'csv':
    case 'excel-csv':
      return 'text/csv;charset=utf-8';
    case 'json':
      return 'application/json;charset=utf-8';
    default:
      return 'text/plain;charset=utf-8';
  }
}

// Preset export configurations
export const exportPresets = {
  // Complete booking export (Excel-friendly)
  complete: {
    format: 'excel-csv' as const,
    includeFields: [
      'trackingId', 'customerName', 'email', 'phone', 'deviceType', 
      'deviceModel', 'serviceType', 'status', 'createdAt', 'cost'
    ],
    groupBy: 'none' as const
  },
  
  // Financial report (Excel-friendly)
  financial: {
    format: 'excel-csv' as const,
    includeFields: [
      'trackingId', 'customerName', 'serviceType', 'status', 
      'createdAt', 'cost', 'estimatedCompletion'
    ],
    groupBy: 'month' as const
  },
  
  // Customer report (Excel-friendly)
  customer: {
    format: 'excel-csv' as const,
    includeFields: [
      'customerName', 'email', 'phone', 'address', 'deviceType', 
      'serviceType', 'createdAt', 'status'
    ],
    groupBy: 'none' as const
  },
  
  // Service performance report (Excel-friendly)
  service: {
    format: 'excel-csv' as const,
    includeFields: [
      'serviceType', 'deviceType', 'status', 'createdAt', 
      'estimatedCompletion', 'cost'
    ],
    groupBy: 'service' as const
  }
};