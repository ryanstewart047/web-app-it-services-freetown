/**
 * Rate limiting utility for form submissions and API requests
 * Prevents spam and abuse by limiting requests per IP per time window
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit tracking
// In production with multiple servers, use Redis instead
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof global !== 'undefined' && !global.rateLimitCleanupInterval) {
  global.rateLimitCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the request (usually IP address + endpoint)
 * @param config - Rate limit configuration
 * @returns Object with isLimited status and remaining requests
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig) {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Initialize new entry if not exists
  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      isLimited: false,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }

  // Reset if window has passed
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + config.windowMs;
    return {
      isLimited: false,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime
    };
  }

  // Check if limit exceeded
  const isLimited = entry.count >= config.maxRequests;
  entry.count++;

  return {
    isLimited,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime
  };
}

/**
 * Get the client IP from request headers
 * Handles X-Forwarded-For and X-Real-IP headers (important for proxied requests)
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for direct connections
  return headers.get('cf-connecting-ip') || 'unknown';
}

/**
 * Create a unique identifier for rate limiting
 * Combines IP and optionally other factors like user ID
 */
export function createRateLimitKey(ip: string, endpoint: string, userId?: string): string {
  const components = [ip, endpoint];
  if (userId) {
    components.push(userId);
  }
  return components.join(':');
}
