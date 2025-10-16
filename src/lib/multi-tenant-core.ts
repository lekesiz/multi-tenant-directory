/**
 * Multi-Tenant Core Architecture
 * Advanced tenant isolation, performance optimization, and security
 */

import { prisma } from './prisma';
import { NextRequest } from 'next/server';
import { cache } from 'react';
// Redis client for caching (if available)
// Note: ioredis is not compatible with Edge Runtime
// Use Upstash Redis or Vercel KV for Edge-compatible caching
const redis = null; // Disabled for Edge Runtime compatibility

// Tenant Context Types
export interface TenantContext {
  id: string;
  domain: string;
  subdomain?: string;
  config: TenantConfig;
  features: TenantFeatures;
  limits: TenantLimits;
  security: TenantSecurity;
}

export interface TenantConfig {
  branding: {
    primaryColor: string;
    logo: string;
    favicon: string;
    customCSS?: string;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
}

export interface TenantFeatures {
  analytics: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  multipleUsers: boolean;
  advancedSecurity: boolean;
  integrations: string[];
}

export interface TenantLimits {
  maxUsers: number;
  maxCompanies: number;
  maxAPIRequests: number;
  storageGB: number;
  customDomains: number;
}

export interface TenantSecurity {
  ssoEnabled: boolean;
  twoFactorRequired: boolean;
  ipWhitelist: string[];
  sessionTimeout: number; // minutes
  passwordPolicy: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    maxAge: number; // days
  };
}

// Tenant Resolution Service
export class TenantResolver {
  
  /**
   * Resolve tenant from request
   */
  static async resolveTenant(request: NextRequest): Promise<TenantContext | null> {
    const host = request.headers.get('host') || '';
    const url = new URL(request.url);
    
    // Try different resolution strategies
    const tenant = await this.resolveTenantByDomain(host) ||
                   await this.resolveTenantBySubdomain(host) ||
                   await this.resolveTenantByPath(url.pathname);
    
    return tenant;
  }

  /**
   * Resolve by custom domain
   */
  private static async resolveTenantByDomain(host: string): Promise<TenantContext | null> {
    const cacheKey = `tenant:domain:${host}`;
    
    // Try cache first
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }
    
    const domain = await prisma.domain.findUnique({
      where: { name: host, isActive: true },
      include: {
        tenant: {
          include: {
            config: true,
            features: true,
            limits: true,
            security: true,
          }
        }
      }
    });

    if (!domain?.tenant) return null;

    const tenantContext = this.buildTenantContext(domain.tenant);
    
    // Cache for 5 minutes
    if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(tenantContext));
    }
    
    return tenantContext;
  }

  /**
   * Resolve by subdomain
   */
  private static async resolveTenantBySubdomain(host: string): Promise<TenantContext | null> {
    const subdomain = host.split('.')[0];
    if (!subdomain || subdomain === 'www') return null;

    const cacheKey = `tenant:subdomain:${subdomain}`;
    
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { subdomain, isActive: true },
      include: {
        config: true,
        features: true,
        limits: true,
        security: true,
      }
    });

    if (!tenant) return null;

    const tenantContext = this.buildTenantContext(tenant);
    
    if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(tenantContext));
    }
    
    return tenantContext;
  }

  /**
   * Resolve by path (fallback)
   */
  private static async resolveTenantByPath(pathname: string): Promise<TenantContext | null> {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments[0] !== 'tenant' || !pathSegments[1]) return null;

    const tenantId = pathSegments[1];
    return this.getTenantById(tenantId);
  }

  /**
   * Get tenant by ID with caching
   */
  static async getTenantById(tenantId: string): Promise<TenantContext | null> {
    const cacheKey = `tenant:id:${tenantId}`;
    
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId, isActive: true },
      include: {
        config: true,
        features: true,
        limits: true,
        security: true,
      }
    });

    if (!tenant) return null;

    const tenantContext = this.buildTenantContext(tenant);
    
    if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(tenantContext));
    }
    
    return tenantContext;
  }

  /**
   * Build tenant context from database record
   */
  private static buildTenantContext(tenant: any): TenantContext {
    return {
      id: tenant.id,
      domain: tenant.domain,
      subdomain: tenant.subdomain,
      config: {
        branding: {
          primaryColor: tenant.config?.primaryColor || '#3B82F6',
          logo: tenant.config?.logo || '/default-logo.png',
          favicon: tenant.config?.favicon || '/default-favicon.ico',
          customCSS: tenant.config?.customCSS,
        },
        theme: tenant.config?.theme || 'light',
        language: tenant.config?.language || 'fr',
        timezone: tenant.config?.timezone || 'Europe/Paris',
        currency: tenant.config?.currency || 'EUR',
        dateFormat: tenant.config?.dateFormat || 'DD/MM/YYYY',
      },
      features: {
        analytics: tenant.features?.analytics ?? true,
        customDomain: tenant.features?.customDomain ?? false,
        apiAccess: tenant.features?.apiAccess ?? true,
        whiteLabel: tenant.features?.whiteLabel ?? false,
        multipleUsers: tenant.features?.multipleUsers ?? true,
        advancedSecurity: tenant.features?.advancedSecurity ?? false,
        integrations: tenant.features?.integrations || [],
      },
      limits: {
        maxUsers: tenant.limits?.maxUsers || 10,
        maxCompanies: tenant.limits?.maxCompanies || 100,
        maxAPIRequests: tenant.limits?.maxAPIRequests || 10000,
        storageGB: tenant.limits?.storageGB || 5,
        customDomains: tenant.limits?.customDomains || 0,
      },
      security: {
        ssoEnabled: tenant.security?.ssoEnabled ?? false,
        twoFactorRequired: tenant.security?.twoFactorRequired ?? false,
        ipWhitelist: tenant.security?.ipWhitelist || [],
        sessionTimeout: tenant.security?.sessionTimeout || 480, // 8 hours
        passwordPolicy: {
          minLength: tenant.security?.passwordPolicy?.minLength || 8,
          requireSpecialChars: tenant.security?.passwordPolicy?.requireSpecialChars ?? true,
          requireNumbers: tenant.security?.passwordPolicy?.requireNumbers ?? true,
          maxAge: tenant.security?.passwordPolicy?.maxAge || 90,
        },
      },
    };
  }

  /**
   * Invalidate tenant cache
   */
  static async invalidateTenantCache(tenantId: string) {
    if (!redis) return;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { subdomain: true, domain: true }
    });

    if (!tenant) return;

    const keys = [
      `tenant:id:${tenantId}`,
      ...(tenant.subdomain ? [`tenant:subdomain:${tenant.subdomain}`] : []),
      ...(tenant.domain ? [`tenant:domain:${tenant.domain}`] : []),
    ];

    await redis.del(...keys);
  }
}

// Tenant Isolation Service
export class TenantIsolation {
  
  /**
   * Get database connection for tenant (with row-level security)
   */
  static getTenantPrisma(tenantId: string) {
    // Create a new Prisma client with tenant context
    return prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // Automatically filter by tenant where applicable
            if (this.hasTenantField(model)) {
              if (operation === 'findMany' || operation === 'findFirst') {
                args.where = { ...args.where, tenantId };
              } else if (operation === 'create') {
                args.data = { ...args.data, tenantId };
              } else if (operation === 'update' || operation === 'delete') {
                args.where = { ...args.where, tenantId };
              }
            }
            return query(args);
          },
        },
      },
    });
  }

  /**
   * Check if model has tenant field
   */
  private static hasTenantField(model: string): boolean {
    const tenantModels = [
      'Company', 'CompanyContent', 'Review', 'Photo', 
      'BusinessHours', 'CompanyAnalytics', 'Notification',
      'ApiKey', 'Webhook', 'Integration', 'Product', 'Order', 'Booking'
    ];
    return tenantModels.includes(model);
  }

  /**
   * Validate tenant access to resource
   */
  static async validateTenantAccess(tenantId: string, resourceType: string, resourceId: string): Promise<boolean> {
    try {
      const cacheKey = `access:${tenantId}:${resourceType}:${resourceId}`;
      
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached !== null) return cached === 'true';
      }

      let hasAccess = false;

      switch (resourceType) {
        case 'company':
          const company = await prisma.company.findFirst({
            where: { id: parseInt(resourceId), tenantId }
          });
          hasAccess = !!company;
          break;
        
        case 'order':
          const order = await prisma.order.findFirst({
            where: { id: resourceId, company: { tenantId } }
          });
          hasAccess = !!order;
          break;

        case 'product':
          const product = await prisma.product.findFirst({
            where: { id: resourceId, company: { tenantId } }
          });
          hasAccess = !!product;
          break;

        default:
          hasAccess = false;
      }

      // Cache result for 1 minute
      if (redis) {
        await redis.setex(cacheKey, 60, hasAccess.toString());
      }

      return hasAccess;
    } catch (error) {
      console.error('Tenant access validation error:', error);
      return false;
    }
  }
}

// Performance Optimization Service
export class TenantPerformance {
  
  /**
   * Cached tenant data fetcher
   */
  static getTenantData = cache(async (tenantId: string) => {
    return await TenantResolver.getTenantById(tenantId);
  });

  /**
   * Bulk tenant data prefetch
   */
  static async prefetchTenantData(tenantIds: string[]) {
    const promises = tenantIds.map(id => this.getTenantData(id));
    return await Promise.all(promises);
  }

  /**
   * Tenant-specific database optimization
   */
  static async optimizeTenantQueries(tenantId: string) {
    // Create tenant-specific database indexes
    const queries = [
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_tenant_${tenantId.replace('-', '_')} ON companies(tenant_id, created_at DESC) WHERE tenant_id = '${tenantId}'`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_tenant_${tenantId.replace('-', '_')} ON orders(company_id, created_at DESC) WHERE company_id IN (SELECT id FROM companies WHERE tenant_id = '${tenantId}')`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_tenant_${tenantId.replace('-', '_')} ON reviews(company_id, created_at DESC) WHERE company_id IN (SELECT id FROM companies WHERE tenant_id = '${tenantId}')`
    ];

    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (error) {
        // Index might already exist, continue
        console.warn(`Index creation warning for tenant ${tenantId}:`, error);
      }
    }
  }

  /**
   * Tenant resource usage monitoring
   */
  static async monitorTenantUsage(tenantId: string) {
    const usage = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT c.id) as company_count,
        COUNT(DISTINCT o.id) as order_count,
        COUNT(DISTINCT r.id) as review_count,
        COUNT(DISTINCT p.id) as product_count,
        SUM(CASE WHEN o.created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as orders_24h,
        SUM(CASE WHEN r.created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as reviews_24h
      FROM companies c
      LEFT JOIN orders o ON o.company_id = c.id
      LEFT JOIN reviews r ON r.company_id = c.id
      LEFT JOIN products p ON p.company_id = c.id
      WHERE c.tenant_id = ${tenantId}
    `;

    return usage[0];
  }
}

// Tenant Security Service
export class TenantSecurity {
  
  /**
   * Validate IP whitelist
   */
  static async validateIPAccess(tenantId: string, clientIP: string): Promise<boolean> {
    const tenant = await TenantResolver.getTenantById(tenantId);
    if (!tenant?.security.ipWhitelist.length) return true;

    return tenant.security.ipWhitelist.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR notation support
        return this.isIPInCIDR(clientIP, allowedIP);
      }
      return clientIP === allowedIP;
    });
  }

  /**
   * Check if IP is in CIDR range
   */
  private static isIPInCIDR(ip: string, cidr: string): boolean {
    // Simplified CIDR check - in production use a proper IP library
    const [network, bits] = cidr.split('/');
    const mask = -1 << (32 - parseInt(bits));
    const networkInt = this.ipToInt(network);
    const ipInt = this.ipToInt(ip);
    return (ipInt & mask) === (networkInt & mask);
  }

  private static ipToInt(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * Rate limiting per tenant
   */
  static async checkTenantRateLimit(tenantId: string, action: string, limit: number = 100): Promise<boolean> {
    if (!redis) return true; // No rate limiting without Redis

    const key = `rate_limit:tenant:${tenantId}:${action}`;
    const window = 3600; // 1 hour
    
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    return current <= limit;
  }

  /**
   * Audit logging for tenant actions
   */
  static async logTenantAction(tenantId: string, action: string, details: any, userId?: string) {
    await prisma.auditLog.create({
      data: {
        tenantId,
        action,
        details: JSON.stringify(details),
        userId,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
        timestamp: new Date(),
      }
    });
  }
}

// Context Provider Hook
export function useTenantContext() {
  // This would be implemented in a React context provider
  // For now, return a placeholder
  return {
    tenant: null as TenantContext | null,
    isLoading: false,
    error: null,
  };
}

// Services are already exported with class declarations above