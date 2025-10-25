import { logger } from '@/lib/logger';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getDashboardStats() {
  // Initialize with default values
  const stats = {
    totalCompanies: 0,
    totalDomains: 0,
    activeDomains: 0,
    totalReviews: 0,
    avgRating: 0,
    totalLinks: 0,
    visibleLinks: 0,
    topCategories: [] as Array<{ category: string; count: number }>,
    recentCompanies: [] as Array<{
      id: number;
      name: string;
      slug: string;
      city: string;
      categories: string[];
      createdAt: Date;
    }>,
    domainStats: [] as Array<{
      id: number;
      name: string;
      isActive: boolean;
      companyCount: number;
    }>,
    totalLeads: 0,
    newLeads: 0,
    assignedLeads: 0,
    wonLeads: 0,
  };

  // Block 1: Base stats (always available)
  try {
    // Get total companies
    stats.totalCompanies = await prisma.company.count();

    // Get total domains
    stats.totalDomains = await prisma.domain.count();

    // Get active domains
    stats.activeDomains = await prisma.domain.count({
      where: { isActive: true },
    });

    // Get total reviews
    stats.totalReviews = await prisma.review.count();

    // Get average rating
    const reviews = await prisma.review.findMany({
      select: { rating: true },
    });
    stats.avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Get total company content links
    stats.totalLinks = await prisma.companyContent.count();

    // Get visible company content
    stats.visibleLinks = await prisma.companyContent.count({
      where: { isVisible: true },
    });

    // Get companies by category
    const companies = await prisma.company.findMany({
      select: { categories: true },
    });

    const categoryCount: Record<string, number> = {};
    companies.forEach((company) => {
      company.categories.forEach((category) => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });

    stats.topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));

    // Get recent companies
    stats.recentCompanies = await prisma.company.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        categories: true,
        createdAt: true,
      },
    });

    // Get domain stats
    const domains = await prisma.domain.findMany({
      where: {
        isActive: true,
      },
      include: {
        content: {
          where: {
            isVisible: true,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    stats.domainStats = domains.map(domain => ({
      id: domain.id,
      name: domain.name,
      isActive: domain.isActive,
      companyCount: domain.content.length,
    }));

    logger.info('✅ Base dashboard stats retrieved successfully', {
      totalCompanies: stats.totalCompanies,
      totalDomains: stats.totalDomains,
      totalReviews: stats.totalReviews,
    });
  } catch (error) {
    logger.error('❌ Error retrieving base dashboard stats:', error);
    // Base stats remain at default values (0)
  }

  // Block 2: Leads stats (may fail if tables don't exist yet)
  try {
    stats.totalLeads = await prisma.lead.count();
    stats.newLeads = await prisma.lead.count({
      where: { status: 'new' }
    });
    stats.assignedLeads = await prisma.lead.count({
      where: { status: 'assigned' }
    });
    stats.wonLeads = await prisma.lead.count({
      where: { status: 'won' }
    });

    logger.info('✅ Leads stats retrieved successfully', {
      totalLeads: stats.totalLeads,
      newLeads: stats.newLeads,
    });
  } catch (error) {
    logger.warn('⚠️ Leads stats not available (tables may not exist yet):', error);
    // Leads stats remain at default values (0)
  }

  return stats;
}

export default async function AdminDashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Hoş geldiniz, {session.user?.name || session.user?.email}! Platform
          istatistiklerinizi buradan görüntüleyebilirsiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Entreprises</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalCompanies}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.visibleLinks} görünür bağlantı
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Domain</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeDomains}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalDomains} toplam
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Avis</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalReviews}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalCompanies > 0
                  ? (stats.totalReviews / stats.totalCompanies).toFixed(1)
                  : 0}{' '}
                moyenne/entreprise
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Note Moyenne</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalReviews > 0 ? '⭐ sur 5' : 'Aucun avis'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalLeads}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.newLeads} nouveaux
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Catégories Populaires
            </h2>
          </div>
          <div className="p-6">
            {stats.topCategories.length > 0 ? (
              <div className="space-y-4">
                {stats.topCategories.map((item, index) => (
                  <div key={item.category} className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 font-medium">
                          {item.category}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {item.count} entreprises
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(item.count / stats.totalCompanies) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucune catégorie trouvée
              </p>
            )}
          </div>
        </div>

        {/* Domain Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Statistiques des Domaines</h2>
          </div>
          <div className="p-6">
            {stats.domainStats.length > 0 ? (
              <div className="space-y-3">
                {stats.domainStats.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          domain.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {domain.name.split('.')[0].charAt(0).toUpperCase() + domain.name.split('.')[0].slice(1)}
                        </div>
                        <div className="text-xs text-gray-500">{domain.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {domain.companyCount}
                      </div>
                      <div className="text-xs text-gray-500">entreprises</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucun domaine trouvé
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Dernières Entreprises Ajoutées</h2>
          <Link
            href="/admin/companies"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {stats.recentCompanies.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'ajout
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {company.name}
                      </div>
                      <div className="text-sm text-gray-500">{company.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.city}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {company.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                        {company.categories.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{company.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Aucune entreprise ajoutée
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/companies/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 flex items-center justify-between transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold">Ajouter une Entreprise</h3>
            <p className="text-blue-100 text-sm mt-1">
              Créer rapidement un nouveau profil d'entreprise
            </p>
          </div>
          <svg
            className="w-8 h-8"
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
        </Link>

        <Link
          href="/admin/leads"
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-6 flex items-center justify-between transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold">Gestion des Leads</h3>
            <p className="text-orange-100 text-sm mt-1">
              Voir et gérer les demandes de devis
            </p>
          </div>
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </Link>

        <Link
          href="/admin/domains"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 flex items-center justify-between transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold">Domain Yönetimi</h3>
            <p className="text-green-100 text-sm mt-1">
              Domain ayarlarını düzenle
            </p>
          </div>
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 flex items-center justify-between transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold">Ayarlar</h3>
            <p className="text-purple-100 text-sm mt-1">
              Platform ayarlarını yapılandır
            </p>
          </div>
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

