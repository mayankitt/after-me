import { rateLimit, rateLimitHeaders } from '../index';

// Each test uses a unique key so the shared in-memory store doesn't bleed between tests
function uniqueKey(base: string) {
  return `${base}:${Math.random().toString(36).slice(2)}`;
}

describe('rateLimit', () => {
  it('allows requests within the limit', () => {
    const key = uniqueKey('allow');
    const result = rateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.limit).toBe(3);
  });

  it('tracks successive requests correctly', () => {
    const key = uniqueKey('track');
    rateLimit(key, { limit: 3, windowMs: 60_000 }); // 1st
    rateLimit(key, { limit: 3, windowMs: 60_000 }); // 2nd
    const result = rateLimit(key, { limit: 3, windowMs: 60_000 }); // 3rd (at limit)
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('blocks the request that exceeds the limit', () => {
    const key = uniqueKey('block');
    rateLimit(key, { limit: 2, windowMs: 60_000 }); // 1st
    rateLimit(key, { limit: 2, windowMs: 60_000 }); // 2nd — at limit
    const result = rateLimit(key, { limit: 2, windowMs: 60_000 }); // 3rd — over limit
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets the counter after the window expires', () => {
    const key = uniqueKey('reset');
    // Exhaust the window
    rateLimit(key, { limit: 1, windowMs: 1 }); // 1st
    rateLimit(key, { limit: 1, windowMs: 1 }); // 2nd — blocked

    // Wait for the window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = rateLimit(key, { limit: 1, windowMs: 1 });
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(0);
        resolve();
      }, 10);
    });
  });

  it('uses independent counters for different keys', () => {
    const keyA = uniqueKey('keyA');
    const keyB = uniqueKey('keyB');
    rateLimit(keyA, { limit: 1, windowMs: 60_000 }); // exhaust keyA
    rateLimit(keyA, { limit: 1, windowMs: 60_000 });
    const resultB = rateLimit(keyB, { limit: 1, windowMs: 60_000 }); // keyB is fresh
    expect(resultB.success).toBe(true);
  });
});

describe('rateLimitHeaders', () => {
  it('returns standard rate limit headers on success', () => {
    const result = rateLimit(uniqueKey('headers'), { limit: 10, windowMs: 60_000 });
    const headers = rateLimitHeaders(result);
    expect(headers['X-RateLimit-Limit']).toBe('10');
    expect(Number(headers['X-RateLimit-Remaining'])).toBeGreaterThanOrEqual(0);
    expect(Number(headers['X-RateLimit-Reset'])).toBeGreaterThan(0);
    expect(headers['Retry-After']).toBeUndefined();
  });

  it('includes Retry-After header on failure', () => {
    const key = uniqueKey('retry-after');
    rateLimit(key, { limit: 1, windowMs: 60_000 });
    rateLimit(key, { limit: 1, windowMs: 60_000 });
    const result = rateLimit(key, { limit: 1, windowMs: 60_000 });
    const headers = rateLimitHeaders(result);
    expect(result.success).toBe(false);
    expect(headers['Retry-After']).toBeDefined();
    expect(Number(headers['Retry-After'])).toBeGreaterThan(0);
  });
});
