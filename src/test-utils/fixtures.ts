/**
 * Test Data Fixtures
 *
 * Provides realistic test data for companies, reviews, users, domains, etc.
 */

import { Company, Review, User, Domain, CompanyContent } from '@prisma/client';

/**
 * Domain Fixtures
 */
export const domainFixtures = {
  haguenau: {
    id: 1,
    name: 'haguenau.pro',
    isActive: true,
    siteTitle: null,
    siteDescription: null,
    logoUrl: null,
    primaryColor: null,
    settings: {},
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as Domain,

  strasbourg: {
    id: 2,
    name: 'strasbourg.directory',
    isActive: true,
    siteTitle: null,
    siteDescription: null,
    logoUrl: null,
    primaryColor: null,
    settings: {},
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as Domain,

  inactive: {
    id: 3,
    name: 'test.local',
    isActive: false,
    siteTitle: null,
    siteDescription: null,
    logoUrl: null,
    primaryColor: null,
    settings: {},
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as Domain,
};

/**
 * Company Fixtures
 */
export const companyFixtures = {
  bakery: {
    id: 101,
    name: 'Boulangerie Pâtisserie Schneider',
    slug: 'boulangerie-patisserie-schneider-haguenau',
    categories: ['Boulangerie', 'Pâtisserie'],
    address: '15 Grand Rue',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 45 67',
    email: null,
    website: 'https://www.boulangerie-schneider.fr/',
    latitude: 48.815685,
    longitude: 7.788875,
    googlePlaceId: null,
    logoUrl: null,
    coverImageUrl: null,
    businessHours: null,
    rating: 4.5,
    reviewCount: 12,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as Company,

  restaurant: {
    id: 102,
    name: 'Restaurant Au Cerf',
    slug: 'restaurant-au-cerf-haguenau',
    categories: ['Restaurant'],
    address: '16 Place de la République',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 07 10',
    email: 'contact@au-cerf.fr',
    website: 'https://www.au-cerf.fr/',
    latitude: 48.817433,
    longitude: 7.790052,
    googlePlaceId: null,
    logoUrl: null,
    coverImageUrl: null,
    businessHours: null,
    rating: 4.8,
    reviewCount: 24,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as Company,

  unverified: {
    id: 103,
    name: 'New Business',
    slug: 'new-business-haguenau',
    categories: ['Services'],
    address: '1 Rue Test',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 00 00 00',
    email: null,
    website: null,
    latitude: 48.816,
    longitude: 7.789,
    googlePlaceId: null,
    logoUrl: null,
    coverImageUrl: null,
    businessHours: null,
    rating: 0,
    reviewCount: 0,
    createdAt: new Date('2025-10-16'),
    updatedAt: new Date('2025-10-16'),
  } as Company,
};

/**
 * Review Fixtures
 */
export const reviewFixtures = {
  positive: {
    id: 201,
    companyId: 101,
    authorName: 'Marie Dupont',
    authorPhoto: null,
    authorEmail: 'marie@example.com',
    rating: 5,
    comment: 'Excellent service et produits de qualité! Je recommande vivement.',
    source: 'website',
    reviewDate: new Date('2025-10-01'),
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
    helpfulCount: 0,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
  } as Review,

  negative: {
    id: 202,
    companyId: 101,
    authorName: 'Jean Martin',
    authorPhoto: null,
    authorEmail: 'jean@example.com',
    rating: 2,
    comment: "Déçu par la qualité, l'accueil n'était pas chaleureux.",
    source: 'website',
    reviewDate: new Date('2025-10-01'),
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
    helpfulCount: 0,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-02'),
  } as Review,

  pending: {
    id: 203,
    companyId: 102,
    authorName: 'Sophie Leblanc',
    authorPhoto: null,
    authorEmail: 'sophie@example.com',
    rating: 4,
    comment: 'Bon restaurant, mais un peu cher.',
    source: 'website',
    reviewDate: new Date('2025-10-15'),
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
    helpfulCount: 0,
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15'),
  } as Review,

  withPhotos: {
    id: 204,
    companyId: 102,
    authorName: 'Pierre Dubois',
    authorPhoto: null,
    authorEmail: 'pierre@example.com',
    rating: 5,
    comment: 'Magnifique! Les photos parlent d\'elles-mêmes.',
    source: 'website',
    reviewDate: new Date('2025-10-13'),
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
    helpfulCount: 0,
    createdAt: new Date('2025-10-13'),
    updatedAt: new Date('2025-10-14'),
  } as Review,
};

/**
 * User Fixtures
 */
export const userFixtures = {
  admin: {
    id: 1,
    email: 'admin@haguenau.pro',
    name: 'Admin User',
    passwordHash: '$2a$10$abc123...', // bcrypt hash
    role: 'ADMIN',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as User,

  businessOwner: {
    id: 1001,
    email: 'owner@au-cerf.fr',
    name: 'Restaurant Owner',
    passwordHash: '$2a$10$def456...', // bcrypt hash
    role: 'BUSINESS_OWNER',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as User,

  regular: {
    id: 2001,
    email: 'user@example.com',
    name: 'Regular User',
    passwordHash: '$2a$10$ghi789...', // bcrypt hash
    role: 'USER',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as User,
};

/**
 * CompanyContent Fixtures (Multi-tenant)
 */
export const companyContentFixtures = {
  bakeryHaguenau: {
    id: 301,
    companyId: 101,
    domainId: 1, // haguenau.pro
    isVisible: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as CompanyContent,

  restaurantHaguenau: {
    id: 302,
    companyId: 102,
    domainId: 1, // haguenau.pro
    isVisible: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as CompanyContent,

  restaurantStrasbourg: {
    id: 303,
    companyId: 102,
    domainId: 2, // strasbourg.directory
    isVisible: false, // Not visible in Strasbourg
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as CompanyContent,
};

/**
 * Helper: Create company with content (multi-tenant)
 */
export function createCompanyWithContent(
  company: Company,
  domainId: number,
  isVisible = true
) {
  return {
    ...company,
    content: [
      {
        id: Math.floor(Math.random() * 10000),
        companyId: company.id,
        domainId,
        isVisible,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };
}

/**
 * Helper: Create company with reviews
 */
export function createCompanyWithReviews(company: Company, reviews: Review[]) {
  return {
    ...company,
    reviews,
    rating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    reviewCount: reviews.length,
  };
}

/**
 * Helper: Create multiple companies
 */
export function createCompanies(count: number): Company[] {
  return Array.from({ length: count }, (_, i) => ({
    ...companyFixtures.bakery,
    id: 1000 + i,
    name: `Business ${i + 1}`,
    slug: `business-${i + 1}-haguenau`,
  }));
}

/**
 * Helper: Create multiple reviews
 */
export function createReviews(companyId: number, count: number): Review[] {
  return Array.from({ length: count }, (_, i) => ({
    ...reviewFixtures.positive,
    id: 2000 + i,
    companyId,
    authorName: `User ${i + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
  }));
}
