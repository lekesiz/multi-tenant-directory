/**
 * @jest-environment node
 */

import { checkRateLimit, RateLimitPresets } from '@/middleware/rate-limit';
import { getCache, setCache } from '@/lib/redis';

// Mock Redis
jest.mock('@/lib/redis', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      (getCache as jest.Mock).mockResolvedValue(5);

      const result = await checkRateLimit('test-key', {
        windowMs: 60000,
        max: 10,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(setCache).toHaveBeenCalledWith(
        expect.any(String),
        6,
        expect.objectContaining({ ttl: expect.any(Number) })
      );
    });

    it('should block requests exceeding limit', async () => {
      (getCache as jest.Mock).mockResolvedValue(10);

      const result = await checkRateLimit('test-key', {
        windowMs: 60000,
        max: 10,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle first request correctly', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);

      const result = await checkRateLimit('test-key', {
        windowMs: 60000,
        max: 10,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should fail open on error', async () => {
      (getCache as jest.Mock).mockRejectedValue(new Error('Redis error'));

      const result = await checkRateLimit('test-key', RateLimitPresets.standard);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(result.limit);
    });
  });

  describe('Rate Limit Presets', () => {
    it('should have correct strict preset', () => {
      expect(RateLimitPresets.strict.max).toBe(10);
      expect(RateLimitPresets.strict.windowMs).toBe(60000);
    });

    it('should have correct standard preset', () => {
      expect(RateLimitPresets.standard.max).toBe(100);
      expect(RateLimitPresets.standard.windowMs).toBe(60000);
    });

    it('should have correct auth preset', () => {
      expect(RateLimitPresets.auth.max).toBe(5);
      expect(RateLimitPresets.auth.windowMs).toBe(60000);
    });
  });
});
