'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SubscriptionDashboard from '@/components/SubscriptionDashboard';
import PricingPlans from '@/components/PricingPlans';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  slug: string;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    companyId ? parseInt(companyId) : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'dashboard' | 'plans'>('dashboard');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies/my-companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies);

          // Select first company if none selected
          if (!selectedCompanyId && data.companies.length > 0) {
            setSelectedCompanyId(data.companies[0].id);
          }
        } else {
          setError('Failed to load companies');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchCompanies();
    }
  }, [session, selectedCompanyId]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="rounded-lg bg-yellow-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-yellow-600" />
            <h2 className="mt-2 text-lg font-semibold text-yellow-900">Aucune Entreprise</h2>
            <p className="mt-1 text-yellow-800">Vous devez d'abord créer une entreprise pour gérer votre abonnement.</p>
            <a
              href="/dashboard"
              className="mt-4 inline-block rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
            >
              Retour au Tableau de Bord
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Tableau de Bord
          </a>
          <h1 className="text-4xl font-bold text-gray-900">Gestion de l'Abonnement</h1>
          <p className="mt-2 text-gray-600">
            Gérez votre plan d'abonnement, les paiements et les fonctionnalités.
          </p>
        </div>

        {/* Company Selector */}
        {companies.length > 1 && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-700">Sélectionner une Entreprise</label>
            <select
              value={selectedCompanyId || ''}
              onChange={(e) => setSelectedCompanyId(parseInt(e.target.value))}
              className="mt-2 block w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex border-b border-gray-200">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              tab === 'dashboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Abonnement Actuel
          </button>
          <button
            onClick={() => setTab('plans')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              tab === 'plans'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous les Plans
          </button>
        </div>

        {/* Content */}
        {selectedCompanyId && (
          <>
            {tab === 'dashboard' && (
              <SubscriptionDashboard companyId={selectedCompanyId} />
            )}
            {tab === 'plans' && (
              <PricingPlans
                highlightPlan="pro"
                showYearlyOption={true}
                onSelectPlan={(plan, billingPeriod) => {
                  router.push(
                    `/dashboard/subscription/checkout?` +
                    `companyId=${selectedCompanyId}&` +
                    `plan=${plan.slug}&` +
                    `period=${billingPeriod}`
                  );
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
