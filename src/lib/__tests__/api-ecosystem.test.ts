/**
 * API Ecosystem Unit Tests
 * Tests for API key management, webhooks, and rate limiting
 */

import { ApiKeyService, WebhookService, RateLimitService } from '../api-ecosystem';
import crypto from 'crypto';

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    apiKey: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    webhook: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    webhookLog: {
      create: jest.fn(),
    },
  },
}));

// Mock fetch for webhook tests
global.fetch = jest.fn();

describe('API Ecosystem', () => {
  
  describe('API Key Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should generate valid API key', async () => {
      const mockApiKey = {
        id: 'key-123',
        name: 'Test Key',
        hashedKey: 'hashed_key',
        permissions: ['read'],
        createdAt: new Date(),
      };

      require('../prisma').prisma.apiKey.create.mockResolvedValue(mockApiKey);

      const result = await ApiKeyService.generateApiKey('user-123', 'Test Key', ['read']);

      expect(result.apiKey).toMatch(/^netz_[a-f0-9]{64}$/);
      expect(result.name).toBe('Test Key');
      expect(result.permissions).toEqual(['read']);
    });

    test('should validate API key correctly', async () => {
      const testKey = 'netz_' + crypto.randomBytes(32).toString('hex');
      const hashedKey = crypto.createHash('sha256').update(testKey).digest('hex');

      const mockKeyRecord = {
        id: 'key-123',
        businessOwnerId: 'user-123',
        permissions: ['read', 'write'],
        businessOwner: { id: 'user-123' },
      };

      require('../prisma').prisma.apiKey.findFirst.mockResolvedValue(mockKeyRecord);
      require('../prisma').prisma.apiKey.update.mockResolvedValue({});

      const result = await ApiKeyService.validateApiKey(testKey);

      expect(result).toEqual({
        businessOwnerId: 'user-123',
        permissions: ['read', 'write'],
      });
    });

    test('should reject invalid API key', async () => {
      require('../prisma').prisma.apiKey.findFirst.mockResolvedValue(null);

      const result = await ApiKeyService.validateApiKey('invalid_key');
      expect(result).toBeNull();
    });

    test('should reject non-netz API key', async () => {
      const result = await ApiKeyService.validateApiKey('other_prefix_123');
      expect(result).toBeNull();
    });
  });

  describe('Webhook Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (fetch as jest.Mock).mockClear();
    });

    test('should generate webhook signature correctly', () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = 'test_secret';

      const signature = WebhookService['generateSignature'](payload, secret);
      expect(signature).toMatch(/^[a-f0-9]{64}$/);
    });

    test('should verify webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = 'test_secret';
      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const isValid = WebhookService.verifySignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    test('should reject invalid webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = 'test_secret';
      const invalidSignature = 'invalid_signature';

      const isValid = WebhookService.verifySignature(payload, invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    test('should send webhook event successfully', async () => {
      const mockWebhook = {
        id: 'webhook-123',
        url: 'https://example.com/webhook',
        events: ['test.event'],
        secret: 'webhook_secret',
      };

      require('../prisma').prisma.webhook.findMany.mockResolvedValue([mockWebhook]);
      require('../prisma').prisma.webhookLog.create.mockResolvedValue({});
      require('../prisma').prisma.webhook.update.mockResolvedValue({});

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve('OK'),
      });

      const results = await WebhookService.sendWebhookEvent({
        type: 'test.event',
        data: { test: 'data' },
        businessOwnerId: 'user-123',
      });

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        mockWebhook.url,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Webhook-Event': 'test.event',
          }),
        })
      );
    });
  });

  describe('Rate Limiting Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should allow requests within limit', async () => {
      // Mock rate limit check (simplified)
      const result = await RateLimitService.checkRateLimit('test_identifier', 3600, 1000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.resetTime).toBeGreaterThan(Date.now() / 1000);
    });

    test('should calculate reset time correctly', async () => {
      const windowSize = 3600; // 1 hour
      const now = Math.floor(Date.now() / 1000);
      const expectedResetTime = now - (now % windowSize) + windowSize;

      const result = await RateLimitService.checkRateLimit('test_id', windowSize, 100);

      expect(result.resetTime).toBe(expectedResetTime);
    });
  });

  describe('Integration Service', () => {
    test('should handle webhook URL validation', () => {
      // Test valid URLs
      expect(() => new URL('https://example.com/webhook')).not.toThrow();
      expect(() => new URL('http://localhost:3000/webhook')).not.toThrow();

      // Test invalid URLs
      expect(() => new URL('invalid-url')).toThrow();
      expect(() => new URL('ftp://example.com')).not.toThrow(); // ftp is valid but not typical
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      require('../prisma').prisma.apiKey.findFirst.mockRejectedValue(new Error('Database error'));

      const result = await ApiKeyService.validateApiKey('netz_test_key');
      expect(result).toBeNull();
    });

    test('should handle network errors in webhooks', async () => {
      const mockWebhook = {
        id: 'webhook-123',
        url: 'https://example.com/webhook',
        events: ['test.event'],
        secret: 'webhook_secret',
      };

      require('../prisma').prisma.webhook.findMany.mockResolvedValue([mockWebhook]);
      require('../prisma').prisma.webhookLog.create.mockResolvedValue({});
      require('../prisma').prisma.webhook.update.mockResolvedValue({});

      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const results = await WebhookService.sendWebhookEvent({
        type: 'test.event',
        data: { test: 'data' },
      });

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Network error');
    });
  });
});