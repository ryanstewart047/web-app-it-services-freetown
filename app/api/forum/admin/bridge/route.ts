import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/auth-utils';

/**
 * Bridge endpoint: if the visitor already holds a valid main admin_session cookie,
 * automatically issue a forum_admin_session and redirect to /forum/admin.
 * This lets the main admin access Forum Admin without re-entering the master password.
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itservicesfreetown.com';

  try {
    // Check if main admin session cookie exists
    const mainAdminSession = cookies().get('admin_session')?.value;

    if (!mainAdminSession) {
      // Not logged into main admin — send to forum admin login instead
      return NextResponse.redirect(new URL('/forum/admin/login', baseUrl));
    }

    // Admin is authenticated in the main dashboard — issue forum admin session
    const forumAdminToken = await createSession('master-admin', 'superadmin');
    const response = NextResponse.redirect(new URL('/forum/admin', baseUrl));

    response.cookies.set('forum_admin_session', forumAdminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Forum admin bridge error:', error);
    return NextResponse.redirect(new URL('/forum/admin/login', baseUrl));
  }
}
