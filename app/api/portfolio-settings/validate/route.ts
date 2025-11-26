import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { valid: false, message: 'Password required' },
        { status: 400 }
      );
    }

    // Verify admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      return NextResponse.json({
        valid: true,
        message: 'Authentication successful',
      });
    }

    return NextResponse.json(
      { valid: false, message: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error validating password:', error);
    return NextResponse.json(
      { valid: false, message: 'Validation error' },
      { status: 500 }
    );
  }
}
