import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authBusinessOptions } from '@/lib/auth-business';
import { prisma } from '@/lib/prisma';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const session = await getServerSession(authBusinessOptions);

  if (!session || session.user.role !== 'business_owner') {
    redirect('/business/login');
  }

  // Get business owner's first company for analytics
  const ownership = await prisma.companyOwnership.findFirst({
    where: {
      ownerId: session.user.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!ownership) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12M8 5l2-2 2 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
          <p className="text-gray-500 mb-4">
            Vous devez d'abord ajouter une entreprise pour voir les analytics.
          </p>
          <a
            href="/business/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retour au dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Analysez les performances de votre entreprise : {ownership.company.name}
        </p>
      </div>

      <AnalyticsDashboard companyId={ownership.company.id} />
    </div>
  );
}