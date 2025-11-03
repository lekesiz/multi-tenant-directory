/**
 * API Response Caching Utility
 * 
 * Provides caching for API routes to reduce database load and improve response times.
 * Uses Upstash Redis for distributed caching across serverless functions.
 */

import { Redis } from '@upstash/redis';
import { logger } from './logger';

// Initialize Redis client (optional - gracefully degrades if not configured)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Cache key prefixes for different data types
 */
export const CACHE_PREFIXES = {
  SEARCH: 'search',
  COMPANY: 'company',
  CATEGORIES: 'categories',
  DOMAIN: 'domain',
  REVIEWS: 'reviews',
} as const;

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 5 * 60,           // 5 minutes - frequently changing data
  MEDIUM: 30 * 60,         // 30 minutes - moderately stable data
  LONG: 60 * 60,           // 1 hour - stable data
  VERY_LONG: 24 * 60 * 60, // 24 hours - rarely changing data
} as const;

/**
 * Generate cache key
 */
export function generateCacheKey(
  prefix: string,
  ...parts: (string | number | undefined)[]
): string {
  const cleanParts = parts.filter(p => p !== undefined && p !== null);
  return `api:${prefix}:${cleanParts.join(':')}`;
}

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached) {
      logger.info('Cache hit', { key });
    }
    return cached;
  } catch (error) {
    logger.error('Cache get error', { key, error });
    return null;
  }
}

/**
 * Set cached data
 */
export async function setCached<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.setex(key, ttl, JSON.stringify(data));
    logger.info('Cache set', { key, ttl });
  } catch (error) {
    logger.error('Cache set error', { key, error });
  }
}

/**
 * Delete cached data
 */
export async function deleteCached(key: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.del(key);
    logger.info('Cache deleted', { key });
  } catch (error) {
    logger.error('Cache delete error', { key, error });
  }
}

/**
 * Delete multiple cached keys by pattern
 */
export async function deleteCachedPattern(pattern: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info('Cache pattern deleted', { pattern, count: keys.length });
    }
  } catch (error) {
    logger.error('Cache pattern delete error', { pattern, error });
  }
}

/**
 * Wrapper function to get or fetch data with caching
 */
export async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try cache first
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Cache the result
  await setCached(key, data, ttl);

  return data;
}

/**
 * Invalidate company-related caches
 */
export async function invalidateCompanyCache(companyId: number): Promise<void> {
  const patterns = [
    `api:${CACHE_PREFIXES.COMPANY}:${companyId}*`,
    `api:${CACHE_PREFIXES.REVIEWS}:${companyId}*`,
    `api:${CACHE_PREFIXES.SEARCH}:*`, // Invalidate all search results
  ];

  for (const pattern of patterns) {
    await deleteCachedPattern(pattern);
  }
}

/**
 * Invalidate domain-related caches
 */
export async function invalidateDomainCache(domainId: number): Promise<void> {
  const patterns = [
    `api:${CACHE_PREFIXES.DOMAIN}:${domainId}*`,
    `api:${CACHE_PREFIXES.CATEGORIES}:${domainId}*`,
    `api:${CACHE_PREFIXES.SEARCH}:*`, // Invalidate all search results
  ];

  for (const pattern of patterns) {
    await deleteCachedPattern(pattern);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalKeys: number;
  keysByPrefix: Record<string, number>;
}> {
  if (!redis) {
    return { totalKeys: 0, keysByPrefix: {} };
  }

  try {
    const allKeys = await redis.keys('api:*');
    const keysByPrefix: Record<string, number> = {};

    for (const key of allKeys) {
      const prefix = key.split(':')[1];
      keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
    }

    return {
      totalKeys: allKeys.length,
      keysByPrefix,
    };
  } catch (error) {
    logger.error('Error getting cache stats', { error });
    return { totalKeys: 0, keysByPrefix: {} };
  }
}

