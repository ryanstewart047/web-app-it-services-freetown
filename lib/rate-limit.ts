/**
 * Rate Limiting Utility
 * Prevents brute force attacks by limiting requests per IP address
 */

interface RateLimitEntry {
  attempts: number[];
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [ip, entry] of entries) {
    // Remove if no recent attempts and not blocked
    if (entry.attempts.length === 0 && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000, // 15 minutes block
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier) || { attempts: [] };

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Remove attempts outside the time window
  entry.attempts = entry.attempts.filter(
    (timestamp) => now - timestamp < config.windowMs
  );

  // Check if limit exceeded
  if (entry.attempts.length >= config.maxAttempts) {
    entry.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(identifier, entry);
    return {
      allowed: false,
      retryAfter: Math.ceil(config.blockDurationMs / 1000),
    };
  }

  // Add current attempt
  entry.attempts.push(now);
  rateLimitStore.set(identifier, entry);

  return { allowed: true };
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

export function getRateLimitInfo(identifier: string): {
  attempts: number;
  blockedUntil?: number;
} {
  const entry = rateLimitStore.get(identifier);
  if (!entry) {
    return { attempts: 0 };
  }

  const now = Date.now();
  const recentAttempts = entry.attempts.filter(
    (timestamp) => now - timestamp < DEFAULT_RATE_LIMIT.windowMs
  );

  return {
    attempts: recentAttempts.length,
    blockedUntil: entry.blockedUntil,
  };
}
