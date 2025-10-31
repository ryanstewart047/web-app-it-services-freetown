import { NextRequest, NextResponse } from 'next/server';

import {
  getAnalyticsData,
  recordFormSubmission,
  recordFormView
} from '@/lib/server/analytics-store';

export async function GET() {
  try {
    const data = await getAnalyticsData();
    const totalSubmissions = data.forms.submissions.length;
    const totalViews = Object.values(data.forms.views).reduce((sum, views) => sum + views, 0);
    const overallConversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;

    const formTypes = new Map<string, { submissions: number; views: number }>();

    data.forms.submissions.forEach((submission) => {
      const type = submission.formType || 'contact';
      const entry = formTypes.get(type) ?? { submissions: 0, views: 0 };
      entry.submissions += 1;
      formTypes.set(type, entry);
    });

    Object.entries(data.forms.views).forEach(([formType, views]) => {
      const entry = formTypes.get(formType) ?? { submissions: 0, views: 0 };
      entry.views += views;
      formTypes.set(formType, entry);
    });

    const topPerformingForms = Array.from(formTypes.entries())
      .map(([formType, info]) => ({
        formType,
        conversionRate: info.views > 0 ? (info.submissions / info.views) * 100 : 0,
        totalSubmissions: info.submissions,
        totalViews: info.views
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);

    const recentSubmissions = data.forms.submissions
      .slice(-10)
      .reverse()
      .map((submission) => ({
        ...submission,
        timestamp: new Date(submission.timestamp).toLocaleString()
      }));

    return NextResponse.json({
      totalSubmissions,
      totalViews,
      overallConversionRate: Math.round(overallConversionRate * 100) / 100,
      topPerformingForms,
      recentSubmissions
    });
  } catch (error) {
    console.error('Error retrieving form analytics:', error);
    return NextResponse.json({ error: 'Failed to retrieve form analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Handle direct form submission data (compatibility mode)
    if (!data.type) {
      console.log('[Forms API] Received data without type field, treating as submission');
      const formType = data.formType || 'contact';
      const fields = data.fields || data;
      
      // SERVER-SIDE VALIDATION - Prevent empty submissions ✅
      if (formType === 'repair-booking') {
        const required = ['customerName', 'name', 'email', 'phone', 'deviceType', 'issueDescription'];
        const missing = required.filter(field => !fields[field] || fields[field].toString().trim() === '');
        
        if (missing.length > 0) {
          console.error('[Forms API] ❌ Validation failed - Missing:', missing);
          return NextResponse.json({
            success: false,
            error: 'Validation failed',
            message: `Required fields missing: ${missing.join(', ')}`,
            missingFields: missing
          }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fields.email)) {
          return NextResponse.json({
            success: false,
            error: 'Invalid email',
            message: 'Please provide a valid email address'
          }, { status: 400 });
        }

        // Validate phone (at least 8 digits)
        const phoneDigits = (fields.phone || '').replace(/\D/g, '');
        if (phoneDigits.length < 8) {
          return NextResponse.json({
            success: false,
            error: 'Invalid phone',
            message: 'Phone number must be at least 8 digits'
          }, { status: 400 });
        }

        // Validate name length
        if (fields.customerName.length < 2 || fields.name.length < 2) {
          return NextResponse.json({
            success: false,
            error: 'Invalid name',
            message: 'Name must be at least 2 characters'
          }, { status: 400 });
        }
      }

      // SERVER-SIDE VALIDATION - Troubleshoot Form ✅
      if (formType === 'troubleshoot') {
        const required = ['deviceType', 'issueDescription'];
        const missing = required.filter(field => !fields[field] || fields[field].toString().trim() === '');
        
        if (missing.length > 0) {
          console.error('[Forms API] ❌ Troubleshoot validation failed - Missing:', missing);
          return NextResponse.json({
            success: false,
            error: 'Validation failed',
            message: `Required fields missing: ${missing.join(', ')}`,
            missingFields: missing
          }, { status: 400 });
        }

        // Validate issue description (min 10 characters)
        if (fields.issueDescription.toString().trim().length < 10) {
          return NextResponse.json({
            success: false,
            error: 'Invalid description',
            message: 'Issue description must be at least 10 characters'
          }, { status: 400 });
        }
      }
      
      const { submission, repair } = await recordFormSubmission({
        formType,
        fields,
        userAgent: data.userAgent,
        page: data.page,
        trackingId: data.trackingId
      });

      return NextResponse.json({
        success: true,
        submissionId: submission.id,
        trackingId: repair?.trackingId ?? submission.trackingId,
        repair,
        message: 'Form submission recorded'
      });
    }

    if (data.type === 'view') {
      const formType = typeof data.formType === 'string' ? data.formType : 'contact';
      await recordFormView(formType);

      return NextResponse.json({
        success: true,
        message: 'Form view recorded'
      });
    }

    if (data.type === 'submission') {
      const formType = typeof data.formType === 'string' ? data.formType : 'contact';
      const fields = typeof data.fields === 'object' && data.fields !== null ? data.fields : {};

      const trackingId = typeof data.trackingId === 'string' && data.trackingId.trim()
        ? data.trackingId.trim()
        : undefined;

      const { submission, repair } = await recordFormSubmission({
        formType,
        fields,
        userAgent: data.userAgent,
        page: data.page,
        trackingId
      });

      return NextResponse.json({
        success: true,
        submissionId: submission.id,
        trackingId: repair?.trackingId ?? submission.trackingId ?? trackingId,
        repair,
        message: formType === 'repair-booking'
          ? 'Repair booking recorded successfully'
          : 'Form submission recorded'
      });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Error recording form analytics:', error);
    return NextResponse.json({ error: 'Failed to record form analytics' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const formType = typeof data.formType === 'string' ? data.formType : 'contact';
    await recordFormView(formType);

    return NextResponse.json({
      success: true,
      message: 'Form view recorded'
    });
  } catch (error) {
    console.error('Error recording form view:', error);
    return NextResponse.json({ error: 'Failed to record form view' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Read analytics data file
    const dataDir = path.join(process.cwd(), 'data');
    const dataFile = path.join(dataDir, 'analytics.json');
    
    let data;
    try {
      const content = await fs.readFile(dataFile, 'utf-8');
      data = JSON.parse(content);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not read analytics file' 
      }, { status: 500 });
    }
    
    const originalCount = data.forms?.submissions?.length || 0;
    
    // Filter out submissions with password/sensitive fields
    if (data.forms && data.forms.submissions) {
      data.forms.submissions = data.forms.submissions.filter((submission: any) => {
        const fieldsStr = JSON.stringify(submission.fields || {}).toLowerCase();
        const formTypeStr = (submission.formType || '').toLowerCase();
        
        // Remove if contains password, auth, key fields or is from admin/auth forms
        const hasSensitiveData = fieldsStr.includes('password') || 
                                 fieldsStr.includes('"key"') ||
                                 fieldsStr.includes('auth') ||
                                 formTypeStr.includes('admin') ||
                                 formTypeStr.includes('auth') ||
                                 formTypeStr.includes('login');
        
        return !hasSensitiveData;
      });
    }
    
    const removedCount = originalCount - (data.forms?.submissions?.length || 0);
    
    // Write cleaned data back
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log(`[Forms API] 🔒 Cleaned ${removedCount} submissions containing sensitive data`);
    
    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} sensitive submissions`,
      removedCount,
      remainingCount: data.forms?.submissions?.length || 0
    });
  } catch (error) {
    console.error('Error cleaning form data:', error);
    return NextResponse.json({ error: 'Failed to clean form data' }, { status: 500 });
  }
}