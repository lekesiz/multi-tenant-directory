import { PrismaClient } from '@prisma/client';

// Tenant context middleware for Row-Level Security
export function createTenantMiddleware(prisma: PrismaClient) {
  prisma.$use(async (params, next) => {
    // Set tenant context for RLS policies
    const tenantDomain = global.tenantContext?.domain;
    const userRole = global.tenantContext?.userRole;

    if (tenantDomain) {
      // Set PostgreSQL session variables for RLS policies
      await prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantDomain}, true)`;
    }

    if (userRole) {
      await prisma.$executeRaw`SELECT set_config('app.user_role', ${userRole}, true)`;
    }

    return next(params);
  });
}

// Global tenant context type
declare global {
  var tenantContext: {
    domain?: string;
    userRole?: string;
  } | undefined;
}

// Helper function to set tenant context
export function setTenantContext(domain: string, userRole: string = 'user') {
  global.tenantContext = { domain, userRole };
}

// Helper function to clear tenant context
export function clearTenantContext() {
  global.tenantContext = undefined;
}