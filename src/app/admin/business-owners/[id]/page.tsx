import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeleteBusinessOwnerButton from './delete-button';

export const metadata = {
  title: 'Détail Propriétaire | Admin',
};

async function getBusinessOwner(id: string) {
  return await prisma.businessOwner.findUnique({
    where: { id },
    include: {
      ownerships: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
              email: true,
              phone: true,
              address: true,
              city: true,
              postalCode: true,
              rating: true,
              reviewCount: true,
            },
          },
        },
      },
    },
  });
}

export default async function BusinessOwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getBusinessOwner(id);

  if (!owner) {
    notFound();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/business-owners"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Retour aux propriétaires
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {owner.firstName} {owner.lastName}
            </h1>
            <p className="text-gray-600">
              Membre depuis {format(new Date(owner.createdAt), 'PPP', { locale: fr })}
            </p>
          </div>
          <DeleteBusinessOwnerButton ownerId={owner.id} />
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informations Personnelles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">ID</div>
            <div className="text-base font-medium text-gray-900 font-mono">{owner.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Nom Complet</div>
            <div className="text-base font-medium text-gray-900">
              {owner.firstName} {owner.lastName}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Email</div>
            <div className="text-base font-medium text-gray-900">
              <a
                href={`mailto:${owner.email}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {owner.email}
              </a>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Téléphone</div>
            <div className="text-base font-medium text-gray-900">
              {owner.phone || '-'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Inscription</div>
            <div className="text-base font-medium text-gray-900">
              {format(new Date(owner.createdAt), 'PPPp', { locale: fr })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Dernière Mise à Jour</div>
            <div className="text-base font-medium text-gray-900">
              {format(new Date(owner.updatedAt), 'PPPp', { locale: fr })}
            </div>
          </div>
        </div>
      </div>

      {/* Companies */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Entreprises ({owner.ownerships.length})
        </h2>
        {owner.ownerships.length === 0 ? (
          <p className="text-gray-500">Aucune entreprise associée</p>
        ) : (
          <div className="space-y-4">
            {owner.ownerships.map((ownership) => (
              <div
                key={ownership.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link
                      href={`/admin/companies/${ownership.company.id}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {ownership.company.name}
                    </Link>
                    {!ownership.company.isActive && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Inactif
                      </span>
                    )}
                    {ownership.isPrimary && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Depuis {format(new Date(ownership.createdAt), 'PPP', { locale: fr })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {ownership.company.email && (
                    <div>
                      <span className="text-gray-600">Email: </span>
                      <a
                        href={`mailto:${ownership.company.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {ownership.company.email}
                      </a>
                    </div>
                  )}
                  {ownership.company.phone && (
                    <div>
                      <span className="text-gray-600">Téléphone: </span>
                      <a
                        href={`tel:${ownership.company.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {ownership.company.phone}
                      </a>
                    </div>
                  )}
                  {ownership.company.address && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Adresse: </span>
                      <span className="text-gray-900">
                        {ownership.company.address}, {ownership.company.postalCode} {ownership.company.city}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Note: </span>
                    <span className="text-gray-900">
                      {ownership.company.rating ? `${ownership.company.rating}/5` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avis: </span>
                    <span className="text-gray-900">{ownership.company.reviewCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informations d'Abonnement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Niveau</div>
            <div className="text-base font-medium text-gray-900">
              {owner.subscriptionTier || 'free'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Statut</div>
            <div className="text-base font-medium text-gray-900">
              {owner.subscriptionStatus || 'active'}
            </div>
          </div>
          {owner.subscriptionStart && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Début Abonnement</div>
              <div className="text-base font-medium text-gray-900">
                {format(new Date(owner.subscriptionStart), 'PPP', { locale: fr })}
              </div>
            </div>
          )}
          {owner.subscriptionEnd && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Fin Abonnement</div>
              <div className="text-base font-medium text-gray-900">
                {format(new Date(owner.subscriptionEnd), 'PPP', { locale: fr })}
              </div>
            </div>
          )}
          {owner.stripeCustomerId && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Stripe Customer ID</div>
              <div className="text-base font-medium text-gray-900 font-mono text-xs">
                {owner.stripeCustomerId}
              </div>
            </div>
          )}
          {owner.stripeSubscriptionId && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Stripe Subscription ID</div>
              <div className="text-base font-medium text-gray-900 font-mono text-xs">
                {owner.stripeSubscriptionId}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

