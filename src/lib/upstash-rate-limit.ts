import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Create Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Define rate limiting configurations
export const rateLimiters = {
  // General API rate limiting - 100 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Auth endpoints - stricter limit (10 per minute)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // Admin operations - moderate limit (50 per minute)
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'),
    analytics: true,
    prefix: 'ratelimit:admin',
  }),

  // Google Maps API - conservative limit (20 per minute)
  maps: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: 'ratelimit:maps',
  }),

  // Company creation/updates - very strict (5 per minute)
  company: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:company',
  }),

  // Search operations - moderate limit (30 per minute)
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:search',
  }),
};

// Helper function to get client identifier (IP + user agent hash)
export function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  const userAgent = request.headers.get('user-agent') || '';
  
  // Create a simple hash for the user agent to add uniqueness
  const hash = userAgent
    .split('')
    .reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  
  return `${ip}:${hash}`;
}

// Rate limit middleware function
export async function checkRateLimit(
  rateLimiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const result = await rateLimiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset),
  };
}

// Rate limit response helper
export function createRateLimitResponse(rateLimitResult: {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}) {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  headers.set('X-RateLimit-Reset', rateLimitResult.reset.getTime().toString());

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again after ${rateLimitResult.reset.toISOString()}`,
        retryAfter: Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: Object.fromEntries(headers.entries()),
      }
    );
  }

  return null; // No rate limit exceeded
}

// Upstash rate limit functions for different use cases
export async function upstashApiRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const result = await checkRateLimit(rateLimiters.api, clientId);
  return createRateLimitResponse(result);
}

export async function upstashAuthRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const result = await checkRateLimit(rateLimiters.auth, clientId);
  return createRateLimitResponse(result);
}

export async function upstashAdminRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const result = await checkRateLimit(rateLimiters.admin, clientId);
  return createRateLimitResponse(result);
}

export async function upstashMapsRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const result = await checkRateLimit(rateLimiters.maps, clientId);
  return createRateLimitResponse(result);
}

export async function upstashCompanyRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const result = await checkRateLimit(rateLimiters.company, clientId);
  return createRateLimitResponse(result);
}

export async function upstashSearchRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const result = await checkRateLimit(rateLimiters.search, clientId);
  return createRateLimitResponse(result);
}

// Environment variable check helper
export function checkUpstashConfig(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}