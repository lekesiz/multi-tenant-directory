import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { createPrismaMiddleware } from './prisma-middleware';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Environment validation happens automatically when env is imported
// This ensures DATABASE_URL and other required vars are present

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

// Add middleware for query optimization
prisma.$use(createPrismaMiddleware());

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

