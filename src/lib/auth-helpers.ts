import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function requireAuth(requiredRole?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error('Unauthorized - No session');
  }
  
  if (requiredRole && session.user.role !== requiredRole) {
    throw new Error(`Unauthorized - Required role: ${requiredRole}`);
  }
  
  return session;
}

export async function requireAdminAuth() {
  return requireAuth('admin');
}

// API Route wrapper for authentication
export function withAuth(handler: Function, requiredRole?: string) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      await requireAuth(requiredRole);
      return handler(request, ...args);
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Unauthorized' },
        { status: 401 }
      );
    }
  };
}

export function withAdminAuth(handler: Function) {
  return withAuth(handler, 'admin');
}