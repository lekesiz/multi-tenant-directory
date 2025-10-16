import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/solid';
import { PLANS, FEATURE_LIST, type PlanId } from '@/config/pricing';

export const metadata = {
  title: 'Tarifs - Haguenau.pro',
  description:
    'Choisissez le plan parfait pour votre entreprise. Plans flexibles adaptés aux besoins de chaque entreprise locale.',
};

export default function PricingPage() {
  const planOrder: PlanId[] = ['free', 'basic', 'pro', 'enterprise'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Des tarifs simples et transparents
          </h1>
          <p className="mx-auto max-w-2xl text-xl">
            Choisissez le plan qui convient le mieux à votre entreprise. Passez à un plan
            supérieur ou annulez à tout moment.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {planOrder.map((planId) => {
            const plan = PLANS[planId];
            const isPopular = plan.popular;

            return (
              <div
                key={planId}
                className={`relative rounded-2xl bg-white shadow-lg transition-transform hover:scale-105 ${
                  isPopular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <span className="rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                      Le plus populaire
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">{plan.name}</h2>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">Gratuit</div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                        <span className="text-gray-600">/{plan.interval}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={
                      plan.price === 0
                        ? '/auth/register'
                        : `/business/dashboard/billing?plan=${planId}`
                    }
                    className={`mb-6 block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
                      isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                  </Link>

                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Fonctionnalités:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start text-sm text-gray-600">
                        <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>
                          {plan.features.maxPhotos === -1
                            ? 'Photos illimitées'
                            : `${plan.features.maxPhotos} photos`}
                        </span>
                      </li>
                      <li className="flex items-start text-sm text-gray-600">
                        <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>Analytics ({plan.features.analyticsRetention} jours)</span>
                      </li>
                      {plan.features.priorityBoost > 0 && (
                        <li className="flex items-start text-sm text-gray-600">
                          <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>Priorité +{plan.features.priorityBoost}</span>
                        </li>
                      )}
                      {plan.features.featured && (
                        <li className="flex items-start text-sm text-gray-600">
                          <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>Mise en avant homepage</span>
                        </li>
                      )}
                      {plan.features.aiReviewResponses && (
                        <li className="flex items-start text-sm text-gray-600">
                          <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>Réponses IA automatiques</span>
                        </li>
                      )}
                      {plan.features.whatsappIntegration && (
                        <li className="flex items-start text-sm text-gray-600">
                          <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>WhatsApp Business</span>
                        </li>
                      )}
                      {plan.features.competitorAnalysis && (
                        <li className="flex items-start text-sm text-gray-600">
                          <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>Analyse concurrentielle</span>
                        </li>
                      )}
                      {plan.features.dedicatedSupport && (
                        <li className="flex items-start text-sm text-gray-600">
                          <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>Support prioritaire</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Comparaison détaillée des fonctionnalités
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg bg-white shadow-lg">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Fonctionnalité
                  </th>
                  {planOrder.map((planId) => (
                    <th key={planId} className="px-6 py-4 text-center text-sm font-semibold">
                      {PLANS[planId].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_LIST.map((category) => (
                  <>
                    <tr key={category.category} className="border-b border-gray-200 bg-gray-50">
                      <td
                        colSpan={5}
                        className="px-6 py-3 text-sm font-semibold text-gray-900"
                      >
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">{feature.name}</td>
                        <td className="px-6 py-4 text-center text-sm">
                          {renderFeatureValue(feature.free)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {renderFeatureValue(feature.basic)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {renderFeatureValue(feature.pro)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {renderFeatureValue(feature.enterprise)}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Questions fréquentes
          </h2>

          <div className="mx-auto max-w-3xl space-y-6">
            <FAQItem
              question="Puis-je essayer gratuitement avant de m'abonner?"
              answer="Oui! Tous les plans Basic et Pro incluent une période d'essai gratuite de 14 jours. Aucune carte de crédit n'est requise pour commencer."
            />
            <FAQItem
              question="Puis-je changer de plan à tout moment?"
              answer="Absolument! Vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord. Les modifications prennent effet immédiatement."
            />
            <FAQItem
              question="Comment fonctionne la facturation?"
              answer="La facturation est mensuelle et automatique. Vous recevrez une facture par email chaque mois. Vous pouvez annuler à tout moment sans frais supplémentaires."
            />
            <FAQItem
              question="Y a-t-il des frais cachés?"
              answer="Non, le prix affiché est tout compris. Pas de frais cachés, pas de commissions sur les ventes. Ce que vous voyez est ce que vous payez."
            />
            <FAQItem
              question="Que se passe-t-il si j'annule mon abonnement?"
              answer="Vous conservez l'accès à toutes les fonctionnalités premium jusqu'à la fin de votre période de facturation. Après cela, votre compte reviendra au plan gratuit."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-blue-600 p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            Prêt à développer votre entreprise en ligne?
          </h2>
          <p className="mb-8 text-xl">
            Rejoignez des centaines d'entreprises locales qui font confiance à notre plateforme.
          </p>
          <Link
            href="/auth/register"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 transition-colors hover:bg-gray-100"
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
}

function renderFeatureValue(value: boolean | string) {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckIcon className="mx-auto h-5 w-5 text-green-500" />
    ) : (
      <span className="text-gray-400">—</span>
    );
  }
  return <span className="text-gray-700">{value}</span>;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
