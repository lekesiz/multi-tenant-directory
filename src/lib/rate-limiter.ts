import { logger } from './logger';

/**
 * Rate Limiter
 *
 * Implements token bucket algorithm for API rate limiting.
 * Uses in-memory storage for development. For production, use Redis.
 *
 * @see https://en.wikipedia.org/wiki/Token_bucket
 */

interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

// In-memory storage (use Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Rate limit configurations
export const RATE_LIMITS = {
  // API routes
  api: {
    requests: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  // Authentication endpoints
  auth: {
    requests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  },

  // Review submission
  reviews: {
    requests: 10,
    windowMs: 60 * 60 * 1000, // 10 requests per hour
  },

  // Contact form
  contact: {
    requests: 3,
    windowMs: 60 * 60 * 1000, // 3 requests per hour
  },

  // AI features (based on subscription tier)
  ai: {
    free: {
      requests: 5,
      windowMs: 24 * 60 * 60 * 1000, // 5 per day
    },
    basic: {
      requests: 20,
      windowMs: 24 * 60 * 60 * 1000, // 20 per day
    },
    pro: {
      requests: 100,
      windowMs: 24 * 60 * 60 * 1000, // 100 per day
    },
    enterprise: {
      requests: -1, // Unlimited
      windowMs: 0,
    },
  },

  // Admin API
  admin: {
    requests: 1000,
    windowMs: 60 * 1000, // 1000 requests per minute
  },
};

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * Clean up old rate limit records
 */
function cleanupOldRecords(windowMs: number): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((record, key) => {
    // Delete if last refill was more than window ago
    if (now - record.lastRefill > windowMs * 2) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Check rate limit using token bucket algorithm
 *
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and rate limit info
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{
  allowed: boolean;
  remaining: number;
  reset: Date;
  limit: number;
}> {
  // Unlimited rate limit
  if (limit === -1) {
    return {
      allowed: true,
      remaining: -1,
      reset: new Date(Date.now() + windowMs),
      limit: -1,
    };
  }

  // Clean up old records periodically (1% chance)
  if (Math.random() < 0.01) {
    cleanupOldRecords(windowMs);
  }

  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Calculate tokens to refill
  const refillRate = limit / windowMs; // tokens per millisecond

  if (!record) {
    // First request, create new record with full tokens
    const newRecord: RateLimitRecord = {
      tokens: limit - 1, // Consume 1 token
      lastRefill: now,
    };
    rateLimitStore.set(identifier, newRecord);

    return {
      allowed: true,
      remaining: limit - 1,
      reset: new Date(now + windowMs),
      limit,
    };
  }

  // Calculate how many tokens to add based on time elapsed
  const elapsed = now - record.lastRefill;
  const tokensToAdd = elapsed * refillRate;

  // Update tokens (cap at limit)
  record.tokens = Math.min(limit, record.tokens + tokensToAdd);
  record.lastRefill = now;

  // Check if we have enough tokens
  if (record.tokens >= 1) {
    // Consume 1 token
    record.tokens -= 1;
    rateLimitStore.set(identifier, record);

    return {
      allowed: true,
      remaining: Math.floor(record.tokens),
      reset: new Date(now + (limit - record.tokens) / refillRate),
      limit,
    };
  }

  // Not enough tokens, rate limit exceeded
  const timeUntilRefill = (1 - record.tokens) / refillRate;

  return {
    allowed: false,
    remaining: 0,
    reset: new Date(now + timeUntilRefill),
    limit,
  };
}

/**
 * Rate limit middleware for API routes
 *
 * @param request - The HTTP request
 * @param config - Rate limit configuration
 * @returns Rate limit result or Response object if rate limited
 */
export async function rateLimit(
  request: Request,
  config: { requests: number; windowMs: number }
): Promise<
  | {
      allowed: boolean;
      remaining: number;
      reset: Date;
      limit: number;
    }
  | Response
> {
  const clientId = getClientIdentifier(request);
  const key = `${request.url}:${clientId}`;

  const result = await checkRateLimit(key, config.requests, config.windowMs);

  if (!result.allowed) {
    logger.warn('Rate limit exceeded', {
      url: request.url,
      clientId,
      limit: config.requests,
      window: `${config.windowMs / 1000}s`,
    });

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again after ${result.reset.toISOString()}`,
        limit: result.limit,
        reset: result.reset.toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toISOString(),
          'Retry-After': Math.ceil(
            (result.reset.getTime() - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  return result;
}

/**
 * Rate limit helper for API routes
 *
 * Usage:
 * ```typescript
 * import { rateLimitApi } from '@/lib/rate-limiter';
 *
 * export async function POST(request: Request) {
 *   const rateLimitResult = await rateLimitApi(request);
 *   if (rateLimitResult instanceof Response) {
 *     return rateLimitResult; // Rate limit exceeded
 *   }
 *
 *   // ... your API logic
 * }
 * ```
 */
export async function rateLimitApi(request: Request) {
  return rateLimit(request, RATE_LIMITS.api);
}

export async function rateLimitAuth(request: Request) {
  return rateLimit(request, RATE_LIMITS.auth);
}

export async function rateLimitReviews(request: Request) {
  return rateLimit(request, RATE_LIMITS.reviews);
}

export async function rateLimitContact(request: Request) {
  return rateLimit(request, RATE_LIMITS.contact);
}

export async function rateLimitAdmin(request: Request) {
  return rateLimit(request, RATE_LIMITS.admin);
}

/**
 * Rate limit for AI features based on subscription tier
 *
 * @param userId - User's ID
 * @param tier - User's subscription tier
 */
export async function rateLimitAI(
  userId: string,
  tier: 'free' | 'basic' | 'pro' | 'enterprise'
): Promise<{
  allowed: boolean;
  remaining: number;
  reset: Date;
  limit: number;
}> {
  const config = RATE_LIMITS.ai[tier];
  const key = `ai:${userId}`;

  const result = await checkRateLimit(key, config.requests, config.windowMs);

  if (!result.allowed) {
    logger.warn('AI rate limit exceeded', {
      userId,
      tier,
      limit: config.requests,
      window: `${config.windowMs / (1000 * 60 * 60)}h`,
    });
  }

  return result;
}

/**
 * Get rate limit statistics (for admin dashboard)
 */
export function getRateLimitStats(): {
  totalKeys: number;
  recentlyLimited: number;
} {
  const now = Date.now();
  let recentlyLimited = 0;

  rateLimitStore.forEach(record => {
    // Count as recently limited if tokens < 1 and refilled in last 5 minutes
    if (record.tokens < 1 && now - record.lastRefill < 5 * 60 * 1000) {
      recentlyLimited++;
    }
  });

  return {
    totalKeys: rateLimitStore.size,
    recentlyLimited,
  };
}

/**
 * Clear rate limit for a specific identifier (for testing or admin override)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
  logger.info('Rate limit cleared', { identifier });
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  const size = rateLimitStore.size;
  rateLimitStore.clear();
  logger.info('All rate limits cleared', { count: size });
}
