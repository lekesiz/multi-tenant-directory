import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export interface TenantContext {
  domain: {
    id: number;
    name: string;
    isActive: boolean;
    siteTitle: string | null;
    siteDescription: string | null;
    settings: any;
  };
}

/**
 * Resolves the tenant (domain) from the request
 * Throws error if domain is not found or inactive
 */
export async function resolveTenant(request: NextRequest): Promise<TenantContext> {
  try {
    // Get host from request headers
    const host = request.headers.get('host');
    
    if (!host) {
      throw new Error('Host header is missing');
    }

    // Remove port if present (localhost:3000 -> localhost)
    const domainName = host.split(':')[0];

    // Find domain in database
    const domain = await prisma.domain.findUnique({
      where: { name: domainName },
      select: {
        id: true,
        name: true,
        isActive: true,
        siteTitle: true,
        siteDescription: true,
        settings: true,
      },
    });

    if (!domain) {
      // If domain not found, try to find any active domain as fallback
      logger.warn(`Domain not found: ${domainName}, trying fallback`);
      const fallbackDomain = await prisma.domain.findFirst({
        where: { 
          isActive: true 
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          siteTitle: true,
          siteDescription: true,
          settings: true,
        },
      });
      
      if (fallbackDomain) {
        logger.info(`Using fallback domain: ${fallbackDomain.name}`);
        return { domain: fallbackDomain };
      }
      
      throw new Error(`Domain not found: ${domainName}`);
    }

    if (!domain.isActive) {
      throw new Error(`Domain is inactive: ${domainName}`);
    }

    return { domain };
  } catch (error) {
    logger.error('Error resolving tenant:', error);
    throw error;
  }
}

/**
 * Middleware helper to require tenant resolution
 * Returns error response if tenant cannot be resolved
 */
export async function requireTenant(
  request: NextRequest
): Promise<TenantContext | NextResponse> {
  try {
    const tenant = await resolveTenant(request);
    return tenant;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Invalid or inactive domain',
        message: error.message,
      },
      { status: 400 }
    );
  }
}

/**
 * Wrapper for API routes that require tenant context
 * Automatically resolves tenant and passes it to the handler
 */
export function withTenant<T extends any[]>(
  handler: (tenant: TenantContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const tenantOrError = await requireTenant(request);
    
    if (tenantOrError instanceof NextResponse) {
      return tenantOrError;
    }
    
    return handler(tenantOrError, ...args);
  };
}

/**
 * Get domain ID for Prisma queries
 * Use this in all queries that need tenant filtering
 */
export function getDomainId(tenant: TenantContext): number {
  return tenant.domain.id;
}

