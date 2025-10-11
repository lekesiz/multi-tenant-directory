import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import CompanyEditForm from '@/components/CompanyEditForm';

export default async function EditCompanyPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const companyId = parseInt(params.id);

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
          reviewTime: 'desc',
        },
        take: 10,
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

