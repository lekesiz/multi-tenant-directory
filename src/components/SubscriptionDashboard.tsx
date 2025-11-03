'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { AlertCircle, Check, Clock, CreditCard, Settings, Zap } from 'lucide-react';

interface Subscription {
  companyId: number;
  companyName: string;
  tier: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired';
  startDate: string;
  renewalDate: string;
  daysUntilRenewal: number | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  isTrialing: boolean;
  isFeatured: boolean;
  featuredTier: string | null;
  featuredUntil: string | null;
}

interface SubscriptionDashboardProps {
  companyId: number;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  trialing: 'bg-blue-100 text-blue-800',
  canceled: 'bg-red-100 text-red-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-gray-100 text-gray-800',
};

const tierFeatures = {
  free: ['Profile Setup', 'Basic Analytics'],
  basic: ['Profile Setup', 'Reviews Management', '1 Featured Day/Month', 'Basic Analytics', 'Email Support'],
  pro: ['Everything in Basic', 'AI Content Generator', 'Video Gallery', '5 Featured Days/Month', 'Advanced Analytics', 'Priority Support'],
  premium: ['Everything in Pro', 'Unlimited Featured Days', 'Booking System', 'E-commerce Integration', 'API Access', '24/7 Support'],
};

export default function SubscriptionDashboard({ companyId }: SubscriptionDashboardProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(`/api/subscriptions/${companyId}`);
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else {
          setError('Failed to load subscription details');
        }
      } catch (err) {
        logger.error('Error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [companyId]);

  const handleCancelSubscription = async (immediate: boolean) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: immediate ? 'cancel_immediately' : 'cancel_at_period_end',
        }),
      });

      if (response.ok) {
        setError(null);
        setCancelDialog(false);
        // Refresh subscription data
        const refreshResponse = await fetch(`/api/subscriptions/${companyId}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setSubscription(data);
        }
      } else {
        setError('Failed to cancel subscription');
      }
    } catch (err) {
      logger.error('Error:', err);
      setError('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      });

      if (response.ok) {
        setError(null);
        // Refresh
        const refreshResponse = await fetch(`/api/subscriptions/${companyId}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setSubscription(data);
        }
      } else {
        setError('Failed to reactivate subscription');
      }
    } catch (err) {
      logger.error('Error:', err);
      setError('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No subscription found</p>
      </div>
    );
  }

  const features = tierFeatures[subscription.tier as keyof typeof tierFeatures] || [];
  const isExpiringSoon = subscription.daysUntilRenewal !== null && subscription.daysUntilRenewal <= 7;

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Main Subscription Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900 capitalize">
                {subscription.tier}
              </h2>
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusColors[subscription.status]}`}>
                {subscription.isTrialing ? 'Essai Gratuit' : subscription.status === 'active' ? 'Actif' : subscription.status === 'canceled' ? 'Annulé' : subscription.status === 'past_due' ? 'En Attente' : 'Expiré'}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{subscription.companyName}</p>
          </div>
          {subscription.isFeatured && (
            <div className="rounded-lg bg-yellow-50 p-3">
              <Zap className="h-5 w-5 text-yellow-600" />
              <p className="mt-1 text-xs font-semibold text-yellow-800">Annonce Mise en Avant</p>
            </div>
          )}
        </div>

        {/* Status Details */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {/* Start Date */}
          <div>
            <p className="text-sm text-gray-600">Date de Début</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {new Date(subscription.startDate).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Renewal Date */}
          <div>
            <p className="text-sm text-gray-600">Date de Renouvellement</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {new Date(subscription.renewalDate).toLocaleDateString('fr-FR')}
            </p>
            {subscription.daysUntilRenewal !== null && (
              <p className={`mt-1 text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-600'}`}>
                {subscription.daysUntilRenewal === 0
                  ? 'Aujourd\'hui'
                  : subscription.daysUntilRenewal === 1
                  ? 'Demain'
                  : `${subscription.daysUntilRenewal} jours`}
              </p>
            )}
          </div>

          {/* Trial Status */}
          {subscription.isTrialing && subscription.trialEnd && (
            <div>
              <p className="text-sm text-gray-600">Fin de l'Essai</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {new Date(subscription.trialEnd).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}

          {/* Featured Status */}
          {subscription.isFeatured && subscription.featuredUntil && (
            <div>
              <p className="text-sm text-gray-600">Annonce Mise en Avant Jusqu'au</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {new Date(subscription.featuredUntil).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900">Fonctionnalités Incluses</h3>
          <div className="mt-4 space-y-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3 border-t pt-6">
          {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
            <button
              onClick={() => setCancelDialog(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100"
              disabled={actionLoading}
            >
              <AlertCircle className="h-4 w-4" />
              Annuler l'Abonnement
            </button>
          )}

          {subscription.cancelAtPeriodEnd && (
            <button
              onClick={handleReactivate}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              disabled={actionLoading}
            >
              <Check className="h-4 w-4" />
              Annuler l'Annulation
            </button>
          )}

          <a
            href={`/dashboard/subscription/upgrade?companyId=${companyId}`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Zap className="h-4 w-4" />
            Changer de Plan
          </a>
        </div>
      </div>

      {/* Cancel Dialog */}
      {cancelDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="rounded-lg bg-white p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900">Annuler l'Abonnement?</h3>
            <p className="mt-2 text-gray-600">
              Êtes-vous sûr? Vous pouvez annuler l'annulation à tout moment avant la date de renouvellement.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelDialog(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Garder l'Abonnement
              </button>
              <button
                onClick={() => handleCancelSubscription(false)}
                className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
                disabled={actionLoading}
              >
                Annuler à la Date de Renouvellement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
