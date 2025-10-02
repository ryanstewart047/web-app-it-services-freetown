// Simple admin authentication system for static deployment
// In production, replace with proper authentication system

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'itservices2025!' // Change this to a secure password
};

const ADMIN_SESSION_KEY = 'its_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSession {
  username: string;
  loginTime: string;
  expiresAt: string;
}

// Admin login
export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION);
    
    const session: AdminSession = {
      username,
      loginTime: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }
    
    return true;
  }
  return false;
}

// Check if admin is logged in
export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return false;
    
    const session: AdminSession = JSON.parse(sessionData);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return now < expiresAt;
  } catch (error) {
    return false;
  }
}

// Get current admin session
export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return null;
    
    const session: AdminSession = JSON.parse(sessionData);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now < expiresAt) {
      return session;
    } else {
      // Session expired, remove it
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
  } catch (error) {
    return null;
  }
}

// Admin logout
export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}