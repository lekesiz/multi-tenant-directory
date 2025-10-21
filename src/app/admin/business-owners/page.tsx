import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const metadata = {
  title: 'Propriétaires d\'Entreprises | Admin',
};

async function getBusinessOwners() {
  return await prisma.businessOwner.findMany({
    include: {
      companies: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function BusinessOwnersPage() {
  const businessOwners = await getBusinessOwners();

  const stats = {
    total: businessOwners.length,
    active: businessOwners.filter(bo => 
      bo.companies.some(o => o.company.isActive)
    ).length,
    inactive: businessOwners.filter(bo => 
      !bo.companies.some(o => o.company.isActive)
    ).length,
    withCompanies: businessOwners.filter(bo => bo.companies.length > 0).length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Propriétaires d'Entreprises
        </h1>
        <p className="text-gray-600">
          Gérez tous les comptes professionnels de la plateforme
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600 mb-1">Actifs</div>
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Inactifs</div>
          <div className="text-3xl font-bold text-gray-600">{stats.inactive}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="text-sm text-blue-600 mb-1">Avec Entreprises</div>
          <div className="text-3xl font-bold text-blue-600">{stats.withCompanies}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprises
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {businessOwners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Aucun propriétaire d'entreprise pour le moment
                </td>
              </tr>
            ) : (
              businessOwners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {owner.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {owner.firstName} {owner.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`mailto:${owner.email}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {owner.email}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    {owner.companies.length === 0 ? (
                      <span className="text-sm text-gray-400">Aucune</span>
                    ) : (
                      <div className="space-y-1">
                        {owner.companies.map((ownership) => (
                          <div key={ownership.id}>
                            <Link
                              href={`/admin/companies/${ownership.company.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {ownership.company.name}
                            </Link>
                            {!ownership.company.isActive && (
                              <span className="ml-2 text-xs text-red-600">(inactif)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(owner.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/business-owners/${owner.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

