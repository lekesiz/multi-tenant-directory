import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  COMPANY_OWNER = 'COMPANY_OWNER',
  USER = 'USER',
}

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: Role;
  };
  session: any;
}

/**
 * Normalize a role value coming from the database or a JWT.
 *
 * Historically roles have been persisted in several shapes:
 *   - lowercase  : "admin", "super_admin"   (User.role default in Prisma)
 *   - uppercase  : "ADMIN", "SUPER_ADMIN"   (Role enum in this file)
 *   - mixed case : "Admin"
 *
 * Comparing raw strings therefore produced false negatives and locked
 * legitimate administrators out with a 403. Always compare normalized values.
 */
export function normalizeRole(role: unknown): Role {
  if (typeof role !== 'string' || role.trim() === '') {
    return Role.USER;
  }

  const normalized = role.trim().toUpperCase().replace(/[\s-]+/g, '_');

  return (Object.values(Role) as string[]).includes(normalized)
    ? (normalized as Role)
    : Role.USER;
}

/**
 * Get current session
 * Returns null if not authenticated
 */
export async function getCurrentSession(): Promise<AuthContext | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return null;
    }

    return {
      user: {
        id: (session.user as any).id || session.user.email || '',
        email: session.user.email || '',
        name: session.user.name,
        role: normalizeRole((session.user as any).role),
      },
      session,
    };
  } catch (error) {
    logger.error('Error getting session:', error);
    return null;
  }
}

/**
 * Require authentication
 * Returns error response if not authenticated
 */
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const auth = await getCurrentSession();
  
  if (!auth) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Authentication required',
      },
      { status: 401 }
    );
  }
  
  return auth;
}

/**
 * Require specific role
 * Returns error response if user doesn't have required role
 */
export async function requireRole(
  allowedRoles: Role[]
): Promise<AuthContext | NextResponse> {
  const authOrError = await requireAuth();
  
  if (authOrError instanceof NextResponse) {
    return authOrError;
  }
  
  const userRole = normalizeRole(authOrError.user.role);

  if (!allowedRoles.map((role) => normalizeRole(role)).includes(userRole)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Insufficient permissions',
      },
      { status: 403 }
    );
  }
  
  return authOrError;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<AuthContext | NextResponse> {
  return requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin(): Promise<AuthContext | NextResponse> {
  return requireRole([Role.SUPER_ADMIN]);
}

/**
 * Check if user has role
 */
export function hasRole(auth: AuthContext, role: Role): boolean {
  return normalizeRole(auth.user.role) === normalizeRole(role);
}

/**
 * Check if user is admin
 */
export function isAdmin(auth: AuthContext): boolean {
  const role = normalizeRole(auth.user.role);
  return role === Role.SUPER_ADMIN || role === Role.ADMIN;
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T extends any[]>(
  handler: (auth: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const authOrError = await requireAuth();
    
    if (authOrError instanceof NextResponse) {
      return authOrError;
    }
    
    return handler(authOrError, ...args);
  };
}

/**
 * Wrapper for API routes that require admin role
 */
export function withAdmin<T extends any[]>(
  handler: (auth: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const authOrError = await requireAdmin();
    
    if (authOrError instanceof NextResponse) {
      return authOrError;
    }
    
    return handler(authOrError, ...args);
  };
}

