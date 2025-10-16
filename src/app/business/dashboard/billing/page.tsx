import { redirect } from 'next/navigation';
import SubscriptionCard from '@/components/SubscriptionCard';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function BillingPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const businessOwner = await prisma.businessOwner.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionStart: true,
      subscriptionEnd: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      trialStart: true,
      trialEnd: true,
    },
  });

  if (!businessOwner) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Facturation</h1>
        <p className="text-gray-600 mt-2">
          Gérez votre abonnement et consultez votre historique de facturation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Card */}
        <div className="lg:col-span-2">
          <SubscriptionCard businessOwner={businessOwner} />
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Historique de facturation
          </h2>
          
          <div className="space-y-3">
            {businessOwner.subscriptionTier === 'free' ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">
                  Aucune facture disponible
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Passez Premium pour voir votre historique
                </p>
              </div>
            ) : (
              <>
                {/* Sample invoice - this would be populated from Stripe */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Plan Premium</p>
                      <p className="text-sm text-gray-500">
                        {businessOwner.currentPeriodStart?.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">29,00 €</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Payé
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2">
                  Voir toutes les factures
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Utilisation actuelle
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {businessOwner.subscriptionTier === 'free' ? '3' : '∞'}
            </div>
            <p className="text-sm text-gray-600">Catégories</p>
            {businessOwner.subscriptionTier === 'free' && (
              <p className="text-xs text-gray-400 mt-1">Limite: 3</p>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {businessOwner.subscriptionTier === 'free' ? '5' : '∞'}
            </div>
            <p className="text-sm text-gray-600">Photos</p>
            {businessOwner.subscriptionTier === 'free' && (
              <p className="text-xs text-gray-400 mt-1">Limite: 5</p>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {businessOwner.subscriptionTier === 'premium' ? '✓' : '✗'}
            </div>
            <p className="text-sm text-gray-600">Mise en avant</p>
            <p className="text-xs text-gray-400 mt-1">
              {businessOwner.subscriptionTier === 'premium' ? 'Activé' : 'Premium requis'}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Questions fréquentes
        </h2>
        
        <div className="space-y-4">
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-900 py-2">
              <span>Comment annuler mon abonnement ?</span>
              <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 text-gray-600 text-sm">
              Vous pouvez annuler votre abonnement à tout moment depuis le portail de facturation. 
              Votre abonnement restera actif jusqu'à la fin de la période de facturation actuelle.
            </div>
          </details>
          
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-900 py-2">
              <span>Puis-je changer de plan ?</span>
              <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 text-gray-600 text-sm">
              Oui, vous pouvez passer d'un plan à un autre à tout moment. 
              Les changements prennent effet immédiatement et sont facturés au prorata.
            </div>
          </details>
          
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-900 py-2">
              <span>Que se passe-t-il après l'essai gratuit ?</span>
              <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 text-gray-600 text-sm">
              Après les 14 jours d'essai gratuit, votre abonnement Premium sera automatiquement facturé. 
              Vous pouvez annuler à tout moment pendant l'essai sans frais.
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}