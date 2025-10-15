import { PrismaClient } from '@prisma/client';
import { createTenantMiddleware } from './prisma-middleware';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// Initialize tenant middleware for RLS
createTenantMiddleware(prisma);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

