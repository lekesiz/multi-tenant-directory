import { logger } from '@/lib/logger';
import { unstable_cache } from 'next/cache';

// Cache durations in seconds
export const CACHE_DURATIONS = {
  STATIC: 60 * 60 * 24 * 7, // 1 week
  DYNAMIC: 60 * 5, // 5 minutes
  COMPANY: 60 * 10, // 10 minutes
  REVIEWS: 60 * 5, // 5 minutes
  SEARCH: 60 * 2, // 2 minutes
  USER_CONTENT: 60 * 1, // 1 minute
} as const;

// Create a cached version of a function
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  revalidate: number = CACHE_DURATIONS.DYNAMIC,
  tags?: string[]
): T {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate,
      tags,
    }
  ) as T;
}

// Cache tags for invalidation
export const CACHE_TAGS = {
  COMPANIES: 'companies',
  REVIEWS: 'reviews',
  DOMAINS: 'domains',
  USERS: 'users',
  ANALYTICS: 'analytics',
} as const;

// Helper function to generate cache keys
export function generateCacheKey(...parts: (string | number)[]): string {
  return parts.map(part => String(part)).join(':');
}

// Memory cache for frequently accessed data
class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();

  set(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Create memory cache instances
export const memoryCache = new MemoryCache();

// Cache wrapper with memory cache fallback
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try memory cache first
  const cached = memoryCache.get(key) as T | null;
  if (cached !== null) {
    return cached;
  }

  // Fetch data and cache it
  try {
    const data = await fetchFn();
    memoryCache.set(key, data, ttlSeconds);
    return data;
  } catch (error) {
    logger.error('Cache fetch error:', error);
    throw error;
  }
}