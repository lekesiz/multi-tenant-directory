import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { setTenantContext } from './prisma-middleware';

export async function setupTenantContext(domain: string) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role === 'admin' ? 'admin' : 'user';
    
    setTenantContext(domain, userRole);
    
    return { session, userRole };
  } catch (error) {
    // If auth fails, set as regular user
    setTenantContext(domain, 'user');
    return { session: null, userRole: 'user' };
  }
}

export function isAdmin(session: any): boolean {
  return (session?.user as any)?.role === 'admin';
}

export function requireAdmin(session: any) {
  if (!isAdmin(session)) {
    throw new Error('Admin access required');
  }
}