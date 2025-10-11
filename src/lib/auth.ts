import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect('/admin/login');
  }
  
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  
  if ((session.user as any)?.role !== 'admin') {
    redirect('/');
  }
  
  return session;
}

