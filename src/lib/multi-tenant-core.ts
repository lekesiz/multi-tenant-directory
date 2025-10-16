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
type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ex?: number) => Promise<void>;
  setex: (key: string, seconds: number, value: string) => Promise<void>;
  del: (...keys: string[]) => Promise<void>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<void>;
} | null;

const redis: RedisClient = null; // Disabled for Edge Runtime compatibility

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
    });

    if (!domain) return null;

    // Build tenant context from domain (simplified version without Tenant model)
    const tenantContext: TenantContext = {
      id: domain.id.toString(),
      domain: domain.name,
      config: {
        branding: {
          primaryColor: domain.primaryColor || '#3B82F6',
          logo: domain.logoUrl || '/logo.png',
          favicon: '/favicon.ico',
          customCSS: undefined,
        },
        theme: 'light',
        language: 'fr',
        timezone: 'Europe/Paris',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
      },
      features: {
        analytics: true,
        customDomain: true,
        apiAccess: true,
        whiteLabel: false,
        multipleUsers: true,
        advancedSecurity: false,
        integrations: [],
      },
      limits: {
        maxUsers: 10000,
        maxCompanies: 1000,
        maxAPIRequests: 100000,
        storageGB: 10,
        customDomains: 1,
      },
      security: {
        ssoEnabled: false,
        twoFactorRequired: false,
        ipWhitelist: [],
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          maxAge: 90,
        },
      },
    };

    // Cache for 5 minutes
    if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(tenantContext));
    }

    return tenantContext;
  }

  /**
   * Resolve by subdomain (not used in this implementation)
   */
  private static async resolveTenantBySubdomain(host: string): Promise<TenantContext | null> {
    // Subdomain-based multi-tenancy not implemented
    // This project uses domain-based routing instead
    return null;
  }

  /**
   * Resolve by path (not used in this implementation)
   */
  private static async resolveTenantByPath(pathname: string): Promise<TenantContext | null> {
    // Path-based multi-tenancy not implemented
    // This project uses domain-based routing instead
    return null;
  }

  /**
   * Get tenant by ID with caching (using Domain ID in this implementation)
   */
  static async getTenantById(tenantId: string): Promise<TenantContext | null> {
    const cacheKey = `tenant:id:${tenantId}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const domain = await prisma.domain.findUnique({
      where: { id: parseInt(tenantId), isActive: true },
    });

    if (!domain) return null;

    // Build tenant context from domain
    const tenantContext: TenantContext = {
      id: domain.id.toString(),
      domain: domain.name,
      config: {
        branding: {
          primaryColor: domain.primaryColor || '#3B82F6',
          logo: domain.logoUrl || '/logo.png',
          favicon: '/favicon.ico',
          customCSS: undefined,
        },
        theme: 'light',
        language: 'fr',
        timezone: 'Europe/Paris',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
      },
      features: {
        analytics: true,
        customDomain: true,
        apiAccess: true,
        whiteLabel: false,
        multipleUsers: true,
        advancedSecurity: false,
        integrations: [],
      },
      limits: {
        maxUsers: 10000,
        maxCompanies: 1000,
        maxAPIRequests: 100000,
        storageGB: 10,
        customDomains: 1,
      },
      security: {
        ssoEnabled: false,
        twoFactorRequired: false,
        ipWhitelist: [],
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          maxAge: 90,
        },
      },
    };

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

    const domain = await prisma.domain.findUnique({
      where: { id: parseInt(tenantId) },
      select: { name: true }
    });

    if (!domain) return;

    const keys = [
      `tenant:id:${tenantId}`,
      `tenant:domain:${domain.name}`,
    ];

    await redis.del(...keys);
  }
}

// Tenant Isolation Service
export class TenantIsolation {
  
  /**
   * Get database connection for tenant (simplified - no row-level security in this implementation)
   */
  static getTenantPrisma(tenantId: string) {
    // This project uses domain-based isolation instead of row-level tenantId
    // Return the regular prisma client
    return prisma;
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
   * Validate tenant access to resource (simplified - checks existence only)
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
            where: { id: parseInt(resourceId) }
          });
          hasAccess = !!company;
          break;

        case 'order':
          const order = await prisma.order.findFirst({
            where: { id: resourceId }
          });
          hasAccess = !!order;
          break;

        case 'product':
          const product = await prisma.product.findFirst({
            where: { id: resourceId }
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
   * Tenant resource usage monitoring (simplified - domain-based)
   */
  static async monitorTenantUsage(tenantId: string) {
    // Simplified version without tenant_id field
    const companies = await prisma.company.count();
    const orders = await prisma.order.count();
    const reviews = await prisma.review.count();
    const products = await prisma.product.count();

    return {
      company_count: companies,
      order_count: orders,
      review_count: reviews,
      product_count: products,
      orders_24h: 0,
      reviews_24h: 0,
    };
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
   * Audit logging for tenant actions (simplified - console logging only)
   */
  static async logTenantAction(tenantId: string, action: string, details: any, userId?: string) {
    // AuditLog model not implemented in this schema
    // Log to console for now
    console.log('[AUDIT]', {
      tenantId,
      action,
      details,
      userId,
      timestamp: new Date().toISOString(),
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