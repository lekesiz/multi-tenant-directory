'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface EmailPreferences {
  emailNewReview: boolean;
  emailReviewReply: boolean;
  emailWeeklyDigest: boolean;
  emailMarketing: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreferences>({
    emailNewReview: true,
    emailReviewReply: true,
    emailWeeklyDigest: false,
    emailMarketing: false,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/business/email-preferences');
      
      if (response.status === 401) {
        router.push('/business/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      logger.error('Error fetching preferences:', error);
      setMessage('Erreur lors du chargement des préférences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/business/email-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setMessage('Préférences sauvegardées avec succès');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      logger.error('Error saving preferences:', error);
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour au tableau de bord
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gérez vos préférences de notification
            </p>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notifications par email
            </h2>

            <div className="space-y-4">
              {/* New Review */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Nouveaux avis
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Recevez une notification quand un client laisse un nouvel avis
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('emailNewReview')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    preferences.emailNewReview ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailNewReview}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      preferences.emailNewReview ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Review Reply */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Réponses aux avis
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Soyez notifié quand quelqu'un répond à votre avis
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('emailReviewReply')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    preferences.emailReviewReply ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailReviewReply}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      preferences.emailReviewReply ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Résumé hebdomadaire
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Recevez un résumé de vos statistiques chaque semaine
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('emailWeeklyDigest')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    preferences.emailWeeklyDigest ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailWeeklyDigest}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      preferences.emailWeeklyDigest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Actualités et offres
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Informations sur les nouvelles fonctionnalités et offres spéciales
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('emailMarketing')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    preferences.emailMarketing ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailMarketing}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      preferences.emailMarketing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg ${
                message.includes('succès') 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Sauvegarde...' : 'Enregistrer les préférences'}
              </button>
            </div>

            {/* Privacy Note */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Votre vie privée est importante
              </h4>
              <p className="text-sm text-blue-800">
                Vous pouvez modifier vos préférences à tout moment. 
                Tous nos emails contiennent un lien de désinscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}