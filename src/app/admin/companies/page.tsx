import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SyncReviewsButton from './sync-reviews-button';
import CompaniesTable from '@/components/admin/CompaniesTable';

const ITEMS_PER_PAGE = 25;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    city?: string;
    status?: string;
  }>;
}

export default async function AdminCompaniesPage({ searchParams }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const cityFilter = params.city || '';
  const statusFilter = params.status || 'all';

  // Build where clause for filtering
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (cityFilter) {
    whereClause.city = cityFilter;
  }

  if (statusFilter === 'active') {
    whereClause.isActive = true;
  } else if (statusFilter === 'inactive') {
    whereClause.isActive = false;
  }

  // Get total count for pagination
  const totalCount = await prisma.company.count({ where: whereClause });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Fetch paginated companies
  const companies = await prisma.company.findMany({
    where: whereClause,
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
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  // Get all unique cities for the filter dropdown
  const allCities = await prisma.company.findMany({
    select: { city: true },
    distinct: ['city'],
    where: { city: { not: null } },
    orderBy: { city: 'asc' },
  });
  const cities = allCities.map(c => c.city).filter((city): city is string => Boolean(city));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entreprises</h1>
          <p className="text-gray-600 mt-2">
            Visualisez et gérez toutes les entreprises ({totalCount} total)
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

      <CompaniesTable
        companies={companies}
        cities={cities}
        pagination={{
          currentPage,
          totalPages,
          totalCount,
          itemsPerPage: ITEMS_PER_PAGE,
        }}
        filters={{
          search,
          city: cityFilter,
          status: statusFilter,
        }}
      />
    </div>
  );
}
