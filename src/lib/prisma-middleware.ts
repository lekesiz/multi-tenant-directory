import { Prisma } from '@prisma/client';

/**
 * Prisma middleware for query optimization and logging
 */

export function createPrismaMiddleware() {
  return async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    const before = Date.now();

    // Add default select fields to avoid fetching unnecessary data
    if (params.action === 'findMany' || params.action === 'findFirst') {
      // Log slow queries in development
      if (process.env.NODE_ENV === 'development') {
        const result = await next(params);
        const after = Date.now();
        const duration = after - before;

        if (duration > 1000) {
          console.warn(
            `⚠️ Slow query detected (${duration}ms): ${params.model}.${params.action}`
          );
        }

        return result;
      }
    }

    return next(params);
  };
}

/**
 * Batch query helper to avoid N+1 queries
 */
export async function batchQuery<T, K extends keyof T>(
  items: T[],
  key: K,
  fetchFn: (ids: T[K][]) => Promise<Map<T[K], any>>
): Promise<Map<T[K], any>> {
  const ids = items.map((item) => item[key]);
  return fetchFn(ids);
}

/**
 * Pagination helper with cursor-based pagination for better performance
 */
export interface CursorPaginationOptions {
  cursor?: string;
  take?: number;
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export function createCursorPagination<T extends { id: string }>(
  items: T[],
  take: number
): CursorPaginationResult<T> {
  const hasMore = items.length > take;
  const paginatedItems = hasMore ? items.slice(0, take) : items;
  const nextCursor = hasMore ? paginatedItems[paginatedItems.length - 1].id : undefined;

  return {
    items: paginatedItems,
    nextCursor,
    hasMore,
  };
}

