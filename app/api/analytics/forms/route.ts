import { NextRequest, NextResponse } from 'next/server';

interface FormSubmission {
  id: string;
  formType: string;
  timestamp: string;
  fields: Record<string, any>;
  sessionId: string;
  userAgent: string;
  ip: string;
  referrer: string;
  completionTime: number; // Time taken to complete form in seconds
  success: boolean;
  errorMessage?: string;
}

interface FormAnalytics {
  formType: string;
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  averageCompletionTime: number;
  conversionRate: number;
  abandonment: number;
  commonErrors: Array<{ error: string; count: number }>;
  fieldAnalytics: Record<string, {
    completionRate: number;
    averageLength: number;
    commonValues: Array<{ value: string; count: number }>;
  }>;
}

// In-memory storage
const formSubmissions: FormSubmission[] = [];
const formViews = new Map<string, number>(); // Track form views for conversion rate

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = forwarded ? forwarded.split(',')[0] : 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'unknown';
    
    const submission: FormSubmission = {
      id: generateId(),
      formType: data.formType,
      timestamp: new Date().toISOString(),
      fields: data.fields,
      sessionId: data.sessionId,
      userAgent: request.headers.get('user-agent') || '',
      ip: realIp,
      referrer: data.referrer || '',
      completionTime: data.completionTime || 0,
      success: data.success !== false,
      errorMessage: data.errorMessage
    };
    
    formSubmissions.push(submission);
    
    // Keep only last 5,000 submissions
    if (formSubmissions.length > 5000) {
      formSubmissions.splice(0, formSubmissions.length - 5000);
    }
    
    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id,
      message: 'Form submission recorded' 
    });
  } catch (error) {
    console.error('Error recording form submission:', error);
    return NextResponse.json({ error: 'Failed to record submission' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { formType } = await request.json();
    
    // Track form view
    formViews.set(formType, (formViews.get(formType) || 0) + 1);
    
    return NextResponse.json({ success: true, message: 'Form view recorded' });
  } catch (error) {
    console.error('Error recording form view:', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const formType = searchParams.get('formType');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let filteredSubmissions = formSubmissions.filter(
      submission => new Date(submission.timestamp) >= startDate
    );
    
    if (formType) {
      filteredSubmissions = filteredSubmissions.filter(s => s.formType === formType);
    }
    
    const formTypes = [...new Set(formSubmissions.map(s => s.formType))];
    const analytics: Record<string, FormAnalytics> = {};
    
    formTypes.forEach(type => {
      const typeSubmissions = filteredSubmissions.filter(s => s.formType === type);
      const successful = typeSubmissions.filter(s => s.success);
      const failed = typeSubmissions.filter(s => !s.success);
      
      const views = formViews.get(type) || 0;
      const conversionRate = views > 0 ? (typeSubmissions.length / views * 100) : 0;
      
      analytics[type] = {
        formType: type,
        totalSubmissions: typeSubmissions.length,
        successfulSubmissions: successful.length,
        failedSubmissions: failed.length,
        averageCompletionTime: typeSubmissions.reduce((sum, s) => sum + s.completionTime, 0) / typeSubmissions.length,
        conversionRate,
        abandonment: Math.max(0, 100 - conversionRate),
        commonErrors: getCommonErrors(failed),
        fieldAnalytics: getFieldAnalytics(typeSubmissions)
      };
    });
    
    const summary = {
      totalForms: formTypes.length,
      totalSubmissions: filteredSubmissions.length,
      totalViews: Array.from(formViews.values()).reduce((sum, views) => sum + views, 0),
      overallConversionRate: calculateOverallConversion(),
      topPerformingForms: getTopPerformingForms(analytics),
      recentSubmissions: filteredSubmissions.slice(-20).reverse(),
      formAnalytics: analytics
    };
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching form analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getCommonErrors(failedSubmissions: FormSubmission[]) {
  const errorCount = new Map<string, number>();
  
  failedSubmissions.forEach(submission => {
    if (submission.errorMessage) {
      errorCount.set(submission.errorMessage, (errorCount.get(submission.errorMessage) || 0) + 1);
    }
  });
  
  return Array.from(errorCount.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([error, count]) => ({ error, count }));
}

function getFieldAnalytics(submissions: FormSubmission[]) {
  const fieldStats: Record<string, any> = {};
  
  submissions.forEach(submission => {
    Object.entries(submission.fields).forEach(([fieldName, value]) => {
      if (!fieldStats[fieldName]) {
        fieldStats[fieldName] = {
          values: [],
          totalLength: 0,
          completedCount: 0
        };
      }
      
      if (value !== null && value !== undefined && value !== '') {
        fieldStats[fieldName].completedCount++;
        fieldStats[fieldName].values.push(value);
        if (typeof value === 'string') {
          fieldStats[fieldName].totalLength += value.length;
        }
      }
    });
  });
  
  const result: Record<string, any> = {};
  
  Object.entries(fieldStats).forEach(([fieldName, stats]) => {
    const completionRate = (stats.completedCount / submissions.length) * 100;
    const averageLength = stats.totalLength / stats.completedCount || 0;
    
    // Get common values
    const valueCount = new Map<string, number>();
    stats.values.forEach((value: any) => {
      const stringValue = String(value).toLowerCase();
      valueCount.set(stringValue, (valueCount.get(stringValue) || 0) + 1);
    });
    
    const commonValues = Array.from(valueCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));
    
    result[fieldName] = {
      completionRate: parseFloat(completionRate.toFixed(1)),
      averageLength: parseFloat(averageLength.toFixed(1)),
      commonValues
    };
  });
  
  return result;
}

function calculateOverallConversion() {
  const totalViews = Array.from(formViews.values()).reduce((sum, views) => sum + views, 0);
  const totalSubmissions = formSubmissions.length;
  
  return totalViews > 0 ? (totalSubmissions / totalViews * 100) : 0;
}

function getTopPerformingForms(analytics: Record<string, FormAnalytics>) {
  return Object.values(analytics)
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5)
    .map(form => ({
      formType: form.formType,
      conversionRate: form.conversionRate,
      totalSubmissions: form.totalSubmissions
    }));
}