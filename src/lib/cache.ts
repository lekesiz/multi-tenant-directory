/**
 * Simple in-memory cache for expensive operations
 * Useful for caching category translations, domain lookups, etc.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 300) {
    this.cache = new Map();
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    this.cache.set(key, { value, expiresAt: Date.now() + ttl });
  }

  async getOrCompute<T>(key: string, computeFn: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await computeFn();
    this.set(key, value, ttlSeconds);
    return value;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) this.cache.delete(key);
    }
  }
}

export const categoryCache = new SimpleCache(600);
export const domainCache = new SimpleCache(300);

if (typeof window === 'undefined') {
  setInterval(() => {
    categoryCache.cleanup();
    domainCache.cleanup();
  }, 5 * 60 * 1000);
}

export default SimpleCache;
