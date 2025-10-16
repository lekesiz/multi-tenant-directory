/**
 * Review Submission API Tests
 *
 * Tests for POST /api/reviews/submit
 */

import { POST } from '@/app/api/reviews/submit/route';
import { prismaMock } from '@/__mocks__/prisma';
import {
  createMockRequest,
  parseResponseJSON,
  expectValidationError,
  expectJSONResponse,
} from '@/test-utils/api-test-helpers';
import { companyFixtures, reviewFixtures } from '@/test-utils/fixtures';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}));

// Mock rate limiter
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ success: true })),
}));

describe('POST /api/reviews/submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validReviewData = {
    companyId: 101,
    authorName: 'Test User',
    authorEmail: 'test@example.com',
    rating: 5,
    comment: 'Excellent service!',
  };

  describe('Successful submission', () => {
    it('should create a review successfully', async () => {
      prismaMock.company.findUnique.mockResolvedValue(companyFixtures.bakery);
      prismaMock.review.create.mockResolvedValue({
        ...reviewFixtures.positive,
        ...validReviewData,
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/reviews/submit',
        body: validReviewData,
      });

      const response = await POST(request);
      const data = await expectJSONResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.review).toBeDefined();
      expect(data.data.review.rating).toBe(5);
      expect(data.data.review.authorName).toBe('Test User');
    });

    it('should set isApproved to false by default', async () => {
      prismaMock.company.findUnique.mockResolvedValue(companyFixtures.bakery);
      prismaMock.review.create.mockResolvedValue({
        ...reviewFixtures.pending,
        ...validReviewData,
        isApproved: false,
      });

      const request = createMockRequest({
        method: 'POST',
        body: validReviewData,
      });

      await POST(request);

      expect(prismaMock.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isApproved: false,
          }),
        })
      );
    });

    it('should handle review with photos', async () => {
      const reviewWithPhotos = {
        ...validReviewData,
        photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      };

      prismaMock.company.findUnique.mockResolvedValue(companyFixtures.bakery);
      prismaMock.review.create.mockResolvedValue({
        ...reviewFixtures.withPhotos,
        ...reviewWithPhotos,
      });

      const request = createMockRequest({
        method: 'POST',
        body: reviewWithPhotos,
      });

      const response = await POST(request);
      const data = await parseResponseJSON(response);

      expect(data.data.review.photos).toHaveLength(2);
    });
  });

  describe('Validation errors', () => {
    it('should reject missing companyId', async () => {
      const invalidData = { ...validReviewData };
      delete invalidData.companyId;

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      await expectValidationError(response, 'companyId');
    });

    it('should reject missing authorName', async () => {
      const invalidData = { ...validReviewData };
      delete invalidData.authorName;

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      await expectValidationError(response, 'authorName');
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        ...validReviewData,
        authorEmail: 'not-an-email',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      await expectValidationError(response, 'email');
    });

    it('should reject rating < 1', async () => {
      const invalidData = {
        ...validReviewData,
        rating: 0,
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      await expectValidationError(response, 'rating');
    });

    it('should reject rating > 5', async () => {
      const invalidData = {
        ...validReviewData,
        rating: 6,
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      await expectValidationError(response, 'rating');
    });

    it('should reject comment that is too short', async () => {
      const invalidData = {
        ...validReviewData,
        comment: 'OK', // Less than 10 characters
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      await expectValidationError(response, 'comment');
    });

    it('should reject comment that is too long', async () => {
      const invalidData = {
        ...validReviewData,
        comment: 'A'.repeat(1001), // More than 1000 characters
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      await expectValidationError(response, 'comment');
    });
  });

  describe('Business logic errors', () => {
    it('should return 404 if company not found', async () => {
      prismaMock.company.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        method: 'POST',
        body: validReviewData,
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
      const data = await parseResponseJSON(response);
      expect(data.error).toContain('Company not found');
    });

    it('should handle database errors gracefully', async () => {
      prismaMock.company.findUnique.mockResolvedValue(companyFixtures.bakery);
      prismaMock.review.create.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        method: 'POST',
        body: validReviewData,
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await parseResponseJSON(response);
      expect(data.error).toBeDefined();
    });
  });

  describe('Photo validation', () => {
    it('should accept up to 5 photos', async () => {
      const reviewWith5Photos = {
        ...validReviewData,
        photos: [
          'https://example.com/1.jpg',
          'https://example.com/2.jpg',
          'https://example.com/3.jpg',
          'https://example.com/4.jpg',
          'https://example.com/5.jpg',
        ],
      };

      prismaMock.company.findUnique.mockResolvedValue(companyFixtures.bakery);
      prismaMock.review.create.mockResolvedValue({
        ...reviewFixtures.withPhotos,
        ...reviewWith5Photos,
      });

      const request = createMockRequest({
        method: 'POST',
        body: reviewWith5Photos,
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should reject more than 5 photos', async () => {
      const reviewWithTooManyPhotos = {
        ...validReviewData,
        photos: Array(6).fill('https://example.com/photo.jpg'),
      };

      const request = createMockRequest({
        method: 'POST',
        body: reviewWithTooManyPhotos,
      });

      const response = await POST(request);
      await expectValidationError(response, 'photos');
    });

    it('should reject invalid photo URLs', async () => {
      const reviewWithInvalidPhotos = {
        ...validReviewData,
        photos: ['not-a-url', 'also-not-a-url'],
      };

      const request = createMockRequest({
        method: 'POST',
        body: reviewWithInvalidPhotos,
      });

      const response = await POST(request);
      await expectValidationError(response, 'photos');
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limits', async () => {
      const { rateLimit } = require('@/lib/rate-limit');
      rateLimit.mockReturnValueOnce({ success: false });

      const request = createMockRequest({
        method: 'POST',
        body: validReviewData,
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
      const data = await parseResponseJSON(response);
      expect(data.error).toContain('rate limit');
    });
  });
});
