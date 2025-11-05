import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SyncReviewsButton from './sync-reviews-button';
import CompaniesTable from '@/components/admin/CompaniesTable';

export default async function AdminCompaniesPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      isActive: true,
      googlePlaceId: true,
      createdAt: true,
      content: {
        select: {
          domainId: true,
          domain: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entreprises</h1>
          <p className="text-gray-600 mt-2">
            Visualisez et gérez toutes les entreprises
          </p>
        </div>
        <div className="flex gap-3">
          <SyncReviewsButton />
          <Link
            href="/admin/companies/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouvelle entreprise
          </Link>
        </div>
      </div>

      <CompaniesTable companies={companies} />
    </div>
  );
}
