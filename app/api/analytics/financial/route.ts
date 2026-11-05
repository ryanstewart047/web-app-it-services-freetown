import { NextRequest, NextResponse } from 'next/server';

type TransactionStatus = 'pending' | 'completed' | 'failed';

interface TransactionRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: string;
  description: string;
  timestamp: string;
}

interface CustomerRecord {
  name: string;
  email: string;
  totalSpent: number;
  transactionCount: number;
  firstPurchase: string;
  lastPurchase?: string;
}

interface FinancialAnalyticsState {
  transactions: TransactionRecord[];
  revenue: {
    total: number;
    monthly: number;
    daily: number;
  };
  customers: Map<string, CustomerRecord>;
}

// In-memory storage for financial analytics
const financialAnalytics: FinancialAnalyticsState = {
  transactions: [],
  revenue: {
    total: 0,
    monthly: 0,
    daily: 0,
  },
  customers: new Map(),
};

export async function GET() {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate revenue totals
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let dailyRevenue = 0;
    let completedTransactions = 0;
    let pendingTransactions = 0;
    let failedTransactions = 0;

    financialAnalytics.transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.timestamp);
      
      if (transaction.status === 'completed') {
        totalRevenue += transaction.amount;
        completedTransactions++;
        
  if (transactionDate >= thisMonth) {
          monthlyRevenue += transaction.amount;
        }
        
        if (transactionDate >= today) {
          dailyRevenue += transaction.amount;
        }
      } else if (transaction.status === 'pending') {
        pendingTransactions++;
      } else if (transaction.status === 'failed') {
        failedTransactions++;
      }
    });

    // Calculate growth (mock calculation - would use previous month data in real implementation)
    const monthlyGrowth = monthlyRevenue > 0 ? Math.random() * 20 - 5 : 0; // Mock growth between -5% and 15%

    // Calculate average transaction value
    const averageValue = completedTransactions > 0 ? totalRevenue / completedTransactions : 0;

    // Calculate conversion rate (mock - would need visitor data)
    const conversionRate = Math.random() * 5 + 2; // Mock conversion between 2-7%

    // Top customers
    const customerTotals = new Map<string, { totalSpent: number; transactionCount: number }>();
    financialAnalytics.transactions.forEach((transaction) => {
      if (transaction.status === 'completed') {
        const current = customerTotals.get(transaction.customerName) || { totalSpent: 0, transactionCount: 0 };
        current.totalSpent += transaction.amount;
        current.transactionCount += 1;
        customerTotals.set(transaction.customerName, current);
      }
    });

    const topCustomers = Array.from(customerTotals.entries())
      .map(([customerName, data]) => ({
        customerName,
        totalSpent: data.totalSpent,
        transactionCount: data.transactionCount
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return NextResponse.json({
      analytics: {
        revenue: {
          total: Math.round(totalRevenue * 100) / 100,
          monthly: Math.round(monthlyRevenue * 100) / 100,
          daily: Math.round(dailyRevenue * 100) / 100,
          growth: {
            monthly: Math.round(monthlyGrowth * 100) / 100
          }
        },
        transactions: {
          total: financialAnalytics.transactions.length,
          completed: completedTransactions,
          pending: pendingTransactions,
          failed: failedTransactions,
          averageValue: Math.round(averageValue * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100
        },
        topCustomers
      }
    });
  } catch (error) {
    console.error('Error retrieving financial analytics:', error);
    return NextResponse.json({ error: 'Failed to retrieve financial analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const statusInput = typeof data.status === 'string' ? data.status : '';
    const validStatuses: TransactionStatus[] = ['pending', 'completed', 'failed'];
    const normalizedStatus: TransactionStatus = validStatuses.includes(statusInput as TransactionStatus)
      ? (statusInput as TransactionStatus)
      : 'pending';

    const transaction: TransactionRecord = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerName: typeof data.customerName === 'string' ? data.customerName : 'Unknown Customer',
      customerEmail: typeof data.customerEmail === 'string' ? data.customerEmail : '',
      amount:
        typeof data.amount === 'number'
          ? data.amount
          : parseFloat(String(data.amount ?? '0')) || 0,
      currency: typeof data.currency === 'string' ? data.currency : 'USD',
      status: normalizedStatus,
      type: typeof data.type === 'string' ? data.type : 'service', // service, product, subscription
      description: typeof data.description === 'string' ? data.description : '',
      timestamp: new Date().toISOString(),
    };

    financialAnalytics.transactions.push(transaction);

    // Update customer records
    if (transaction.status === 'completed') {
      const customer = financialAnalytics.customers.get(transaction.customerEmail) || {
        name: transaction.customerName,
        email: transaction.customerEmail,
        totalSpent: 0,
        transactionCount: 0,
        firstPurchase: transaction.timestamp
      };
      
      customer.totalSpent += transaction.amount;
      customer.transactionCount += 1;
      customer.lastPurchase = transaction.timestamp;
      
      financialAnalytics.customers.set(transaction.customerEmail, customer);
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
  }
}