/**
 * Rate Limiting Middleware
 * Prevents abuse and ensures fair usage of API resources
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis';
import { logger } from '@/lib/logger';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Check rate limit for a given key
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / config.windowMs)}`;

  try {
    // Get current count
    const current = await getCache<number>(windowKey);
    const count = (current || 0) + 1;

    // Calculate reset time
    const resetTime = Math.ceil(now / config.windowMs) * config.windowMs;
    const reset = new Date(resetTime);

    // Save new count with TTL
    await setCache(windowKey, count, { ttl: Math.ceil(config.windowMs / 1000) });

    return {
      allowed: count <= config.max,
      limit: config.max,
      remaining: Math.max(0, config.max - count),
      reset,
    };
  } catch (error) {
    logger.error('Rate limit check error:', error);
    // Fail open - allow request on error
    return {
      allowed: true,
      limit: config.max,
      remaining: config.max,
      reset: new Date(now + config.windowMs),
    };
  }
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  // Get identifier (IP address or user ID)
  const identifier = getIdentifier(request);
  const key = `${identifier}:${request.nextUrl.pathname}`;

  // Check rate limit
  const result = await checkRateLimit(key, config);

  // Add rate limit headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.reset.toISOString());

  // Return 429 if limit exceeded
  if (!result.allowed) {
    logger.warn(`Rate limit exceeded for ${identifier} on ${request.nextUrl.pathname}`);

    return NextResponse.json(
      {
        error: config.message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil((result.reset.getTime() - Date.now()) / 1000),
      },
      {
        status: 429,
        headers,
      }
    );
  }

  // Continue with request
  return null;
}

/**
 * Get client identifier from request
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from session (if authenticated)
  // For now, use IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] :
             request.headers.get('x-real-ip') ||
             'unknown';

  return ip;
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Strict: 10 requests per minute
  strict: {
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many requests. Please try again in a minute.',
  },

  // Standard: 100 requests per minute
  standard: {
    windowMs: 60 * 1000,
    max: 100,
    message: 'Rate limit exceeded. Please try again later.',
  },

  // Lenient: 1000 requests per hour
  lenient: {
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: 'Hourly rate limit exceeded.',
  },

  // Auth endpoints: 5 requests per minute
  auth: {
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts. Please try again in a minute.',
  },

  // API: 1000 requests per hour
  api: {
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: 'API rate limit exceeded.',
  },
};

/**
 * Helper to create rate-limited API route
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = RateLimitPresets.standard
) {
  return async (req: NextRequest) => {
    const rateLimitResponse = await rateLimitMiddleware(req, config);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return handler(req);
  };
}
