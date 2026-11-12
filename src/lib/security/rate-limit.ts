/**
 * Rate Limiting and Security Utilities for The Jawed Habib Salon – Lalganj
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const recentSubmissions = new Map<string, number>();

/**
 * In-memory sliding window rate limiter
 * @param key Unique identifier (IP, phone, or token)
 * @param limit Maximum allowed requests within window
 * @param windowMs Window duration in milliseconds (default: 10 minutes)
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 10 * 60 * 1000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetInMs: Math.max(0, existing.resetAt - now),
  };
}

/**
 * Protection against rapid duplicate appointment submissions
 * Prevents same customer phone booking same date & time within 60 seconds
 */
export function checkDuplicateSubmission(
  customerPhone: string,
  appointmentDate: string,
  startTime: string,
  cooldownMs: number = 60 * 1000
): { isDuplicate: boolean; retryAfterSeconds: number } {
  const key = `${customerPhone}_${appointmentDate}_${startTime}`;
  const now = Date.now();
  const lastTime = recentSubmissions.get(key);

  if (lastTime && now - lastTime < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (now - lastTime)) / 1000);
    return { isDuplicate: true, retryAfterSeconds: remaining };
  }

  recentSubmissions.set(key, now);
  // Clean up old entries after cooldown
  setTimeout(() => recentSubmissions.delete(key), cooldownMs + 10000);

  return { isDuplicate: false, retryAfterSeconds: 0 };
}

/**
 * Sanitize string inputs to eliminate dangerous script tags and HTML injection
 */
export function sanitizeInput(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/[;&$><`]/g, "") // Strip dangerous shell/script control chars
    .trim();
}
