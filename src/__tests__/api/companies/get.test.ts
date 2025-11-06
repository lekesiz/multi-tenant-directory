/**
 * @jest-environment node
 */

import { GET } from '@/app/api/companies/[id]/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    company: {
      findUnique: jest.fn(),
    },
  },
}));

describe('/api/companies/[id] - GET', () => {
  const mockCompany = {
    id: 1,
    name: 'Test Company',
    slug: 'test-company',
    address: '123 Test St',
    city: 'Test City',
    postalCode: '12345',
    phone: '+1234567890',
    email: 'test@test.com',
    website: 'https://test.com',
    latitude: 48.5734,
    longitude: 7.7521,
    isActive: true,
    googlePlaceId: 'test-place-id',
    rating: 4.5,
    reviewCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return company data when found', async () => {
    (prisma.company.findUnique as jest.Mock).mockResolvedValue(mockCompany);

    const request = new NextRequest('http://localhost:3000/api/companies/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(1);
    expect(data.name).toBe('Test Company');
  });

  it('should return 404 when company not found', async () => {
    (prisma.company.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/companies/999');
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it('should return 400 for invalid company ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/companies/invalid');
    const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/invalid/i);
  });
});
