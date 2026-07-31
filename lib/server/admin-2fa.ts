import crypto from 'crypto';
import { generateSecret, generateURI, TOTP } from 'otplib';
import QRCode from 'qrcode';
import { sendEmail, emailTemplates } from '@/lib/email';
import fs from 'fs';
import path from 'path';

// Pending login verification sessions store (pendingToken -> verification details)
interface PendingSession {
  emailCode: string;
  expiresAt: number;
  ip: string;
  attempts: number;
}

const pendingSessions = new Map<string, PendingSession>();

// Cleanup expired pending sessions every 5 minutes
function cleanupPendingSessions() {
  const now = Date.now();
  Array.from(pendingSessions.entries()).forEach(([token, session]) => {
    if (now > session.expiresAt) {
      pendingSessions.delete(token);
    }
  });
}

// Persistent 2FA Config file path
const CONFIG_FILE_PATH = path.join(process.cwd(), '.admin-2fa-config.json');

export interface Admin2FAConfig {
  enabled: boolean;
  mode: 'email' | 'totp' | 'both';
  totpSecret?: string;
  recipientEmail?: string;
}

// Load default 2FA config
export function get2FAConfig(): Admin2FAConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        enabled: parsed.enabled ?? true,
        mode: parsed.mode ?? 'both',
        totpSecret: parsed.totpSecret || process.env.ADMIN_TOTP_SECRET || '',
        recipientEmail: parsed.recipientEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@itservicesfreetown.com'
      };
    }
  } catch (err) {
    console.error('[2FA Config] Failed to load 2FA config file:', err);
  }

  return {
    enabled: true,
    mode: 'both',
    totpSecret: process.env.ADMIN_TOTP_SECRET || '',
    recipientEmail: process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@itservicesfreetown.com'
  };
}

// Save 2FA config
export function save2FAConfig(config: Partial<Admin2FAConfig>): Admin2FAConfig {
  const current = get2FAConfig();
  const updated: Admin2FAConfig = {
    ...current,
    ...config
  };

  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('[2FA Config] Failed to save 2FA config:', err);
  }

  return updated;
}

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates a pending 2FA session for password-verified logins.
 */
export async function createPending2FASession(ip: string): Promise<{ pendingToken: string; emailSent: boolean; emailNote?: string }> {
  cleanupPendingSessions();

  const pendingToken = crypto.randomBytes(32).toString('hex');
  const emailCode = generate6DigitCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  pendingSessions.set(pendingToken, {
    emailCode,
    expiresAt,
    ip,
    attempts: 0
  });

  const config = get2FAConfig();
  const recipientEmail = config.recipientEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@itservicesfreetown.com';

  let emailSent = false;
  let emailNote: string | undefined;

  try {
    const template = emailTemplates.twoFactorVerificationCode({
      code: emailCode,
      expiresMinutes: 10
    });

    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    emailSent = emailResult.success;
    if (emailResult.note) {
      emailNote = emailResult.note;
    }
  } catch (err) {
    console.error('[2FA] Error sending email OTP:', err);
  }

  return { pendingToken, emailSent, emailNote };
}

/**
 * Resends the 6-digit email code.
 */
export async function resendEmailOTP(pendingToken: string): Promise<{ success: boolean; error?: string }> {
  cleanupPendingSessions();
  const session = pendingSessions.get(pendingToken);

  if (!session || Date.now() > session.expiresAt) {
    return { success: false, error: 'Verification session expired. Please log in again.' };
  }

  session.emailCode = generate6DigitCode();
  session.expiresAt = Date.now() + 10 * 60 * 1000;
  session.attempts = 0;

  const config = get2FAConfig();
  const recipientEmail = config.recipientEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@itservicesfreetown.com';

  const template = emailTemplates.twoFactorVerificationCode({
    code: session.emailCode,
    expiresMinutes: 10
  });

  const emailResult = await sendEmail({
    to: recipientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });

  return { success: emailResult.success, error: emailResult.error };
}

/**
 * Verifies a 2FA code (either Email OTP or Authenticator App TOTP).
 */
export async function verify2FACodeAsync(pendingToken: string, method: 'email' | 'totp', code: string): Promise<{ valid: boolean; error?: string }> {
  cleanupPendingSessions();
  const session = pendingSessions.get(pendingToken);

  if (!session) {
    return { valid: false, error: 'Verification session expired or invalid. Please log in again.' };
  }

  if (Date.now() > session.expiresAt) {
    pendingSessions.delete(pendingToken);
    return { valid: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (session.attempts >= 5) {
    pendingSessions.delete(pendingToken);
    return { valid: false, error: 'Too many incorrect attempts. Session terminated for security.' };
  }

  session.attempts++;

  const config = get2FAConfig();

  // 1. EMAIL OTP Verification
  if (method === 'email') {
    const cleanCode = code.trim().replace(/\s+/g, '');
    if (cleanCode === session.emailCode) {
      pendingSessions.delete(pendingToken);
      return { valid: true };
    }
    return { valid: false, error: 'Invalid 6-digit email code. Please check your inbox or resend.' };
  }

  // 2. TOTP Verification
  if (method === 'totp') {
    const secret = config.totpSecret;
    if (!secret) {
      return { valid: false, error: 'Authenticator App 2FA is not configured. Please use Email code.' };
    }

    try {
      const cleanCode = code.trim().replace(/\s+/g, '');
      // epochTolerance: 30s allows ±1 time-step for minor clock drift
      const totpInstance = new TOTP({ secret });
      const result = await totpInstance.verify(cleanCode, { epochTolerance: 30 });
      if (result.valid) {
        pendingSessions.delete(pendingToken);
        return { valid: true };
      }
      return { valid: false, error: 'Invalid Authenticator App code. Check your app clock & try again.' };
    } catch (err) {
      console.error('[2FA TOTP] Verification error:', err);
      return { valid: false, error: 'Error verifying Authenticator App code.' };
    }
  }

  return { valid: false, error: 'Unsupported 2FA method.' };
}

/**
 * Setup TOTP Secret & QR Code for Authenticator App
 */
export async function generateTOTPSetup(serviceName = 'IT Services Freetown Admin'): Promise<{ secret: string; qrCodeUrl: string; otpauthUrl: string }> {
  let config = get2FAConfig();
  let secret = config.totpSecret;

  if (!secret) {
    secret = new TOTP().generateSecret();
    save2FAConfig({ totpSecret: secret });
  }

  const accountName = config.recipientEmail || 'admin@itservicesfreetown.com';
  const otpauthUrl = generateURI({ issuer: serviceName, label: accountName, secret });
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return { secret, qrCodeUrl, otpauthUrl };
}
