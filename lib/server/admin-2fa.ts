import crypto from 'crypto';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { sendEmail, emailTemplates } from '@/lib/email';
import fs from 'fs';
import path from 'path';

const HMAC_SECRET = process.env.ADMIN_PASSWORD_HASH || '2fa-hmac-secret-key-itservicesfreetown';

// Persistent 2FA Config file path (uses /tmp on Vercel/production for write permissions)
const CONFIG_FILE_PATH = process.env.VERCEL || process.env.NODE_ENV === 'production'
  ? path.join('/tmp', '.admin-2fa-config.json')
  : path.join(process.cwd(), '.admin-2fa-config.json');

/**
 * Derives a stable, deterministic TOTP secret from the ADMIN_PASSWORD_HASH env var.
 * This ensures the secret is ALWAYS the same across all Vercel serverless containers
 * without needing persistent storage. If ADMIN_TOTP_SECRET is set in env, that takes priority.
 */
function getDeterministicTOTPSecret(): string {
  // Priority 1: Explicitly set ADMIN_TOTP_SECRET env var (most stable, user-configured)
  if (process.env.ADMIN_TOTP_SECRET) {
    return process.env.ADMIN_TOTP_SECRET;
  }
  // Priority 2: Derive a stable Base32 secret from ADMIN_PASSWORD_HASH
  // This is deterministic — same input always produces the same output
  const raw = crypto.createHmac('sha256', HMAC_SECRET)
    .update('totp-secret-v1')
    .digest();
  // Convert to Base32 (A-Z2-7 alphabet used by TOTP apps)
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let bits = 0;
  let bitsCount = 0;
  for (let i = 0; i < raw.length; i++) {
    const byte = raw[i];
    bits = (bits << 8) | byte;
    bitsCount += 8;
    while (bitsCount >= 5) {
      result += base32Chars[(bits >> (bitsCount - 5)) & 31];
      bitsCount -= 5;
    }
  }
  if (bitsCount > 0) result += base32Chars[(bits << (5 - bitsCount)) & 31];
  return result;
}

/** Whether the TOTP secret is confirmed persistent via env var (true) or derived (false) */
export function isTOTPSecretFromEnv(): boolean {
  return !!process.env.ADMIN_TOTP_SECRET;
}

export interface Admin2FAConfig {
  enabled: boolean;
  mode: 'email' | 'totp' | 'both';
  totpSecret?: string;
  recipientEmail?: string;
}

function getTotpInstance(secret?: string): TOTP {
  return new TOTP({
    ...(secret ? { secret } : {}),
    crypto: new NobleCryptoPlugin(),
    base32: new ScureBase32Plugin()
  });
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
 * Creates a signed stateless pending token (works across serverless instances)
 */
function createSignedPendingToken(payload: { emailCode: string; expiresAt: number; ip: string }): string {
  const dataStr = `${payload.emailCode}:${payload.expiresAt}:${payload.ip}`;
  const hmac = crypto.createHmac('sha256', HMAC_SECRET).update(dataStr).digest('hex');
  const payloadB64 = Buffer.from(dataStr).toString('base64url');
  return `${payloadB64}.${hmac}`;
}

/**
 * Decodes and verifies a signed stateless pending token
 */
function verifyAndDecodePendingToken(token: string): { emailCode: string; expiresAt: number; ip: string } | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, hmac] = parts;
    const dataStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', HMAC_SECRET).update(dataStr).digest('hex');

    const bufferHmac = Buffer.from(hmac, 'hex');
    const bufferExpected = Buffer.from(expectedHmac, 'hex');

    if (bufferHmac.length !== bufferExpected.length || !crypto.timingSafeEqual(bufferHmac, bufferExpected)) {
      return null;
    }

    const [emailCode, expiresAtStr, ip] = dataStr.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt)) return null;

    return { emailCode, expiresAt, ip: ip || 'unknown' };
  } catch (err) {
    return null;
  }
}

/**
 * Creates a pending 2FA session for password-verified logins.
 */
export async function createPending2FASession(ip: string): Promise<{ pendingToken: string; emailSent: boolean; emailNote?: string }> {
  const emailCode = generate6DigitCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  const pendingToken = createSignedPendingToken({
    emailCode,
    expiresAt,
    ip
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
export async function resendEmailOTP(pendingToken: string): Promise<{ success: boolean; newPendingToken?: string; error?: string }> {
  const decoded = verifyAndDecodePendingToken(pendingToken);

  if (!decoded || Date.now() > decoded.expiresAt) {
    return { success: false, error: 'Verification session expired. Please log in again.' };
  }

  const newEmailCode = generate6DigitCode();
  const newExpiresAt = Date.now() + 10 * 60 * 1000;
  const newPendingToken = createSignedPendingToken({
    emailCode: newEmailCode,
    expiresAt: newExpiresAt,
    ip: decoded.ip
  });

  const config = get2FAConfig();
  const recipientEmail = config.recipientEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@itservicesfreetown.com';

  const template = emailTemplates.twoFactorVerificationCode({
    code: newEmailCode,
    expiresMinutes: 10
  });

  const emailResult = await sendEmail({
    to: recipientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });

  return {
    success: emailResult.success,
    newPendingToken,
    error: emailResult.error
  };
}

/**
 * Verifies a 2FA code (either Email OTP or Authenticator App TOTP).
 */
export async function verify2FACodeAsync(pendingToken: string, method: 'email' | 'totp', code: string): Promise<{ valid: boolean; error?: string }> {
  const decoded = verifyAndDecodePendingToken(pendingToken);

  if (!decoded) {
    return { valid: false, error: 'Verification session expired or invalid. Please log in again.' };
  }

  if (Date.now() > decoded.expiresAt) {
    return { valid: false, error: 'Verification code has expired. Please request a new one.' };
  }

  const config = get2FAConfig();

  // 1. EMAIL OTP Verification
  if (method === 'email') {
    const cleanCode = code.trim().replace(/\s+/g, '');
    if (cleanCode === decoded.emailCode) {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid 6-digit email code. Please check your inbox or resend.' };
  }

  // 2. TOTP Verification
  if (method === 'totp') {
    // Always use deterministic secret — works regardless of which serverless container handles this request
    const secret = getDeterministicTOTPSecret();
    if (!secret) {
      return { valid: false, error: 'Authenticator App 2FA is not configured. Please use Email code.' };
    }

    try {
      const cleanCode = code.trim().replace(/\s+/g, '');
      const totpInstance = getTotpInstance(secret);
      const result = await totpInstance.verify(cleanCode, { epochTolerance: 30 });
      if (result && result.valid) {
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
 * Always returns the same stable secret (from env var or deterministic derivation)
 */
export async function generateTOTPSetup(serviceName = 'IT Services Freetown Admin'): Promise<{ secret: string; qrCodeUrl: string; otpauthUrl: string; secretFromEnv: boolean }> {
  const config = get2FAConfig();
  // Always use the deterministic/env secret — never generate a random one
  const secret = getDeterministicTOTPSecret();
  const secretFromEnv = isTOTPSecretFromEnv();

  // Persist to config so verify2FACodeAsync can read it on the same container
  if (!config.totpSecret || config.totpSecret !== secret) {
    save2FAConfig({ totpSecret: secret });
  }

  const accountName = config.recipientEmail || 'admin@itservicesfreetown.com';
  const otpauthUrl = generateURI({ issuer: serviceName, label: accountName, secret });
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return { secret, qrCodeUrl, otpauthUrl, secretFromEnv };
}
