import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserEditForm from '@/components/UserEditForm';

export default async function UserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    redirect('/admin/login');
  }

  const userId = parseInt(resolvedParams.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/admin/users');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserEditForm user={user} currentUserRole={session.user.role} />
      </div>
    </div>
  );
}

