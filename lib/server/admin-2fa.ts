import crypto from 'crypto';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { sendEmail, emailTemplates } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const HMAC_SECRET = process.env.ADMIN_PASSWORD_HASH || '2fa-hmac-secret-key-itservicesfreetown';
const HAS_DATABASE = Boolean(process.env.DATABASE_URL);
const IS_VERCEL_DEPLOYMENT = Boolean(process.env.VERCEL);
const CONFIG_RECORD_ID = 'admin';

// Local fallback for development; production settings are stored in Postgres below.
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

interface Admin2FAConfigRow {
  enabled: boolean;
  mode: string;
  totpSecret: string | null;
  recipientEmail: string | null;
}

let databaseConfigReady: Promise<boolean> | null = null;

function getTotpInstance(secret?: string): TOTP {
  return new TOTP({
    ...(secret ? { secret } : {}),
    crypto: new NobleCryptoPlugin(),
    base32: new ScureBase32Plugin()
  });
}

function is2FAMode(value: unknown): value is Admin2FAConfig['mode'] {
  return value === 'email' || value === 'totp' || value === 'both';
}

function getDefault2FAConfig(): Admin2FAConfig {
  return {
    enabled: true,
    mode: 'both',
    totpSecret: process.env.ADMIN_TOTP_SECRET || '',
    recipientEmail: process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@itservicesfreetown.com'
  };
}

function normalizeConfig(config: {
  enabled?: unknown;
  mode?: unknown;
  totpSecret?: unknown;
  recipientEmail?: unknown;
}): Admin2FAConfig {
  const defaults = getDefault2FAConfig();
  return {
    enabled: typeof config.enabled === 'boolean' ? config.enabled : defaults.enabled,
    mode: is2FAMode(config.mode) ? config.mode : defaults.mode,
    totpSecret: typeof config.totpSecret === 'string' && config.totpSecret ? config.totpSecret : defaults.totpSecret,
    recipientEmail: typeof config.recipientEmail === 'string' && config.recipientEmail ? config.recipientEmail : defaults.recipientEmail
  };
}

function readLocal2FAConfig(): Admin2FAConfig | null {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      return normalizeConfig(JSON.parse(data));
    }
  } catch (err) {
    console.error('[2FA Config] Failed to load 2FA config file:', err);
  }

  return null;
}

function writeLocal2FAConfig(config: Admin2FAConfig) {
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

async function ensureDatabaseConfigStore(): Promise<boolean> {
  if (!HAS_DATABASE) return false;

  if (!databaseConfigReady) {
    databaseConfigReady = (async () => {
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "AdminTwoFactorConfig" (
            "id" TEXT PRIMARY KEY,
            "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
            "mode" TEXT NOT NULL DEFAULT 'both',
            "totpSecret" TEXT,
            "recipientEmail" TEXT,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        return true;
      } catch (error) {
        console.error('[2FA Config] Persistent database initialization failed:', error);
        return false;
      }
    })();
  }

  return databaseConfigReady;
}

async function readDatabase2FAConfig(): Promise<Admin2FAConfig | null> {
  if (!(await ensureDatabaseConfigStore())) return null;

  try {
    const rows = await prisma.$queryRawUnsafe<Admin2FAConfigRow[]>(
      `SELECT "enabled", "mode", "totpSecret", "recipientEmail"
       FROM "AdminTwoFactorConfig" WHERE "id" = $1 LIMIT 1`,
      CONFIG_RECORD_ID
    );

    return rows[0] ? normalizeConfig(rows[0]) : null;
  } catch (error) {
    console.error('[2FA Config] Persistent database read failed:', error);
    return null;
  }
}

async function writeDatabase2FAConfig(config: Admin2FAConfig): Promise<boolean> {
  if (!(await ensureDatabaseConfigStore())) return false;

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AdminTwoFactorConfig" ("id", "enabled", "mode", "totpSecret", "recipientEmail", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT ("id") DO UPDATE SET
         "enabled" = EXCLUDED."enabled",
         "mode" = EXCLUDED."mode",
         "totpSecret" = EXCLUDED."totpSecret",
         "recipientEmail" = EXCLUDED."recipientEmail",
         "updatedAt" = CURRENT_TIMESTAMP`,
      CONFIG_RECORD_ID,
      config.enabled,
      config.mode,
      config.totpSecret || null,
      config.recipientEmail || null
    );
    return true;
  } catch (error) {
    console.error('[2FA Config] Persistent database save failed:', error);
    return false;
  }
}

// Database-backed in production so mode changes survive serverless instances and deployments.
export async function get2FAConfig(): Promise<Admin2FAConfig> {
  const databaseConfig = await readDatabase2FAConfig();
  if (databaseConfig) return databaseConfig;

  const localConfig = readLocal2FAConfig();
  // Preserve an existing temporary setting the first time a deployment can reach Postgres.
  if (localConfig && HAS_DATABASE) {
    await writeDatabase2FAConfig(localConfig);
  }

  return localConfig || getDefault2FAConfig();
}

export async function save2FAConfig(config: Partial<Admin2FAConfig>): Promise<Admin2FAConfig> {
  const current = await get2FAConfig();
  const updated = normalizeConfig({ ...current, ...config });

  if (await writeDatabase2FAConfig(updated)) {
    if (!IS_VERCEL_DEPLOYMENT) {
      try {
        writeLocal2FAConfig(updated);
      } catch (error) {
        console.warn('[2FA Config] Local cache save failed:', error);
      }
    }
    return updated;
  }

  if (IS_VERCEL_DEPLOYMENT) {
    throw new Error('Persistent 2FA storage is unavailable. The change was not saved.');
  }

  try {
    writeLocal2FAConfig(updated);
  } catch (err) {
    console.error('[2FA Config] Failed to save 2FA config:', err);
    throw new Error('Unable to save 2FA settings.');
  }

  return updated;
}

function emailVerificationIsAllowed(config: Admin2FAConfig): boolean {
  return config.mode === 'email' || config.mode === 'both';
}

function authenticatorVerificationIsAllowed(config: Admin2FAConfig): boolean {
  return config.mode === 'totp' || config.mode === 'both';
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
export async function createPending2FASession(
  ip: string,
  savedConfig?: Admin2FAConfig
): Promise<{ pendingToken: string; emailSent: boolean; emailNote?: string }> {
  const config = savedConfig || await get2FAConfig();
  const emailCode = emailVerificationIsAllowed(config) ? generate6DigitCode() : '';
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  const pendingToken = createSignedPendingToken({
    emailCode,
    expiresAt,
    ip
  });

  if (!emailVerificationIsAllowed(config)) {
    return {
      pendingToken,
      emailSent: false,
      emailNote: 'Email verification is disabled while Authenticator App Only is selected.'
    };
  }

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
  const config = await get2FAConfig();
  if (!emailVerificationIsAllowed(config)) {
    return { success: false, error: 'Email verification is disabled. Use your Authenticator App code.' };
  }

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

  const config = await get2FAConfig();

  // 1. EMAIL OTP Verification
  if (method === 'email') {
    if (!emailVerificationIsAllowed(config)) {
      return { valid: false, error: 'Email verification is disabled. Use your Authenticator App code.' };
    }
    const cleanCode = code.trim().replace(/\s+/g, '');
    if (cleanCode === decoded.emailCode) {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid 6-digit email code. Please check your inbox or resend.' };
  }

  // 2. TOTP Verification
  if (method === 'totp') {
    if (!authenticatorVerificationIsAllowed(config)) {
      return { valid: false, error: 'Authenticator App verification is disabled. Use your email code.' };
    }
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
export async function generateTOTPSetup(serviceName = 'BridgeTech IT Services Admin'): Promise<{ secret: string; qrCodeUrl: string; otpauthUrl: string; secretFromEnv: boolean }> {
  const config = await get2FAConfig();
  // Always use the deterministic/env secret — never generate a random one
  const secret = getDeterministicTOTPSecret();
  const secretFromEnv = isTOTPSecretFromEnv();

  // Persist to config so verify2FACodeAsync can read it on the same container
  if (!config.totpSecret || config.totpSecret !== secret) {
    await save2FAConfig({ totpSecret: secret });
  }

  const accountName = config.recipientEmail || 'admin@itservicesfreetown.com';
  const otpauthUrl = generateURI({ issuer: serviceName, label: accountName, secret });
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return { secret, qrCodeUrl, otpauthUrl, secretFromEnv };
}
