/**
 * Prisma Client Mock for Testing
 *
 * Uses jest-mock-extended to create a fully typed mock of PrismaClient
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Reset mock before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Export type for test files
export type MockPrismaClient = typeof prismaMock;
