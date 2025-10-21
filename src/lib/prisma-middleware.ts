/**
 * Prisma query optimization and logging utilities
 * Note: Prisma middleware API deprecated in v5+, use extensions instead
 */

// Slow query logging (can be added via Prisma extension if needed)
export function logSlowQuery(model: string, action: string, duration: number) {
  if (process.env.NODE_ENV === 'development' && duration > 1000) {
    logger.warn(
      `⚠️ Slow query detected (${duration}ms): ${model}.${action}`
    );
  }
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

