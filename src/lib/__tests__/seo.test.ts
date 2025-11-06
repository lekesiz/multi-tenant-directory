/**
 * SEO Utility Functions Tests
 */

import {
  generateMetaTags,
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateRobotsMeta,
  generateCanonicalUrl,
} from '../seo';

describe('SEO Utilities', () => {
  describe('generateMetaTags', () => {
    test('should generate default meta tags for home page', () => {
      const tags = generateMetaTags('haguenau.pro', 'home');
      
      expect(tags.title).toContain('Haguenau.PRO');
      expect(tags.description).toContain('Haguenau');
      expect(tags.keywords).toContain('haguenau');
      expect(tags.canonical).toBe('https://haguenau.pro');
    });

    test('should generate meta tags for annuaire page', () => {
      const tags = generateMetaTags('haguenau.pro', 'annuaire');
      
      expect(tags.title).toContain('Annuaire');
      expect(tags.canonical).toBe('https://haguenau.pro/annuaire');
    });

    test('should generate meta tags for company page', () => {
      const company = {
        name: 'Test Company',
        city: 'Haguenau',
        slug: 'test-company',
        categories: ['IT', 'Services'],
        customDescription: 'A test company',
        logoUrl: 'https://example.com/logo.png',
      };

      const tags = generateMetaTags('haguenau.pro', 'company', { company });
      
      expect(tags.title).toContain('Test Company');
      expect(tags.description).toContain('A test company');
      expect(tags.ogImage).toBe('https://example.com/logo.png');
      expect(tags.canonical).toBe('https://haguenau.pro/companies/test-company');
    });

    test('should generate meta tags for category page', () => {
      const tags = generateMetaTags('haguenau.pro', 'category', { category: 'Restaurant' });
      
      expect(tags.title).toContain('Restaurant');
      expect(tags.description).toContain('Restaurant');
      expect(tags.canonical).toContain('restaurant');
    });

    test('should handle company without custom description', () => {
      const company = {
        name: 'Test Company',
        city: 'Haguenau',
        slug: 'test-company',
        categories: ['IT'],
      };

      const tags = generateMetaTags('haguenau.pro', 'company', { company });
      
      expect(tags.description).toContain('Test Company');
      expect(tags.description).toContain('Haguenau');
    });

    test('should capitalize city name correctly', () => {
      const tags = generateMetaTags('paris.pro', 'home');
      
      expect(tags.title).toContain('Paris');
    });

    test('should fallback to defaults for unknown page', () => {
      const tags = generateMetaTags('haguenau.pro', 'unknown');
      
      expect(tags.title).toContain('Haguenau.PRO');
    });
  });

  describe('generateOrganizationSchema', () => {
    test('should generate valid organization schema', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toContain('Haguenau');
      expect(schema.url).toBe('https://haguenau.pro');
    });

    test('should include contact information', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema.contactPoint).toBeDefined();
      expect(schema.contactPoint.telephone).toBeDefined();
      expect(schema.contactPoint.contactType).toBe('customer service');
    });

    test('should include address', () => {
      const schema = generateOrganizationSchema('haguenau.pro');
      
      expect(schema.address).toBeDefined();
      expect(schema.address['@type']).toBe('PostalAddress');
      expect(schema.address.addressCountry).toBe('FR');
    });
  });

  describe('generateLocalBusinessSchema', () => {
    const company = {
      name: 'Test Business',
      slug: 'test-business',
      phone: '+33123456789',
      email: 'test@example.com',
      address: '1 Rue Test',
      city: 'Haguenau',
      postalCode: '67500',
      latitude: 48.8,
      longitude: 7.8,
      logoUrl: 'https://example.com/logo.png',
      website: 'https://example.com',
    };

    test('should generate valid local business schema', () => {
      const schema = generateLocalBusinessSchema(company, 'haguenau.pro');
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('LocalBusiness');
      expect(schema.name).toBe('Test Business');
    });

    test('should include contact information', () => {
      const schema = generateLocalBusinessSchema(company, 'haguenau.pro');
      
      expect(schema.telephone).toBe('+33123456789');
      expect(schema.email).toBe('test@example.com');
    });

    test('should include address', () => {
      const schema = generateLocalBusinessSchema(company, 'haguenau.pro');
      
      expect(schema.address).toBeDefined();
      expect(schema.address.streetAddress).toBe('1 Rue Test');
      expect(schema.address.postalCode).toBe('67500');
    });

    test('should include geo coordinates', () => {
      const schema = generateLocalBusinessSchema(company, 'haguenau.pro');
      
      expect(schema.geo).toBeDefined();
      expect(schema.geo.latitude).toBe(48.8);
      expect(schema.geo.longitude).toBe(7.8);
    });

    test('should handle missing geo coordinates', () => {
      const companyWithoutGeo = { ...company, latitude: null, longitude: null };
      const schema = generateLocalBusinessSchema(companyWithoutGeo, 'haguenau.pro');
      
      expect(schema.geo).toBeUndefined();
    });
  });

  describe('generateBreadcrumbSchema', () => {
    test('should generate valid breadcrumb schema', () => {
      const items = [
        { name: 'Home', url: 'https://haguenau.pro' },
        { name: 'Annuaire', url: 'https://haguenau.pro/annuaire' },
        { name: 'Company', url: 'https://haguenau.pro/companies/test' },
      ];

      const schema = generateBreadcrumbSchema(items);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
    });

    test('should set correct positions', () => {
      const items = [
        { name: 'Home', url: 'https://haguenau.pro' },
        { name: 'Annuaire', url: 'https://haguenau.pro/annuaire' },
      ];

      const schema = generateBreadcrumbSchema(items);
      
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
    });

    test('should handle empty items', () => {
      const schema = generateBreadcrumbSchema([]);
      
      expect(schema.itemListElement).toHaveLength(0);
    });
  });

  describe('generateItemListSchema', () => {
    test('should generate valid item list schema', () => {
      const companies = [
        { name: 'Company 1', slug: 'company-1' },
        { name: 'Company 2', slug: 'company-2' },
      ];

      const schema = generateItemListSchema(companies, 'haguenau.pro');
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ItemList');
      expect(schema.itemListElement).toHaveLength(2);
    });

    test('should set correct positions and URLs', () => {
      const companies = [
        { name: 'Company 1', slug: 'company-1' },
        { name: 'Company 2', slug: 'company-2' },
      ];

      const schema = generateItemListSchema(companies, 'haguenau.pro');
      
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].url).toBe('https://haguenau.pro/companies/company-1');
      expect(schema.itemListElement[1].position).toBe(2);
    });

    test('should handle empty companies array', () => {
      const schema = generateItemListSchema([], 'haguenau.pro');
      
      expect(schema.itemListElement).toHaveLength(0);
    });
  });

  describe('generateRobotsMeta', () => {
    test('should generate index, follow by default', () => {
      const robots = generateRobotsMeta();
      
      expect(robots).toBe('index, follow');
    });

    test('should generate noindex, follow', () => {
      const robots = generateRobotsMeta(false, true);
      
      expect(robots).toBe('noindex, follow');
    });

    test('should generate index, nofollow', () => {
      const robots = generateRobotsMeta(true, false);
      
      expect(robots).toBe('index, nofollow');
    });

    test('should generate noindex, nofollow', () => {
      const robots = generateRobotsMeta(false, false);
      
      expect(robots).toBe('noindex, nofollow');
    });
  });

  describe('generateCanonicalUrl', () => {
    test('should generate canonical URL without path', () => {
      const url = generateCanonicalUrl('haguenau.pro');
      
      expect(url).toBe('https://haguenau.pro/');
    });

    test('should generate canonical URL with path', () => {
      const url = generateCanonicalUrl('haguenau.pro', '/annuaire');
      
      expect(url).toBe('https://haguenau.pro/annuaire');
    });

    test('should handle path without leading slash', () => {
      const url = generateCanonicalUrl('haguenau.pro', 'annuaire');
      
      expect(url).toBe('https://haguenau.pro/annuaire');
    });

    test('should handle empty path', () => {
      const url = generateCanonicalUrl('haguenau.pro', '');
      
      expect(url).toBe('https://haguenau.pro/');
    });
  });
});
