// Simple admin authentication system for static deployment
// In production, replace with proper authentication system

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'itservices2025!' // Change this to a secure password
};

const ADMIN_SESSION_KEY = 'its_admin_session';
const RESET_TOKEN_KEY = 'its_admin_reset_token';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_DURATION = 15 * 60 * 1000; // 15 minutes

export interface AdminSession {
  username: string;
  loginTime: string;
  expiresAt: string;
}

export interface ResetToken {
  token: string;
  username: string;
  createdAt: string;
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

// Generate password reset token
export function generateResetToken(username: string): string | null {
  if (username !== ADMIN_CREDENTIALS.username) {
    return null; // Username doesn't exist
  }
  
  // Generate a simple token (in production, use crypto-secure random)
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_DURATION);
  
  const resetToken: ResetToken = {
    token,
    username,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(RESET_TOKEN_KEY, JSON.stringify(resetToken));
  }
  
  return token;
}

// Validate reset token
export function validateResetToken(token: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const tokenData = localStorage.getItem(RESET_TOKEN_KEY);
    if (!tokenData) return false;
    
    const resetToken: ResetToken = JSON.parse(tokenData);
    const now = new Date();
    const expiresAt = new Date(resetToken.expiresAt);
    
    return resetToken.token === token && now < expiresAt;
  } catch (error) {
    return false;
  }
}

// Reset password with token
export function resetPassword(token: string, newPassword: string): boolean {
  if (!validateResetToken(token)) {
    return false;
  }
  
  // In a real application, you'd update the password in a secure database
  // For this static deployment, we'll update the in-memory credentials
  // Note: This won't persist across page reloads in production
  ADMIN_CREDENTIALS.password = newPassword;
  
  // Clear the reset token
  if (typeof window !== 'undefined') {
    localStorage.removeItem(RESET_TOKEN_KEY);
  }
  
  return true;
}

// Get reset token info (for validation)
export function getResetTokenInfo(token: string): ResetToken | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const tokenData = localStorage.getItem(RESET_TOKEN_KEY);
    if (!tokenData) return null;
    
    const resetToken: ResetToken = JSON.parse(tokenData);
    
    if (resetToken.token === token) {
      return resetToken;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}