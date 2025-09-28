// Dashboard Analytics Service
// Provides comprehensive business intelligence and data analysis

import { BookingData } from './unified-booking-storage';

export interface DashboardAnalytics {
  // Revenue Analytics
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  averageOrderValue: number;
  revenueGrowth: {
    monthly: number;
    weekly: number;
  };

  // Customer Analytics
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  popularDeviceTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;

  // Service Analytics
  popularServices: Array<{
    service: string;
    count: number;
    revenue: number;
    averageTime: number;
  }>;
  serviceCompletionRate: number;
  averageCompletionTime: number;

  // Performance Metrics
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  dailyBookingsCount: Array<{
    date: string;
    count: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    bookings: number;
    revenue: number;
    completionRate: number;
  }>;

  // Operational Metrics
  busyHours: Array<{
    hour: number;
    count: number;
  }>;
  busyDays: Array<{
    day: string;
    count: number;
  }>;
  averageResponseTime: number;
  customerSatisfactionScore?: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

// Generate comprehensive analytics from booking data
export function generateDashboardAnalytics(bookings: BookingData[], timeRange?: TimeRange): DashboardAnalytics {
  // Filter bookings by time range if provided
  let filteredBookings = bookings;
  if (timeRange) {
    filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= timeRange.start && bookingDate <= timeRange.end;
    });
  }

  // Revenue Analytics
  const revenueBookings = filteredBookings.filter(b => b.cost && b.cost > 0);
  const totalRevenue = revenueBookings.reduce((sum, b) => sum + (b.cost || 0), 0);
  const averageOrderValue = revenueBookings.length > 0 ? totalRevenue / revenueBookings.length : 0;

  // Time-based revenue calculations
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const monthlyRevenue = calculateRevenueInPeriod(bookings, thirtyDaysAgo, now);
  const weeklyRevenue = calculateRevenueInPeriod(bookings, sevenDaysAgo, now);
  const dailyRevenue = calculateRevenueInPeriod(bookings, oneDayAgo, now);

  // Customer Analytics
  const uniqueEmails = new Set(filteredBookings.map(b => b.email.toLowerCase()));
  const totalCustomers = uniqueEmails.size;
  
  const newCustomerEmails = new Set<string>();
  const returningCustomerEmails = new Set<string>();
  
  uniqueEmails.forEach(email => {
    const customerBookings = filteredBookings.filter(b => b.email.toLowerCase() === email);
    if (customerBookings.length === 1) {
      newCustomerEmails.add(email);
    } else {
      returningCustomerEmails.add(email);
    }
  });

  const newCustomers = newCustomerEmails.size;
  const returningCustomers = returningCustomerEmails.size;
  const customerRetentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

  // Popular Device Types
  const deviceCounts = new Map<string, number>();
  filteredBookings.forEach(booking => {
    const device = booking.deviceType || 'Unknown';
    deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
  });

  const popularDeviceTypes = Array.from(deviceCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: (count / filteredBookings.length) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // Service Analytics
  const serviceCounts = new Map<string, { count: number; revenue: number; completionTimes: number[] }>();
  filteredBookings.forEach(booking => {
    const service = booking.serviceType || 'General Repair';
    const current = serviceCounts.get(service) || { count: 0, revenue: 0, completionTimes: [] };
    
    current.count += 1;
    current.revenue += booking.cost || 0;
    
    // Calculate completion time if booking is completed
    if (booking.status === 'completed' && booking.estimatedCompletion) {
      const created = new Date(booking.createdAt);
      const completed = new Date(booking.estimatedCompletion);
      const timeDiff = completed.getTime() - created.getTime();
      if (timeDiff > 0) {
        current.completionTimes.push(timeDiff / (1000 * 60 * 60 * 24)); // days
      }
    }
    
    serviceCounts.set(service, current);
  });

  const popularServices = Array.from(serviceCounts.entries())
    .map(([service, data]) => ({
      service,
      count: data.count,
      revenue: data.revenue,
      averageTime: data.completionTimes.length > 0 
        ? data.completionTimes.reduce((sum, time) => sum + time, 0) / data.completionTimes.length 
        : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Performance Metrics
  const completedBookings = filteredBookings.filter(b => b.status === 'completed' || b.status === 'ready-for-pickup');
  const serviceCompletionRate = filteredBookings.length > 0 ? (completedBookings.length / filteredBookings.length) * 100 : 0;

  const allCompletionTimes = completedBookings
    .map(booking => {
      if (booking.estimatedCompletion) {
        const created = new Date(booking.createdAt);
        const completed = new Date(booking.estimatedCompletion);
        return completed.getTime() - created.getTime();
      }
      return null;
    })
    .filter(time => time !== null) as number[];

  const averageCompletionTime = allCompletionTimes.length > 0
    ? allCompletionTimes.reduce((sum, time) => sum + time, 0) / allCompletionTimes.length / (1000 * 60 * 60 * 24) // convert to days
    : 0;

  // Status Distribution
  const statusCounts = new Map<string, number>();
  filteredBookings.forEach(booking => {
    statusCounts.set(booking.status, (statusCounts.get(booking.status) || 0) + 1);
  });

  const statusDistribution = Array.from(statusCounts.entries())
    .map(([status, count]) => ({
      status,
      count,
      percentage: (count / filteredBookings.length) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // Daily Bookings Count (last 30 days)
  const dailyBookingsCount = generateDailyBookingsCounts(bookings, 30);

  // Monthly Trends (last 12 months)
  const monthlyTrends = generateMonthlyTrends(bookings, 12);

  // Busy Hours Analysis
  const hourCounts = new Array(24).fill(0);
  filteredBookings.forEach(booking => {
    const hour = new Date(booking.createdAt).getHours();
    hourCounts[hour]++;
  });

  const busyHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  // Busy Days Analysis
  const dayCounts = new Map<string, number>();
  filteredBookings.forEach(booking => {
    const day = new Date(booking.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });

  const busyDays = Array.from(dayCounts.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate revenue growth
  const previousMonthRevenue = calculateRevenueInPeriod(bookings, 
    new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000), 
    thirtyDaysAgo
  );
  const previousWeekRevenue = calculateRevenueInPeriod(bookings, 
    new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000), 
    sevenDaysAgo
  );

  const monthlyGrowth = previousMonthRevenue > 0 ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;
  const weeklyGrowth = previousWeekRevenue > 0 ? ((weeklyRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 : 0;

  return {
    totalRevenue,
    monthlyRevenue,
    weeklyRevenue,
    dailyRevenue,
    averageOrderValue,
    revenueGrowth: {
      monthly: monthlyGrowth,
      weekly: weeklyGrowth
    },
    totalCustomers,
    newCustomers,
    returningCustomers,
    customerRetentionRate,
    popularDeviceTypes,
    popularServices,
    serviceCompletionRate,
    averageCompletionTime,
    statusDistribution,
    dailyBookingsCount,
    monthlyTrends,
    busyHours,
    busyDays,
    averageResponseTime: 0 // Placeholder - would need response time tracking
  };
}

// Helper Functions
function calculateRevenueInPeriod(bookings: BookingData[], start: Date, end: Date): number {
  return bookings
    .filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= start && bookingDate <= end && booking.cost && booking.cost > 0;
    })
    .reduce((sum, booking) => sum + (booking.cost || 0), 0);
}

function generateDailyBookingsCounts(bookings: BookingData[], days: number): Array<{ date: string; count: number }> {
  const counts: Array<{ date: string; count: number }> = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const count = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate.toISOString().split('T')[0] === dateString;
    }).length;
    
    counts.push({ date: dateString, count });
  }
  
  return counts;
}

function generateMonthlyTrends(bookings: BookingData[], months: number): Array<{
  month: string;
  bookings: number;
  revenue: number;
  completionRate: number;
}> {
  const trends: Array<{
    month: string;
    bookings: number;
    revenue: number;
    completionRate: number;
  }> = [];
  
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= monthStart && bookingDate <= monthEnd;
    });
    
    const revenue = monthBookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);
    const completed = monthBookings.filter(b => b.status === 'completed' || b.status === 'ready-for-pickup').length;
    const completionRate = monthBookings.length > 0 ? (completed / monthBookings.length) * 100 : 0;
    
    trends.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      bookings: monthBookings.length,
      revenue,
      completionRate
    });
  }
  
  return trends;
}

// Quick Analytics for Real-time Display
export function getQuickStats(bookings: BookingData[]) {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    todayBookings: bookings.filter(b => new Date(b.createdAt) >= yesterday).length,
    weeklyBookings: bookings.filter(b => new Date(b.createdAt) >= thisWeek).length,
    monthlyBookings: bookings.filter(b => new Date(b.createdAt) >= thisMonth).length,
    todayRevenue: bookings
      .filter(b => new Date(b.createdAt) >= yesterday && b.cost)
      .reduce((sum, b) => sum + (b.cost || 0), 0),
    pendingBookings: bookings.filter(b => b.status === 'received' || b.status === 'diagnosed').length,
    urgentBookings: bookings.filter(b => {
      const created = new Date(b.createdAt);
      const daysSince = (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 3 && (b.status === 'received' || b.status === 'diagnosed');
    }).length
  };
}