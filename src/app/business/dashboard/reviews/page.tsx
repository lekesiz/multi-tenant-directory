import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authBusinessOptions } from '@/lib/auth-business';
import { prisma } from '@/lib/prisma';
import ReviewManagementClient from './ReviewManagementClient';

export default async function ReviewManagementPage() {
  const session = await getServerSession(authBusinessOptions);

  if (!session || session.user.role !== 'business_owner') {
    redirect('/business/login');
  }

  // Get business owner's companies
  const ownerships = await prisma.companyOwnership.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const companyIds = ownerships.map((o) => o.company.id);

  // Get all reviews for owned companies
  const reviews = await prisma.review.findMany({
    where: {
      companyId: {
        in: companyIds,
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      reply: true,
      votes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate stats
  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => !r.reply).length,
    replied: reviews.filter((r) => r.reply).length,
    verified: reviews.filter((r) => r.isVerified).length,
    avgRating: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0,
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des Avis
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez et répondez aux avis de vos clients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Avis</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">En Attente</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {stats.pending}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Répondus</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {stats.replied}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Vérifiés</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {stats.verified}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Note Moyenne</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {stats.avgRating.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <ReviewManagementClient
        reviews={JSON.parse(JSON.stringify(reviews))}
        companies={ownerships.map((o) => o.company)}
      />
    </div>
  );
}

