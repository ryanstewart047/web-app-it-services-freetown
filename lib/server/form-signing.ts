/**
 * Request signing utility for form submissions
 * Prevents tampering with form data by adding an HMAC signature
 * Useful for verifying that data hasn't been modified in transit
 */

import crypto from 'crypto';

// This should be set in environment variables in production
const SIGNING_KEY = process.env.FORM_SIGNING_KEY || 'default-dev-key-change-in-production';

/**
 * Generate HMAC signature for form data
 * @param data - The data to sign (typically JSON stringified)
 * @returns Hex-encoded HMAC signature
 */
export function signData(data: string): string {
  return crypto
    .createHmac('sha256', SIGNING_KEY)
    .update(data)
    .digest('hex');
}

/**
 * Verify HMAC signature for form data
 * @param data - The data that was signed
 * @param signature - The signature to verify against
 * @returns True if signature is valid
 */
export function verifySignature(data: string, signature: string): boolean {
  const expectedSignature = signData(data);
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

/**
 * Create a signed form payload
 * @param data - Form data object
 * @returns Object with data and signature
 */
export function createSignedPayload(data: Record<string, any>) {
  const dataString = JSON.stringify(data);
  const signature = signData(dataString);
  
  return {
    data,
    signature,
    timestamp: Date.now()
  };
}

/**
 * Verify a signed form payload
 * @param payload - The signed payload object
 * @returns True if payload is valid and recent (within 5 minutes)
 */
export function verifySignedPayload(payload: any): boolean {
  if (!payload.data || !payload.signature || !payload.timestamp) {
    return false;
  }

  // Check if payload is recent (prevent replay attacks)
  const fiveMinutes = 5 * 60 * 1000;
  if (Date.now() - payload.timestamp > fiveMinutes) {
    console.warn('[Form Signing] Payload timestamp too old');
    return false;
  }

  // Verify signature
  const dataString = JSON.stringify(payload.data);
  return verifySignature(dataString, payload.signature);
}
