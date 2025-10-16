import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import CompanyEditForm from '@/components/CompanyEditForm';

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const companyId = parseInt(id);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      content: {
        include: {
          domain: true,
        },
      },
      reviews: {
        orderBy: {
          reviewDate: 'desc',
        },
        take: 10,
      },
      photos: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!company) {
    redirect('/admin/companies');
  }

  const domains = await prisma.domain.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div>
      <CompanyEditForm company={company} domains={domains} />
    </div>
  );
}

