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
    subdomain: 'haguenau',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as Domain,

  strasbourg: {
    id: 2,
    name: 'strasbourg.directory',
    subdomain: 'strasbourg',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as Domain,

  inactive: {
    id: 3,
    name: 'test.local',
    subdomain: 'test',
    isActive: false,
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
    description:
      'Boulangerie artisanale proposant une large gamme de pains, viennoiseries et pâtisseries. Ils utilisent des ingrédients de qualité et offrent un service chaleureux.',
    descriptionShort:
      'Boulangerie artisanale proposant une large gamme de pains, viennoiseries et pâtisseries.',
    keywords: ['boulangerie', 'pâtisserie', 'pain', 'viennoiseries', 'haguenau'],
    hours: {
      monday: { open: false },
      tuesday: { open: true, openTime: '06:30', closeTime: '18:30' },
      wednesday: { open: true, openTime: '06:30', closeTime: '18:30' },
      thursday: { open: true, openTime: '06:30', closeTime: '18:30' },
      friday: { open: true, openTime: '06:30', closeTime: '18:30' },
      saturday: { open: true, openTime: '06:30', closeTime: '18:30' },
      sunday: { open: true, openTime: '07:00', closeTime: '12:30' },
    },
    photos: [],
    rating: 4.5,
    reviewCount: 12,
    verified: true,
    ownerId: null,
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
    description:
      'Restaurant gastronomique proposant une cuisine française raffinée. Le cadre est élégant et le service impeccable.',
    descriptionShort: 'Restaurant gastronomique proposant une cuisine française raffinée.',
    keywords: ['restaurant', 'gastronomique', 'français', 'haguenau'],
    hours: {
      monday: { open: false },
      tuesday: { open: true, openTime: '12:00', closeTime: '14:00' },
      wednesday: { open: true, openTime: '12:00', closeTime: '14:00' },
      thursday: { open: true, openTime: '12:00', closeTime: '14:00' },
      friday: { open: true, openTime: '12:00', closeTime: '14:00' },
      saturday: { open: true, openTime: '12:00', closeTime: '14:00' },
      sunday: { open: false },
    },
    photos: [
      'https://example.com/restaurant-1.jpg',
      'https://example.com/restaurant-2.jpg',
    ],
    rating: 4.8,
    reviewCount: 24,
    verified: true,
    ownerId: 1001,
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
    description: 'A new business pending verification.',
    descriptionShort: 'A new business pending verification.',
    keywords: ['services'],
    hours: null,
    photos: [],
    rating: 0,
    reviewCount: 0,
    verified: false,
    ownerId: null,
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
    authorEmail: 'marie@example.com',
    rating: 5,
    comment: 'Excellent service et produits de qualité! Je recommande vivement.',
    photos: [],
    isApproved: true,
    businessReply: null,
    businessReplyAt: null,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
  } as Review,

  negative: {
    id: 202,
    companyId: 101,
    authorName: 'Jean Martin',
    authorEmail: 'jean@example.com',
    rating: 2,
    comment: "Déçu par la qualité, l'accueil n'était pas chaleureux.",
    photos: [],
    isApproved: true,
    businessReply: 'Nous sommes désolés de votre expérience. Nous allons améliorer nos services.',
    businessReplyAt: new Date('2025-10-02'),
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-02'),
  } as Review,

  pending: {
    id: 203,
    companyId: 102,
    authorName: 'Sophie Leblanc',
    authorEmail: 'sophie@example.com',
    rating: 4,
    comment: 'Bon restaurant, mais un peu cher.',
    photos: ['https://example.com/review-photo-1.jpg'],
    isApproved: false,
    businessReply: null,
    businessReplyAt: null,
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15'),
  } as Review,

  withPhotos: {
    id: 204,
    companyId: 102,
    authorName: 'Pierre Dubois',
    authorEmail: 'pierre@example.com',
    rating: 5,
    comment: 'Magnifique! Les photos parlent d\'elles-mêmes.',
    photos: [
      'https://example.com/review-1.jpg',
      'https://example.com/review-2.jpg',
      'https://example.com/review-3.jpg',
    ],
    isApproved: true,
    businessReply: 'Merci beaucoup pour votre avis et ces belles photos!',
    businessReplyAt: new Date('2025-10-14'),
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
    password: '$2a$10$abc123...', // bcrypt hash
    role: 'ADMIN' as const,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as User,

  businessOwner: {
    id: 1001,
    email: 'owner@au-cerf.fr',
    name: 'Restaurant Owner',
    password: '$2a$10$def456...', // bcrypt hash
    role: 'BUSINESS_OWNER' as const,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as User,

  regular: {
    id: 2001,
    email: 'user@example.com',
    name: 'Regular User',
    password: '$2a$10$ghi789...', // bcrypt hash
    role: 'USER' as const,
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
