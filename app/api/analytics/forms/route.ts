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