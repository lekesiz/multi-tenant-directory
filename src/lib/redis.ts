import { logger } from '@/lib/logger';
import { Redis } from '@upstash/redis';

// Initialize Redis client (Upstash Redis for serverless)
// If UPSTASH_REDIS_REST_URL is not set, use in-memory cache fallback
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory cache fallback for development
const memoryCache = new Map<string, { value: any; expiry: number }>();

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 3600 = 1 hour)
}

/**
 * Get a value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const value = await redis.get<T>(key);
      return value;
    } else {
      // In-memory fallback
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.value as T;
      }
      memoryCache.delete(key);
      return null;
    }
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const ttl = options.ttl || 3600; // Default 1 hour

  try {
    if (redis) {
      await redis.set(key, value, { ex: ttl });
    } else {
      // In-memory fallback
      memoryCache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000,
      });
    }
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

/**
 * Delete a value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    if (redis) {
      // Upstash Redis doesn't support SCAN, so we need to track keys manually
      // For now, just log a warning
      logger.warn('Pattern deletion not supported with Upstash Redis');
    } else {
      // In-memory fallback
      const keys = Array.from(memoryCache.keys());
      const regex = new RegExp(pattern.replace('*', '.*'));
      keys.forEach((key) => {
        if (regex.test(key)) {
          memoryCache.delete(key);
        }
      });
    }
  } catch (error) {
    logger.error('Cache pattern delete error:', error);
  }
}

/**
 * Cache wrapper for functions
 * Usage: const result = await cacheWrapper('key', () => expensiveOperation(), { ttl: 3600 });
 */
export async function cacheWrapper<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  await setCache(key, result, options);
  return result;
}

/**
 * Clear all cache (use with caution!)
 */
export async function clearAllCache(): Promise<void> {
  try {
    if (redis) {
      await redis.flushdb();
    } else {
      memoryCache.clear();
    }
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
}

// Cache key generators
export const CacheKeys = {
  company: (slug: string) => `company:${slug}`,
  companies: (page: number, category?: string) => 
    `companies:${page}:${category || 'all'}`,
  categories: () => 'categories:all',
  reviews: (companyId: string, page: number) => 
    `reviews:${companyId}:${page}`,
  stats: (companyId: string) => `stats:${companyId}`,
  sitemap: (type: string) => `sitemap:${type}`,
  search: (query: string, page: number) => 
    `search:${query}:${page}`,
};

