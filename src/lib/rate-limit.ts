import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for development)
// In production, use Redis or Upstash
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window
   * @default 100
   */
  limit?: number;
  
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  window?: number;
  
  /**
   * Custom key generator function
   * @default Uses IP address
   */
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Rate limiting middleware
 * Returns null if request is allowed, NextResponse if rate limit exceeded
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): Promise<NextResponse | null> {
  const {
    limit = 100,
    window = 60 * 1000, // 1 minute
    keyGenerator = defaultKeyGenerator,
  } = options;

  const key = keyGenerator(request);
  const now = Date.now();

  // Get or create rate limit entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + window,
    };
    return null;
  }

  // Increment count
  store[key].count++;

  // Check if limit exceeded
  if (store[key].count > limit) {
    const resetIn = Math.ceil((store[key].resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
        retryAfter: resetIn,
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetIn.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': store[key].resetTime.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  // Try to get real IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Include path for per-endpoint rate limiting
  const path = new URL(request.url).pathname;
  
  return `${ip}:${path}`;
}

/**
 * Stricter rate limit for sensitive endpoints (login, register, etc.)
 */
export async function strictRateLimit(request: NextRequest): Promise<NextResponse | null> {
  return rateLimit(request, {
    limit: 10, // 10 requests
    window: 60 * 1000, // per minute
  });
}

/**
 * Rate limit for API endpoints
 */
export async function apiRateLimit(request: NextRequest): Promise<NextResponse | null> {
  return rateLimit(request, {
    limit: 100, // 100 requests
    window: 60 * 1000, // per minute
  });
}

/**
 * Rate limit for Google API calls (per tenant)
 */
export async function googleApiRateLimit(
  request: NextRequest,
  tenantId: number
): Promise<NextResponse | null> {
  return rateLimit(request, {
    limit: 50, // 50 requests
    window: 60 * 1000, // per minute
    keyGenerator: () => `google-api:tenant-${tenantId}`,
  });
}

