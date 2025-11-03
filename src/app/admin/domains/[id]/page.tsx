import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import DomainCompaniesManager from '@/components/DomainCompaniesManager';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DomainDetailPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const domainId = parseInt(id, 10);

  if (isNaN(domainId)) {
    redirect('/admin/domains');
  }

  // Fetch domain with companies
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    include: {
      content: {
        include: {
          company: {
            include: {
              categories: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          content: true,
        },
      },
    },
  });

  if (!domain) {
    redirect('/admin/domains');
  }

  // Fetch all companies for assignment
  const allCompanies = await prisma.company.findMany({
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      content: {
        where: {
          domainId: domainId,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/admin/domains"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour aux domaines
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{domain.name}</h1>
            <p className="text-gray-600 mt-2">
              {domain.siteDescription || `Annuaire des professionnels à ${domain.name.split('.')[0]}`}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {domain._count.content} entreprises
            </span>
          </div>
        </div>
      </div>

      <DomainCompaniesManager domain={domain} companies={allCompanies} />
    </div>
  );
}
