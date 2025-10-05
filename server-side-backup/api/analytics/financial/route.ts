import { NextRequest, NextResponse } from 'next/server';

interface Transaction {
  id: string;
  timestamp: string;
  type: 'booking' | 'repair' | 'consultation' | 'product_sale' | 'subscription';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'crypto';
  customerId: string;
  customerName: string;
  customerEmail: string;
  description: string;
  category: string;
  taxAmount?: number;
  discountAmount?: number;
  processingFee?: number;
  metadata: {
    sessionId: string;
    deviceType: string;
    location?: string;
    referralSource?: string;
    campaignId?: string;
  };
}

interface FinancialAnalytics {
  revenue: {
    total: number;
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    previousMonth: number;
    growth: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  transactions: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    averageValue: number;
    conversionRate: number;
  };
  paymentMethods: Record<string, {
    count: number;
    amount: number;
    percentage: number;
  }>;
  categories: Record<string, {
    count: number;
    amount: number;
    percentage: number;
  }>;
  trends: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalSpent: number;
    transactionCount: number;
    averageOrderValue: number;
  }>;
  geography: Record<string, {
    count: number;
    amount: number;
  }>;
}

// In-memory storage
const transactions: Transaction[] = [];
const paymentAttempts = new Map<string, number>(); // Track conversion rate

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const transaction: Transaction = {
      id: generateTransactionId(),
      timestamp: new Date().toISOString(),
      type: data.type,
      amount: parseFloat(data.amount),
      currency: data.currency || 'SLL', // Sierra Leone Leone
      status: data.status || 'completed',
      paymentMethod: data.paymentMethod,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      description: data.description,
      category: data.category,
      taxAmount: data.taxAmount ? parseFloat(data.taxAmount) : undefined,
      discountAmount: data.discountAmount ? parseFloat(data.discountAmount) : undefined,
      processingFee: data.processingFee ? parseFloat(data.processingFee) : undefined,
      metadata: {
        sessionId: data.sessionId,
        deviceType: data.deviceType || 'unknown',
        location: data.location,
        referralSource: data.referralSource,
        campaignId: data.campaignId
      }
    };
    
    transactions.push(transaction);
    
    // Keep only last 10,000 transactions
    if (transactions.length > 10000) {
      transactions.splice(0, transactions.length - 10000);
    }
    
    return NextResponse.json({ 
      success: true, 
      transactionId: transaction.id,
      message: 'Transaction recorded' 
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    // Track payment attempt for conversion rate calculation
    paymentAttempts.set(sessionId, Date.now());
    
    return NextResponse.json({ success: true, message: 'Payment attempt recorded' });
  } catch (error) {
    console.error('Error recording payment attempt:', error);
    return NextResponse.json({ error: 'Failed to record attempt' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const currency = searchParams.get('currency') || 'SLL';
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const filteredTransactions = transactions.filter(
      transaction => new Date(transaction.timestamp) >= startDate &&
                    transaction.currency === currency
    );
    
    const analytics: FinancialAnalytics = {
      revenue: calculateRevenue(filteredTransactions),
      transactions: calculateTransactionStats(filteredTransactions),
      paymentMethods: getPaymentMethodBreakdown(filteredTransactions),
      categories: getCategoryBreakdown(filteredTransactions),
      trends: getRevenueTrends(filteredTransactions, days),
      topCustomers: getTopCustomers(filteredTransactions),
      geography: getGeographyBreakdown(filteredTransactions)
    };
    
    const response = {
      analytics,
      recentTransactions: filteredTransactions.slice(-20).reverse(),
      pendingTransactions: filteredTransactions.filter(t => t.status === 'pending'),
      failedTransactions: filteredTransactions.filter(t => t.status === 'failed'),
      currency,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { transactionId, status, refundAmount } = await request.json();
    
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    transactions[transactionIndex].status = status;
    
    if (status === 'refunded' && refundAmount) {
      // Create refund transaction
      const refundTransaction: Transaction = {
        ...transactions[transactionIndex],
        id: generateTransactionId(),
        timestamp: new Date().toISOString(),
        amount: -parseFloat(refundAmount),
        status: 'completed',
        description: `Refund for ${transactions[transactionIndex].id}`
      };
      
      transactions.push(refundTransaction);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Transaction updated' 
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

function generateTransactionId(): string {
  return 'txn_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateRevenue(transactions: Transaction[]) {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const total = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const daily = completedTransactions
    .filter(t => new Date(t.timestamp) >= today)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const weekly = completedTransactions
    .filter(t => new Date(t.timestamp) >= thisWeek)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthly = completedTransactions
    .filter(t => new Date(t.timestamp) >= thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const yearly = completedTransactions
    .filter(t => new Date(t.timestamp) >= thisYear)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const previousMonth = completedTransactions
    .filter(t => {
      const date = new Date(t.timestamp);
      return date >= lastMonth && date <= lastMonthEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    total,
    daily,
    weekly,
    monthly,
    yearly,
    previousMonth,
    growth: {
      daily: calculateGrowthRate(daily, 0), // Would need previous day data
      weekly: calculateGrowthRate(weekly, 0), // Would need previous week data
      monthly: calculateGrowthRate(monthly, previousMonth)
    }
  };
}

function calculateTransactionStats(transactions: Transaction[]) {
  const total = transactions.length;
  const completed = transactions.filter(t => t.status === 'completed').length;
  const pending = transactions.filter(t => t.status === 'pending').length;
  const failed = transactions.filter(t => t.status === 'failed').length;
  const refunded = transactions.filter(t => t.status === 'refunded').length;
  
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const averageValue = completedTransactions.length > 0 ?
    completedTransactions.reduce((sum, t) => sum + t.amount, 0) / completedTransactions.length : 0;
  
  const conversionRate = paymentAttempts.size > 0 ? (completed / paymentAttempts.size * 100) : 0;
  
  return {
    total,
    completed,
    pending,
    failed,
    refunded,
    averageValue,
    conversionRate
  };
}

function getPaymentMethodBreakdown(transactions: Transaction[]) {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const total = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const breakdown: Record<string, { count: number; amount: number; percentage: number }> = {};
  
  completedTransactions.forEach(transaction => {
    const method = transaction.paymentMethod;
    if (!breakdown[method]) {
      breakdown[method] = { count: 0, amount: 0, percentage: 0 };
    }
    breakdown[method].count++;
    breakdown[method].amount += transaction.amount;
  });
  
  Object.values(breakdown).forEach(data => {
    data.percentage = total > 0 ? (data.amount / total * 100) : 0;
  });
  
  return breakdown;
}

function getCategoryBreakdown(transactions: Transaction[]) {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const total = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const breakdown: Record<string, { count: number; amount: number; percentage: number }> = {};
  
  completedTransactions.forEach(transaction => {
    const category = transaction.category;
    if (!breakdown[category]) {
      breakdown[category] = { count: 0, amount: 0, percentage: 0 };
    }
    breakdown[category].count++;
    breakdown[category].amount += transaction.amount;
  });
  
  Object.values(breakdown).forEach(data => {
    data.percentage = total > 0 ? (data.amount / total * 100) : 0;
  });
  
  return breakdown;
}

function getRevenueTrends(transactions: Transaction[], days: number) {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const dateMap = new Map<string, { revenue: number; transactions: number }>();
  
  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, { revenue: 0, transactions: 0 });
  }
  
  // Populate with data
  completedTransactions.forEach(transaction => {
    const dateStr = transaction.timestamp.split('T')[0];
    const existing = dateMap.get(dateStr);
    if (existing) {
      existing.revenue += transaction.amount;
      existing.transactions++;
    }
  });
  
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));
}

function getTopCustomers(transactions: Transaction[]) {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const customerMap = new Map<string, {
    customerName: string;
    totalSpent: number;
    transactionCount: number;
  }>();
  
  completedTransactions.forEach(transaction => {
    const existing = customerMap.get(transaction.customerId);
    if (existing) {
      existing.totalSpent += transaction.amount;
      existing.transactionCount++;
    } else {
      customerMap.set(transaction.customerId, {
        customerName: transaction.customerName,
        totalSpent: transaction.amount,
        transactionCount: 1
      });
    }
  });
  
  return Array.from(customerMap.entries())
    .sort(([,a], [,b]) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map(([customerId, data]) => ({
      customerId,
      customerName: data.customerName,
      totalSpent: data.totalSpent,
      transactionCount: data.transactionCount,
      averageOrderValue: data.totalSpent / data.transactionCount
    }));
}

function getGeographyBreakdown(transactions: Transaction[]) {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const locationMap = new Map<string, { count: number; amount: number }>();
  
  completedTransactions.forEach(transaction => {
    const location = transaction.metadata.location || 'Unknown';
    const existing = locationMap.get(location);
    if (existing) {
      existing.count++;
      existing.amount += transaction.amount;
    } else {
      locationMap.set(location, { count: 1, amount: transaction.amount });
    }
  });
  
  return Object.fromEntries(locationMap);
}

function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}