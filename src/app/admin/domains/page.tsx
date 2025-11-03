import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import DomainManagement from '@/components/DomainManagement';

export default async function AdminDomainsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const domains = await prisma.domain.findMany({
    include: {
      _count: {
        select: {
          content: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Domain Yönetimi</h1>
        <p className="text-gray-600 mt-2">
          {domains.length} domain&apos;in ayarlarını yönetin
        </p>
      </div>

      <DomainManagement domains={domains} />
    </div>
  );
}

