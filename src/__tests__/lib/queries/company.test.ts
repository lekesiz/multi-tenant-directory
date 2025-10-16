/**
 * Company Query Functions Tests
 *
 * Tests for src/lib/queries/company.ts
 */

import { prismaMock } from '@/__mocks__/prisma';
import {
  getCompanies,
  getCompanyBySlug,
  getCompaniesByCategory,
  getCompaniesByCity,
  searchCompanies,
} from '@/lib/queries/company';
import {
  companyFixtures,
  domainFixtures,
  companyContentFixtures,
  createCompanies,
} from '@/test-utils/fixtures';

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}));

describe('Company Query Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompanies', () => {
    it('should return all companies for a domain', async () => {
      const mockCompanies = [companyFixtures.bakery, companyFixtures.restaurant];

      prismaMock.company.findMany.mockResolvedValue(mockCompanies);

      const result = await getCompanies({
        domainId: domainFixtures.haguenau.id,
      });

      expect(result).toEqual(mockCompanies);
      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            content: expect.objectContaining({
              some: expect.objectContaining({
                domainId: domainFixtures.haguenau.id,
                isVisible: true,
              }),
            }),
          }),
        })
      );
    });

    it('should filter by category', async () => {
      prismaMock.company.findMany.mockResolvedValue([companyFixtures.bakery]);

      const result = await getCompanies({
        domainId: 1,
        category: 'Boulangerie',
      });

      expect(result).toHaveLength(1);
      expect(result[0].categories).toContain('Boulangerie');
      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categories: expect.objectContaining({
              has: 'Boulangerie',
            }),
          }),
        })
      );
    });

    it('should filter by city', async () => {
      prismaMock.company.findMany.mockResolvedValue([companyFixtures.bakery]);

      await getCompanies({
        domainId: 1,
        city: 'Haguenau',
      });

      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: 'Haguenau',
          }),
        })
      );
    });

    it('should filter verified companies only', async () => {
      prismaMock.company.findMany.mockResolvedValue([
        companyFixtures.bakery,
        companyFixtures.restaurant,
      ]);

      await getCompanies({
        domainId: 1,
        verified: true,
      });

      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verified: true,
          }),
        })
      );
    });

    it('should support pagination', async () => {
      const mockCompanies = createCompanies(10);
      prismaMock.company.findMany.mockResolvedValue(mockCompanies.slice(0, 5));

      await getCompanies({
        domainId: 1,
        skip: 0,
        take: 5,
      });

      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 5,
        })
      );
    });

    it('should order by rating by default', async () => {
      prismaMock.company.findMany.mockResolvedValue([]);

      await getCompanies({ domainId: 1 });

      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: 'desc' },
        })
      );
    });
  });

  describe('getCompanyBySlug', () => {
    it('should return company by slug', async () => {
      prismaMock.company.findUnique.mockResolvedValue(companyFixtures.bakery);

      const result = await getCompanyBySlug('boulangerie-patisserie-schneider-haguenau');

      expect(result).toEqual(companyFixtures.bakery);
      expect(prismaMock.company.findUnique).toHaveBeenCalledWith({
        where: { slug: 'boulangerie-patisserie-schneider-haguenau' },
        include: expect.any(Object),
      });
    });

    it('should return null for non-existent slug', async () => {
      prismaMock.company.findUnique.mockResolvedValue(null);

      const result = await getCompanyBySlug('non-existent-slug');

      expect(result).toBeNull();
    });

    it('should include reviews when requested', async () => {
      const companyWithReviews = {
        ...companyFixtures.bakery,
        reviews: [],
      };

      prismaMock.company.findUnique.mockResolvedValue(companyWithReviews);

      await getCompanyBySlug('test-slug', { includeReviews: true });

      expect(prismaMock.company.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            reviews: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('getCompaniesByCategory', () => {
    it('should return companies for a specific category', async () => {
      prismaMock.company.findMany.mockResolvedValue([
        companyFixtures.bakery,
      ]);

      const result = await getCompaniesByCategory('Boulangerie', { domainId: 1 });

      expect(result).toHaveLength(1);
      expect(result[0].categories).toContain('Boulangerie');
      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categories: { has: 'Boulangerie' },
          }),
        })
      );
    });

    it('should respect domain filtering', async () => {
      prismaMock.company.findMany.mockResolvedValue([]);

      await getCompaniesByCategory('Restaurant', { domainId: 2 });

      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            content: expect.objectContaining({
              some: expect.objectContaining({
                domainId: 2,
              }),
            }),
          }),
        })
      );
    });
  });

  describe('getCompaniesByCity', () => {
    it('should return companies for a specific city', async () => {
      prismaMock.company.findMany.mockResolvedValue([
        companyFixtures.bakery,
        companyFixtures.restaurant,
      ]);

      const result = await getCompaniesByCity('Haguenau', { domainId: 1 });

      expect(result).toHaveLength(2);
      expect(result.every((c) => c.city === 'Haguenau')).toBe(true);
    });
  });

  describe('searchCompanies', () => {
    it('should search companies by name', async () => {
      prismaMock.company.findMany.mockResolvedValue([companyFixtures.bakery]);

      const result = await searchCompanies({
        query: 'Schneider',
        domainId: 1,
      });

      expect(result).toHaveLength(1);
      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({
                  contains: 'Schneider',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should search companies by description', async () => {
      prismaMock.company.findMany.mockResolvedValue([companyFixtures.bakery]);

      await searchCompanies({
        query: 'artisanale',
        domainId: 1,
      });

      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                description: expect.objectContaining({
                  contains: 'artisanale',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should combine search with filters', async () => {
      prismaMock.company.findMany.mockResolvedValue([]);

      await searchCompanies({
        query: 'restaurant',
        domainId: 1,
        category: 'Restaurant',
        city: 'Haguenau',
      });

      expect(prismaMock.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                city: 'Haguenau',
              }),
              expect.objectContaining({
                categories: { has: 'Restaurant' },
              }),
            ]),
          }),
        })
      );
    });

    it('should return empty array for no results', async () => {
      prismaMock.company.findMany.mockResolvedValue([]);

      const result = await searchCompanies({
        query: 'nonexistent',
        domainId: 1,
      });

      expect(result).toEqual([]);
    });
  });
});
