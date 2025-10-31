import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Rate limiting
const submissions = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const submission = submissions.get(ip);
  
  if (!submission) return false;
  
  if (now > submission.resetTime) {
    submissions.delete(ip);
    return false;
  }
  
  // Max 10 submissions per hour
  return submission.count >= 10;
}

function recordSubmission(ip: string): void {
  const now = Date.now();
  const submission = submissions.get(ip);
  
  if (!submission || now > submission.resetTime) {
    submissions.set(ip, {
      count: 1,
      resetTime: now + 60 * 60 * 1000 // 1 hour
    });
  } else {
    submission.count++;
  }
}

function sanitizeInput(input: string): string {
  // Remove potentially harmful characters
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePhone(phone: string): boolean {
  // Allow various phone formats
  const phoneRegex = /^[\d\s+()-]{7,20}$/;
  return phoneRegex.test(phone);
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    
    // Rate limiting
    if (isRateLimited(clientIp)) {
      console.error('[Form Validation] Rate limit exceeded:', clientIp);
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { formType, data } = body;
    
    console.log('[Form Validation] Validating form:', formType, 'from IP:', clientIp);
    
    const errors: Record<string, string> = {};
    
    // Common validation rules
    if (formType === 'contact' || formType === 'appointment') {
      // Name validation
      if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      } else if (data.name.length > 100) {
        errors.name = 'Name is too long';
      }
      
      // Email validation
      if (!data.email || !validateEmail(data.email)) {
        errors.email = 'Valid email is required';
      }
      
      // Phone validation
      if (!data.phone || !validatePhone(data.phone)) {
        errors.phone = 'Valid phone number is required';
      }
      
      // Message validation
      if (!data.message || data.message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters';
      } else if (data.message.length > 2000) {
        errors.message = 'Message is too long (max 2000 characters)';
      }
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /onclick=/i,
      /onerror=/i,
      /<iframe/i,
      /eval\(/i,
      /base64/i
    ];
    
    const allValues = Object.values(data).join(' ').toLowerCase();
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(allValues)
    );
    
    if (hasSuspiciousContent) {
      console.error('[Form Validation] Suspicious content detected from IP:', clientIp);
      return NextResponse.json(
        { error: 'Invalid form data. Please check your input.' },
        { status: 400 }
      );
    }
    
    // Return validation errors
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    // Sanitize all string inputs
    const sanitizedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeInput(value);
      } else {
        sanitizedData[key] = value;
      }
    }
    
    recordSubmission(clientIp);
    
    console.log('[Form Validation] Validation passed for:', formType);
    
    return NextResponse.json({
      success: true,
      sanitizedData
    });
  } catch (error) {
    console.error('[Form Validation] Error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
