import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SyncReviewsButton from './sync-reviews-button';

export default async function AdminCompaniesPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const companies = await prisma.company.findMany({
    include: {
      content: {
        include: {
          domain: true,
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain'ler
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Google
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {company.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {company.city}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {company.content.length} domain
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {company._count.reviews} avis
                  </div>
                </td>
                <td className="px-6 py-4">
                  {company.googlePlaceId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ Lié
                      </span>
                      <SyncReviewsButton companyId={company.id} />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      Non lié
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/admin/companies/${company.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
