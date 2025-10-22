/**
 * AI Response Caching
 * 
 * Caches AI-generated content to reduce API costs and improve response times.
 * Uses Upstash Redis for distributed caching.
 */

import { Redis } from '@upstash/redis';
import { logger } from './logger';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Cache key types
 */
export type CacheKeyType = 
  | 'description'      // Company description generation
  | 'sentiment'        // Review sentiment analysis
  | 'translation'      // Content translation
  | 'summary'          // Content summarization
  | 'keywords';        // SEO keywords generation

/**
 * Generate cache key for AI responses
 */
export function generateAICacheKey(
  type: CacheKeyType,
  identifier: string | number,
  additionalParams?: Record<string, string | number>
): string {
  const base = `ai:${type}:${identifier}`;
  
  if (additionalParams) {
    const params = Object.entries(additionalParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join(':');
    return `${base}:${params}`;
  }
  
  return base;
}

/**
 * Get cached AI response
 */
export async function getCachedAIResponse(
  key: string
): Promise<string | null> {
  if (!redis) {
    logger.warn('Redis not configured, skipping cache lookup');
    return null;
  }

  try {
    const cached = await redis.get<string>(key);
    
    if (cached) {
      logger.info('AI cache hit', { key });
    }
    
    return cached;
  } catch (error) {
    logger.error('Error getting cached AI response', { key, error });
    return null;
  }
}

/**
 * Set cached AI response
 */
export async function setCachedAIResponse(
  key: string,
  value: string,
  ttl: number = 30 * 24 * 60 * 60 // 30 days default
): Promise<void> {
  if (!redis) {
    logger.warn('Redis not configured, skipping cache set');
    return;
  }

  try {
    await redis.setex(key, ttl, value);
    logger.info('AI response cached', { key, ttl });
  } catch (error) {
    logger.error('Error caching AI response', { key, error });
  }
}

/**
 * Invalidate cached AI response
 */
export async function invalidateAICache(key: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.del(key);
    logger.info('AI cache invalidated', { key });
  } catch (error) {
    logger.error('Error invalidating AI cache', { key, error });
  }
}

/**
 * Invalidate all AI caches for a specific company
 */
export async function invalidateCompanyAICache(companyId: number): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    // Get all keys for this company
    const patterns = [
      `ai:description:${companyId}*`,
      `ai:keywords:${companyId}*`,
      `ai:summary:${companyId}*`,
    ];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info('Company AI cache invalidated', { companyId, count: keys.length });
      }
    }
  } catch (error) {
    logger.error('Error invalidating company AI cache', { companyId, error });
  }
}

/**
 * Get cache statistics
 */
export async function getAICacheStats(): Promise<{
  totalKeys: number;
  keysByType: Record<CacheKeyType, number>;
}> {
  if (!redis) {
    return { totalKeys: 0, keysByType: {} as Record<CacheKeyType, number> };
  }

  try {
    const allKeys = await redis.keys('ai:*');
    const keysByType: Record<string, number> = {};

    for (const key of allKeys) {
      const type = key.split(':')[1];
      keysByType[type] = (keysByType[type] || 0) + 1;
    }

    return {
      totalKeys: allKeys.length,
      keysByType: keysByType as Record<CacheKeyType, number>,
    };
  } catch (error) {
    logger.error('Error getting AI cache stats', { error });
    return { totalKeys: 0, keysByType: {} as Record<CacheKeyType, number> };
  }
}

/**
 * Wrapper function to get or generate AI content with caching
 */
export async function getOrGenerateAI<T extends string>(
  cacheKey: string,
  generator: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try cache first
  const cached = await getCachedAIResponse(cacheKey);
  if (cached) {
    return cached as T;
  }

  // Generate new content
  const content = await generator();

  // Cache the result
  await setCachedAIResponse(cacheKey, content, ttl);

  return content;
}

