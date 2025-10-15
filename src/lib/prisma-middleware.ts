import { PrismaClient } from '@prisma/client';

// Tenant context middleware for Row-Level Security
export function createTenantMiddleware(prisma: PrismaClient) {
  // Prisma v6+ uses extensions instead of middleware
  return prisma.$extends({
    query: {
      $allOperations: async ({ args, query }) => {
        // Set tenant context for RLS policies before each query
        const tenantDomain = global.tenantContext?.domain;
        const userRole = global.tenantContext?.userRole;

        if (tenantDomain) {
          // Set PostgreSQL session variables for RLS policies
          await prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantDomain}, true)`;
        }

        if (userRole) {
          await prisma.$executeRaw`SELECT set_config('app.user_role', ${userRole}, true)`;
        }

        return query(args);
      },
    },
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