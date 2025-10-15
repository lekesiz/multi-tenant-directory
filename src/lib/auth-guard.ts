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
        role: (session.user as any).role || Role.USER,
      },
      session,
    };
  } catch (error) {
    console.error('Error getting session:', error);
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
  
  const userRole = authOrError.user.role || Role.USER;
  
  if (!allowedRoles.includes(userRole)) {
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
  return auth.user.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(auth: AuthContext): boolean {
  return (
    auth.user.role === Role.SUPER_ADMIN ||
    auth.user.role === Role.ADMIN
  );
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

