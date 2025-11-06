/**
 * Validation Schemas Tests
 */

import {
  companySchema,
  companyContentSchema,
  domainSchema,
  loginSchema,
  searchSchema,
} from '../validations';

describe('Validation Schemas', () => {
  describe('companySchema', () => {
    const validCompany = {
      name: 'Test Company',
      slug: 'test-company',
      categories: ['IT', 'Services'],
    };

    test('should validate valid company data', () => {
      const result = companySchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    test('should reject company with short name', () => {
      const result = companySchema.safeParse({ ...validCompany, name: 'A' });
      expect(result.success).toBe(false);
    });

    test('should reject company with invalid slug', () => {
      const result = companySchema.safeParse({ ...validCompany, slug: 'Test Company!' });
      expect(result.success).toBe(false);
    });

    test('should reject company with invalid postal code', () => {
      const result = companySchema.safeParse({ ...validCompany, postalCode: '1234' });
      expect(result.success).toBe(false);
    });

    test('should accept valid postal code', () => {
      const result = companySchema.safeParse({ ...validCompany, postalCode: '67500' });
      expect(result.success).toBe(true);
    });

    test('should reject company with invalid phone', () => {
      const result = companySchema.safeParse({ ...validCompany, phone: '123' });
      expect(result.success).toBe(false);
    });

    test('should accept valid French phone', () => {
      const result = companySchema.safeParse({ ...validCompany, phone: '0123456789' });
      expect(result.success).toBe(true);
    });

    test('should accept valid international phone', () => {
      const result = companySchema.safeParse({ ...validCompany, phone: '+33123456789' });
      expect(result.success).toBe(true);
    });

    test('should reject company with invalid email', () => {
      const result = companySchema.safeParse({ ...validCompany, email: 'invalid' });
      expect(result.success).toBe(false);
    });

    test('should accept valid email', () => {
      const result = companySchema.safeParse({ ...validCompany, email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    test('should reject company with invalid website URL', () => {
      const result = companySchema.safeParse({ ...validCompany, website: 'not-a-url' });
      expect(result.success).toBe(false);
    });

    test('should accept valid website URL', () => {
      const result = companySchema.safeParse({ ...validCompany, website: 'https://example.com' });
      expect(result.success).toBe(true);
    });

    test('should reject company with invalid latitude', () => {
      const result = companySchema.safeParse({ ...validCompany, latitude: 100 });
      expect(result.success).toBe(false);
    });

    test('should accept valid latitude', () => {
      const result = companySchema.safeParse({ ...validCompany, latitude: 48.8 });
      expect(result.success).toBe(true);
    });

    test('should reject company with invalid longitude', () => {
      const result = companySchema.safeParse({ ...validCompany, longitude: 200 });
      expect(result.success).toBe(false);
    });

    test('should accept valid longitude', () => {
      const result = companySchema.safeParse({ ...validCompany, longitude: 7.8 });
      expect(result.success).toBe(true);
    });

    test('should reject company without categories', () => {
      const result = companySchema.safeParse({ ...validCompany, categories: [] });
      expect(result.success).toBe(false);
    });

    test('should reject company with invalid logo URL', () => {
      const result = companySchema.safeParse({ ...validCompany, logoUrl: 'not-a-url' });
      expect(result.success).toBe(false);
    });
  });

  describe('companyContentSchema', () => {
    const validContent = {
      companyId: 1,
      domainId: 1,
      isVisible: true,
    };

    test('should validate valid content data', () => {
      const result = companyContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    test('should reject content with long description', () => {
      const longDescription = 'a'.repeat(1001);
      const result = companyContentSchema.safeParse({ ...validContent, customDescription: longDescription });
      expect(result.success).toBe(false);
    });

    test('should accept valid description', () => {
      const result = companyContentSchema.safeParse({ ...validContent, customDescription: 'A valid description' });
      expect(result.success).toBe(true);
    });

    test('should reject content with long promotions', () => {
      const longPromotions = 'a'.repeat(501);
      const result = companyContentSchema.safeParse({ ...validContent, promotions: longPromotions });
      expect(result.success).toBe(false);
    });

    test('should reject content with long meta title', () => {
      const longTitle = 'a'.repeat(61);
      const result = companyContentSchema.safeParse({ ...validContent, metaTitle: longTitle });
      expect(result.success).toBe(false);
    });

    test('should reject content with long meta description', () => {
      const longDescription = 'a'.repeat(161);
      const result = companyContentSchema.safeParse({ ...validContent, metaDescription: longDescription });
      expect(result.success).toBe(false);
    });
  });

  describe('domainSchema', () => {
    const validDomain = {
      name: 'haguenau.pro',
      isActive: true,
    };

    test('should validate valid domain data', () => {
      const result = domainSchema.safeParse(validDomain);
      expect(result.success).toBe(true);
    });

    test('should reject invalid domain name', () => {
      const result = domainSchema.safeParse({ ...validDomain, name: 'invalid domain' });
      expect(result.success).toBe(false);
    });

    test('should accept domain with subdomain', () => {
      const result = domainSchema.safeParse({ ...validDomain, name: 'sub.haguenau.pro' });
      expect(result.success).toBe(true);
    });

    test('should reject domain with short site title', () => {
      const result = domainSchema.safeParse({ ...validDomain, siteTitle: 'AB' });
      expect(result.success).toBe(false);
    });

    test('should reject domain with long site title', () => {
      const longTitle = 'a'.repeat(61);
      const result = domainSchema.safeParse({ ...validDomain, siteTitle: longTitle });
      expect(result.success).toBe(false);
    });

    test('should reject domain with short site description', () => {
      const result = domainSchema.safeParse({ ...validDomain, siteDescription: 'Short' });
      expect(result.success).toBe(false);
    });

    test('should reject domain with long site description', () => {
      const longDescription = 'a'.repeat(161);
      const result = domainSchema.safeParse({ ...validDomain, siteDescription: longDescription });
      expect(result.success).toBe(false);
    });

    test('should reject domain with invalid logo URL', () => {
      const result = domainSchema.safeParse({ ...validDomain, logoUrl: 'not-a-url' });
      expect(result.success).toBe(false);
    });

    test('should reject domain with invalid color', () => {
      const result = domainSchema.safeParse({ ...validDomain, primaryColor: 'red' });
      expect(result.success).toBe(false);
    });

    test('should accept domain with valid hex color', () => {
      const result = domainSchema.safeParse({ ...validDomain, primaryColor: '#FF0000' });
      expect(result.success).toBe(true);
    });

    test('should accept domain with lowercase hex color', () => {
      const result = domainSchema.safeParse({ ...validDomain, primaryColor: '#ff0000' });
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'password123',
    };

    test('should validate valid login data', () => {
      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    test('should reject login with invalid email', () => {
      const result = loginSchema.safeParse({ ...validLogin, email: 'invalid' });
      expect(result.success).toBe(false);
    });

    test('should reject login with short password', () => {
      const result = loginSchema.safeParse({ ...validLogin, password: '12345' });
      expect(result.success).toBe(false);
    });

    test('should accept login with long password', () => {
      const result = loginSchema.safeParse({ ...validLogin, password: 'verylongpassword123' });
      expect(result.success).toBe(true);
    });
  });

  describe('searchSchema', () => {
    test('should validate empty search', () => {
      const result = searchSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    test('should validate search with query', () => {
      const result = searchSchema.safeParse({ q: 'restaurant' });
      expect(result.success).toBe(true);
    });

    test('should validate search with category', () => {
      const result = searchSchema.safeParse({ category: 'IT' });
      expect(result.success).toBe(true);
    });

    test('should validate search with city', () => {
      const result = searchSchema.safeParse({ city: 'Haguenau' });
      expect(result.success).toBe(true);
    });

    test('should validate search with valid rating', () => {
      const result = searchSchema.safeParse({ rating: 4 });
      expect(result.success).toBe(true);
    });

    test('should reject search with invalid rating (too low)', () => {
      const result = searchSchema.safeParse({ rating: 0 });
      expect(result.success).toBe(false);
    });

    test('should reject search with invalid rating (too high)', () => {
      const result = searchSchema.safeParse({ rating: 6 });
      expect(result.success).toBe(false);
    });

    test('should validate search with all fields', () => {
      const result = searchSchema.safeParse({
        q: 'restaurant',
        category: 'Food',
        city: 'Haguenau',
        rating: 5,
      });
      expect(result.success).toBe(true);
    });
  });
});
