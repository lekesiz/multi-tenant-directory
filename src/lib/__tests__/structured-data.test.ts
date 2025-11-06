/**
 * Structured Data Generator Tests
 */

import { generateOrganizationSchema, generateLocalBusinessSchema } from '../structured-data';

describe('Structured Data Generators', () => {
  describe('generateOrganizationSchema', () => {
    test('should generate valid organization schema', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Haguenau.PRO');
      expect(schema.url).toBe('https://haguenau.pro');
    });

    test('should capitalize city name correctly', () => {
      const schema = generateOrganizationSchema('paris.pro');
      
      expect(schema.name).toBe('Paris.PRO');
      expect(schema.address.addressLocality).toBe('Paris');
    });

    test('should include description', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema.description).toContain('Haguenau');
      expect(schema.description).toContain('Annuaire');
    });

    test('should include logo URL', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema.logo).toBe('https://haguenau.pro/logo.png');
    });

    test('should include sameAs links', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema.sameAs).toContain('https://haguenau.pro/annuaire');
      expect(schema.sameAs).toContain('https://haguenau.pro/categories');
    });

    test('should include address', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema.address['@type']).toBe('PostalAddress');
      expect(schema.address.addressCountry).toBe('FR');
    });

    test('should include contact point', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema.contactPoint['@type']).toBe('ContactPoint');
      expect(schema.contactPoint.contactType).toBe('customer support');
    });

    test('should include offer catalog', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema.hasOfferCatalog['@type']).toBe('OfferCatalog');
    });
  });

  describe('generateLocalBusinessSchema', () => {
    const baseCompany = {
      id: 1,
      name: 'Test Business',
      slug: 'test-business',
      city: 'Haguenau',
      address: '1 Rue Test',
      postalCode: '67500',
      phone: '+33123456789',
      email: 'test@example.com',
      website: 'https://example.com',
      logoUrl: 'https://example.com/logo.png',
      coverImageUrl: 'https://example.com/cover.png',
      categories: ['IT', 'Services'],
      latitude: 48.8,
      longitude: 7.8,
      businessHours: 'Lun-Ven: 09:00-18:00',
      rating: 4.5,
      reviewCount: 10,
      googlePlaceId: 'test-place-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      domainId: 1,
      isActive: true,
      isVerified: false,
      isPremium: false,
      isFeatured: false,
    };

    test('should generate valid local business schema', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toContain('LocalBusiness');
      expect(schema['@type']).toContain('Organization');
    });

    test('should include company name and description', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema.name).toBe('Test Business');
      expect(schema.description).toContain('Haguenau');
    });

    test('should use custom description if available', () => {
      const companyWithCustomDesc = {
        ...baseCompany,
        content: [{ customDescription: 'Custom description here' }],
      };
      
      const schema = generateLocalBusinessSchema(companyWithCustomDesc, 'haguenau.pro');
      
      expect(schema.description).toBe('Custom description here');
    });

    test('should include contact information', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema.telephone).toBe('+33123456789');
      expect(schema.email).toBe('test@example.com');
    });

    test('should include website in sameAs', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema.sameAs).toContain('https://example.com');
    });

    test('should include address', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema.address).toBeDefined();
      expect(schema.address!['@type']).toBe('PostalAddress');
      expect(schema.address!.streetAddress).toBe('1 Rue Test');
      expect(schema.address!.addressLocality).toBe('Haguenau');
      expect(schema.address!.postalCode).toBe('67500');
    });

    test('should include geo coordinates', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema.geo).toBeDefined();
      expect(schema.geo!['@type']).toBe('GeoCoordinates');
      expect(schema.geo!.latitude).toBe(48.8);
      expect(schema.geo!.longitude).toBe(7.8);
    });

    test('should include opening hours', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema.openingHours).toBe('Lun-Ven: 09:00-18:00');
    });

    test('should include categories', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema.knowsAbout).toEqual(['IT', 'Services']);
    });

    test('should include aggregate rating', () => {
      const schema = generateLocalBusinessSchema(baseCompany, 'haguenau.pro');
      
      expect(schema.aggregateRating).toBeDefined();
      expect(schema.aggregateRating!['@type']).toBe('AggregateRating');
      expect(schema.aggregateRating!.ratingValue).toBe('4.5');
      expect(schema.aggregateRating!.reviewCount).toBe(10);
    });

    test('should include reviews', () => {
      const companyWithReviews = {
        ...baseCompany,
        reviews: [
          {
            id: 1,
            companyId: 1,
            authorName: 'John Doe',
            authorPhoto: 'https://example.com/photo.jpg',
            rating: 5,
            comment: 'Great service!',
            reviewDate: '2024-01-01',
            source: 'google',
            googleReviewId: null,
            createdAt: new Date(),
          },
        ],
      };
      
      const schema = generateLocalBusinessSchema(companyWithReviews, 'haguenau.pro');
      
      expect(schema.review).toBeDefined();
      expect(schema.review).toHaveLength(1);
      expect(schema.review![0]['@type']).toBe('Review');
      expect(schema.review![0].author.name).toBe('John Doe');
    });

    test('should handle company without address', () => {
      const companyWithoutAddress = {
        ...baseCompany,
        address: null,
        city: null,
        postalCode: null,
      };
      
      const schema = generateLocalBusinessSchema(companyWithoutAddress as any, 'haguenau.pro');
      
      expect(schema.address).toBeUndefined();
    });

    test('should handle company without geo coordinates', () => {
      const companyWithoutGeo = {
        ...baseCompany,
        latitude: null,
        longitude: null,
      };
      
      const schema = generateLocalBusinessSchema(companyWithoutGeo as any, 'haguenau.pro');
      
      expect(schema.geo).toBeUndefined();
    });

    test('should handle company without rating', () => {
      const companyWithoutRating = {
        ...baseCompany,
        rating: null,
        reviewCount: 0,
      };
      
      const schema = generateLocalBusinessSchema(companyWithoutRating as any, 'haguenau.pro');
      
      expect(schema.aggregateRating).toBeUndefined();
    });

    test('should calculate average rating from reviews if no rating provided', () => {
      const companyWithReviews = {
        ...baseCompany,
        rating: null,
        reviewCount: null,
        reviews: [
          {
            id: 1,
            companyId: 1,
            authorName: 'John',
            authorPhoto: null,
            rating: 4,
            comment: 'Good',
            reviewDate: '2024-01-01',
            source: 'google' as const,
            googleReviewId: null,
            createdAt: new Date(),
          },
          {
            id: 2,
            companyId: 1,
            authorName: 'Jane',
            authorPhoto: null,
            rating: 5,
            comment: 'Excellent',
            reviewDate: '2024-01-02',
            source: 'google' as const,
            googleReviewId: null,
            createdAt: new Date(),
          },
        ],
        _count: { reviews: 2 },
      };
      
      const schema = generateLocalBusinessSchema(companyWithReviews as any, 'haguenau.pro');
      
      expect(schema.aggregateRating).toBeDefined();
      expect(schema.aggregateRating!.ratingValue).toBe('4.5');
    });
  });
});
