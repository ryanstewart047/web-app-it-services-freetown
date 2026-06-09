import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import {
  getAnalyticsData,
  recordFormSubmission,
  recordFormView
} from '@/lib/server/analytics-store';
import { captureEmailLead } from '@/lib/email-leads';
import { sendEmail, emailTemplates } from '@/lib/email';
import { checkRateLimit, getClientIp, createRateLimitKey } from '@/lib/server/rate-limiter';

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
        originalTimestamp: submission.timestamp, // Keep original for deletion
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
    // Rate limiting: Max 10 form submissions per hour per IP
    const clientIp = getClientIp(request.headers);
    const rateLimitKey = createRateLimitKey(clientIp, '/api/analytics/forms');
    const rateLimit = checkRateLimit(rateLimitKey, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000 // 1 hour
    });

    if (rateLimit.isLimited) {
      console.warn(`[Forms API] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many submissions',
          message: 'Please wait before submitting another form. You can submit again in approximately ' +
            Math.ceil((rateLimit.resetTime - Date.now()) / 60000) + ' minutes.'
        },
        { status: 429 }
      );
    }

    const data = await request.json();

    // Handle direct form submission data (compatibility mode)
    if (!data.type) {
      console.log('[Forms API] Received data without type field, treating as submission');
      const formType = data.formType || 'contact';
      const fields = data.fields || data;
      
      // CRITICAL FIX: Reject submissions with 'unknown' or missing formType
      // This prevents tracking of admin forms and internal forms
      if (!formType || formType === 'unknown' || formType.trim() === '') {
        console.error('[Forms API] ❌ Rejected submission with invalid formType:', formType);
        return NextResponse.json({
          success: false,
          error: 'Invalid form type',
          message: 'Form submissions must have a valid data-form-type attribute'
        }, { status: 400 });
      }
      
      // Whitelist of allowed form types (security measure)
      const allowedFormTypes = ['contact', 'repair-booking', 'troubleshoot', 'newsletter'];
      if (!allowedFormTypes.includes(formType)) {
        console.error('[Forms API] ❌ Rejected submission with disallowed formType:', formType);
        return NextResponse.json({
          success: false,
          error: 'Form type not allowed',
          message: `Form type "${formType}" is not in the allowed list`
        }, { status: 403 });
      }
      
      // Validate that we have actual field data
      const fieldEntries = Object.entries(fields);
      const hasRealData = fieldEntries.some(([key, value]) => {
        // Skip metadata fields
        if (['formType', 'userAgent', 'page', 'trackingId', 'sessionId', 'referrer', 'success', 'completionTime'].includes(key)) {
          return false;
        }
        // Check if value has actual content
        return value && value.toString().trim().length > 0;
      });
      
      if (!hasRealData) {
        console.error('[Forms API] ❌ Rejected empty form submission');
        return NextResponse.json({
          success: false,
          error: 'Empty submission',
          message: 'Form submission must contain actual field data'
        }, { status: 400 });
      }
      
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

      // Capture newsletter email lead if form type is newsletter
      if (formType === 'newsletter' && fields.email) {
        const emailLower = fields.email.toLowerCase().trim();
        const existingLead = await prisma.emailLead.findFirst({
          where: {
            email: emailLower
          }
        });

        if (existingLead) {
          return NextResponse.json({
            success: false,
            error: 'already_subscribed',
            message: 'This email is already subscribed to our newsletter.'
          }, { status: 400 });
        }

        await captureEmailLead({
          email: fields.email,
          source: 'newsletter'
        });
        
        // Send confirmation email to subscriber
        try {
          const emailTemplate = emailTemplates.newsletterConfirmation({ email: fields.email });
          await sendEmail({
            to: fields.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
          });
          console.log(`✅ Newsletter confirmation email sent to: ${fields.email}`);
        } catch (error) {
          console.error('❌ Failed to send newsletter confirmation email:', error);
          // Don't fail the submission if email fails
        }
      }

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

      // Capture newsletter email lead if form type is newsletter
      if (formType === 'newsletter' && fields.email) {
        const emailLower = fields.email.toLowerCase().trim();
        const existingLead = await prisma.emailLead.findFirst({
          where: {
            email: emailLower
          }
        });

        if (existingLead) {
          return NextResponse.json({
            success: false,
            error: 'already_subscribed',
            message: 'This email is already subscribed to our newsletter.'
          }, { status: 400 });
        }
      }

      const { submission, repair } = await recordFormSubmission({
        formType,
        fields,
        userAgent: data.userAgent,
        page: data.page,
        trackingId
      });

      // Capture newsletter email lead if form type is newsletter
      if (formType === 'newsletter' && fields.email) {
        await captureEmailLead({
          email: fields.email,
          source: 'newsletter'
        });

        // Send confirmation email to subscriber
        try {
          const emailTemplate = emailTemplates.newsletterConfirmation({ email: fields.email });
          await sendEmail({
            to: fields.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
          });
          console.log(`✅ Newsletter confirmation email sent to: ${fields.email}`);
        } catch (error) {
          console.error('❌ Failed to send newsletter confirmation email:', error);
          // Don't fail the submission if email fails
        }
      }

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
    const GIST_ID = process.env.GITHUB_GIST_ID || process.env.OFFER_GIST_ID || '741d3c2e3203df10a318d3dae1a94c66';
    const GIST_TOKEN = process.env.ITS_FREETOWN_OFFER_TOKEN || process.env.ITS_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
    const GIST_FILENAME = process.env.GITHUB_GIST_FILENAME || 'its-analytics.json';
    
    // Get current analytics data
    const data = await getAnalyticsData({ force: true });
    
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
    
    // Save back to storage (Gist only - file system is read-only in production)
    if (!GIST_ID || !GIST_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'GitHub Gist storage not configured. Please set GITHUB_GIST_ID and GITHUB_TOKEN environment variables in Vercel.' 
      }, { status: 500 });
    }

    // Update GitHub Gist
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to update Gist: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    // Clear cache
    const { clearCache } = await import('@/lib/server/analytics-store');
    await clearCache();
    
    console.log(`[Forms API] 🔒 Cleaned ${removedCount} submissions containing sensitive data`);
    
    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} sensitive submissions`,
      removedCount,
      remainingCount: data.forms?.submissions?.length || 0
    });
  } catch (error) {
    console.error('Error cleaning form data:', error);
    return NextResponse.json({ 
      error: 'Failed to clean form data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}