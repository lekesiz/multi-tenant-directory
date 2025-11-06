/**
 * Utils Tests
 * Tests for utility functions
 */

import {
  cn,
  slugify,
  formatPhoneNumber,
  formatAddress,
  getInitials,
  formatRating,
  getStarRating,
  truncate,
  formatDate,
  formatDateTime,
  getRelativeTime,
  generateMetaDescription,
  isValidUrl,
  getColorFromString,
} from '../utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    test('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBeTruthy();
    });

    test('should handle conditional classes', () => {
      const result = cn('base', false && 'hidden', true && 'visible');
      expect(result).toContain('base');
      expect(result).toContain('visible');
    });

    test('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toBeTruthy();
    });
  });

  describe('slugify', () => {
    test('should convert text to lowercase', () => {
      expect(slugify('HELLO WORLD')).toBe('hello-world');
    });

    test('should replace spaces with hyphens', () => {
      expect(slugify('hello world test')).toBe('hello-world-test');
    });

    test('should remove special characters', () => {
      expect(slugify('hello@world!test#')).toBe('helloworldtest');
    });

    test('should handle accented characters', () => {
      expect(slugify('café résumé')).toBe('cafe-resume');
      expect(slugify('Zürich')).toBe('zurich');
    });

    test('should handle multiple consecutive spaces', () => {
      expect(slugify('hello    world')).toBe('hello-world');
    });

    test('should remove leading and trailing hyphens', () => {
      expect(slugify('-hello-world-')).toBe('hello-world');
    });

    test('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });

    test('should handle French company names', () => {
      expect(slugify('Boulangerie Pâtisserie')).toBe('boulangerie-patisserie');
      expect(slugify('Café de la Gare')).toBe('cafe-de-la-gare');
    });

    test('should handle numbers', () => {
      expect(slugify('Company 123')).toBe('company-123');
    });
  });

  describe('formatPhoneNumber', () => {
    test('should format French phone number', () => {
      const result = formatPhoneNumber('0123456789');
      expect(result).toContain('01');
      expect(result).toContain('23');
    });

    test('should handle international format', () => {
      const result = formatPhoneNumber('33123456789');
      expect(result).toContain('+33');
    });

    test('should handle phone with spaces', () => {
      const result = formatPhoneNumber('01 23 45 67 89');
      expect(result).toBeTruthy();
    });
  });

  describe('formatAddress', () => {
    test('should format address with all parts', () => {
      const result = formatAddress('1 Rue de la Paix', 'Paris', '75001');
      expect(result).toBe('1 Rue de la Paix, 75001, Paris');
    });

    test('should format address without postal code', () => {
      const result = formatAddress('1 Rue de la Paix', 'Paris');
      expect(result).toBe('1 Rue de la Paix, Paris');
    });

    test('should format address only', () => {
      const result = formatAddress('1 Rue de la Paix');
      expect(result).toBe('1 Rue de la Paix');
    });
  });

  describe('getInitials', () => {
    test('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    test('should get initials from single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    test('should get initials from three names', () => {
      expect(getInitials('John Paul Smith')).toBe('JP');
    });

    test('should convert to uppercase', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('formatRating', () => {
    test('should format rating to one decimal', () => {
      expect(formatRating(4.567)).toBe('4.6');
    });

    test('should format whole numbers', () => {
      expect(formatRating(5)).toBe('5.0');
    });

    test('should format zero', () => {
      expect(formatRating(0)).toBe('0.0');
    });
  });

  describe('getStarRating', () => {
    test('should show 5 full stars for rating 5', () => {
      expect(getStarRating(5)).toBe('★★★★★');
    });

    test('should show 4 full stars and 1 empty for rating 4', () => {
      expect(getStarRating(4)).toBe('★★★★☆');
    });

    test('should show half star for 4.5', () => {
      expect(getStarRating(4.5)).toBe('★★★★½');
    });

    test('should show no stars for rating 0', () => {
      expect(getStarRating(0)).toBe('☆☆☆☆☆');
    });

    test('should show half star for 3.7', () => {
      expect(getStarRating(3.7)).toBe('★★★½☆');
    });
  });

  describe('truncate', () => {
    test('should truncate long text', () => {
      expect(truncate('Hello World Test', 10)).toBe('Hello Worl...');
    });

    test('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    test('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });
  });

  describe('formatDate', () => {
    test('should format Date object', () => {
      const date = new Date('2025-11-06');
      const result = formatDate(date);
      expect(result).toBeTruthy();
      expect(result).toContain('2025');
    });

    test('should format date string', () => {
      const result = formatDate('2025-11-06');
      expect(result).toBeTruthy();
    });
  });

  describe('formatDateTime', () => {
    test('should format Date object with time', () => {
      const date = new Date('2025-11-06T14:30:00');
      const result = formatDateTime(date);
      expect(result).toBeTruthy();
      expect(result).toContain('2025');
    });

    test('should format datetime string', () => {
      const result = formatDateTime('2025-11-06T14:30:00');
      expect(result).toBeTruthy();
    });
  });

  describe('getRelativeTime', () => {
    test('should return "À l\'instant" for recent time', () => {
      const now = new Date();
      expect(getRelativeTime(now)).toBe('À l\'instant');
    });

    test('should return minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = getRelativeTime(fiveMinutesAgo);
      expect(result).toContain('min');
    });

    test('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = getRelativeTime(twoHoursAgo);
      expect(result).toContain('h');
    });

    test('should return days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = getRelativeTime(threeDaysAgo);
      expect(result).toContain('j');
    });
  });

  describe('generateMetaDescription', () => {
    test('should truncate long text to 160 chars', () => {
      const longText = 'a'.repeat(200);
      const result = generateMetaDescription(longText);
      expect(result.length).toBeLessThanOrEqual(163); // 160 + '...'
    });

    test('should remove newlines', () => {
      const result = generateMetaDescription('Hello\nWorld');
      expect(result).not.toContain('\n');
    });

    test('should remove extra spaces', () => {
      const result = generateMetaDescription('Hello    World');
      expect(result).toBe('Hello World');
    });

    test('should handle custom max length', () => {
      const result = generateMetaDescription('Hello World Test', 10);
      expect(result.length).toBeLessThanOrEqual(13);
    });
  });

  describe('isValidUrl', () => {
    test('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('getColorFromString', () => {
    test('should generate consistent color for same string', () => {
      const color1 = getColorFromString('test');
      const color2 = getColorFromString('test');
      expect(color1).toBe(color2);
    });

    test('should generate different colors for different strings', () => {
      const color1 = getColorFromString('test1');
      const color2 = getColorFromString('test2');
      expect(color1).not.toBe(color2);
    });

    test('should return hex color format', () => {
      const color = getColorFromString('test');
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});
