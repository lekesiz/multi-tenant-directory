'use client';

import { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface NewsletterSubscribeProps {
  variant?: 'inline' | 'modal' | 'footer';
  showPreferences?: boolean;
}

export default function NewsletterSubscribe({ 
  variant = 'inline',
  showPreferences = false 
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({
    weeklyDigest: true,
    newBusinesses: true,
    specialOffers: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          preferences: showPreferences ? preferences : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'abonnement');
      }

      setSuccess(true);
      setEmail('');
      setFirstName('');

      // Reset after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'footer') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <EnvelopeIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Newsletter
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Recevez les dernières actualités et offres directement dans votre boîte mail.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={loading || success}
          />
          <button
            type="submit"
            disabled={loading || success}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Inscription...' : success ? '✓ Inscrit !' : 'S\'abonner'}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <EnvelopeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Restez informé
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Inscrivez-vous à notre newsletter pour recevoir les dernières actualités
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom (optionnel)
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jean"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading || success}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading || success}
            />
          </div>

          {showPreferences && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Préférences
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.weeklyDigest}
                  onChange={(e) => setPreferences({ ...preferences, weeklyDigest: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Résumé hebdomadaire
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.newBusinesses}
                  onChange={(e) => setPreferences({ ...preferences, newBusinesses: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Nouvelles entreprises
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.specialOffers}
                  onChange={(e) => setPreferences({ ...preferences, specialOffers: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Offres spéciales
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Inscription en cours...' : success ? '✓ Inscription réussie !' : 'S\'abonner à la newsletter'}
          </button>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Inscription réussie ! Vérifiez votre email.
              </p>
            </div>
          )}
        </form>

        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          En vous abonnant, vous acceptez de recevoir nos emails. Vous pouvez vous désabonner à tout moment.
        </p>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
      <div className="flex items-center gap-3 mb-3">
        <EnvelopeIcon className="h-6 w-6" />
        <h3 className="text-lg font-semibold">
          Abonnez-vous à notre newsletter
        </h3>
      </div>
      <p className="text-blue-100 mb-4 text-sm">
        Recevez les dernières actualités et offres exclusives
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          required
          className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
          disabled={loading || success}
        />
        <button
          type="submit"
          disabled={loading || success}
          className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '...' : success ? '✓' : 'S\'abonner'}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-200">{error}</p>
      )}
    </div>
  );
}

