/**
 * Sliding-window rate limiter.
 *
 * Uses an in-memory Map — suitable for single-instance deployments (e.g.
 * traditional Node.js server, self-hosted Next.js).
 *
 * For serverless / horizontally-scaled deployments (Vercel, AWS Lambda) swap
 * `MemoryStore` for a Redis-backed store (e.g. @upstash/ratelimit) by
 * implementing the `RateLimitStore` interface below.
 *
 * Usage:
 *   const result = rateLimit(`upload:${userId}`, { limit: 10, windowMs: 60_000 });
 *   if (!result.success) return rateLimitResponse(result);
 */

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether this request is within the allowed rate. */
  success: boolean;
  /** Remaining requests in the current window. */
  remaining: number;
  /** Unix timestamp (ms) when the window resets. */
  reset: number;
  /** Total limit for the window. */
  limit: number;
}

// ─── In-memory store ─────────────────────────────────────────────────────────

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Prune expired entries every 5 minutes to prevent unbounded memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check and increment the rate-limit counter for `key`.
 * Returns a `RateLimitResult` that tells you whether to allow the request.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const { limit, windowMs } = opts;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs, limit };
  }

  entry.count++;

  if (entry.count > limit) {
    return { success: false, remaining: 0, reset: entry.resetAt, limit };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetAt,
    limit,
  };
}

/**
 * Build rate-limit HTTP response headers from a result object.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
    ...(result.success ? {} : { 'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)) }),
  };
}
