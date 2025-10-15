import { PrismaClient } from '@prisma/client';
import { createTenantMiddleware } from './prisma-middleware';

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

const basePrisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Initialize tenant middleware for RLS
export const prisma = globalForPrisma.prisma ?? createTenantMiddleware(basePrisma);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

