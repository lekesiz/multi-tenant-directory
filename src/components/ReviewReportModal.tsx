'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FlagIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ReviewReportModalProps {
  reviewId: number;
}

const reportReasons = [
  { value: 'spam', label: 'Spam ou publicité' },
  { value: 'offensive', label: 'Contenu offensant ou inapproprié' },
  { value: 'fake', label: 'Faux avis' },
  { value: 'other', label: 'Autre raison' },
];

export function ReviewReportModal({ reviewId }: ReviewReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Veuillez sélectionner une raison');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du signalement');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        title="Signaler cet avis"
      >
        <FlagIcon className="w-4 h-4" />
        <span>Signaler</span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (!loading) {
              setIsOpen(false);
              setError('');
              setSuccess(false);
            }
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between"
                  >
                    Signaler un avis
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                      disabled={loading}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </Dialog.Title>

                  {success ? (
                    <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg text-center">
                      <p className="font-medium">Signalement enregistré</p>
                      <p className="text-sm mt-1">Merci de votre contribution</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Raison du signalement
                          </label>
                          <div className="space-y-2">
                            {reportReasons.map((option) => (
                              <label
                                key={option.value}
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                              >
                                <input
                                  type="radio"
                                  name="reason"
                                  value={option.value}
                                  checked={reason === option.value}
                                  onChange={(e) => setReason(e.target.value)}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  disabled={loading}
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {reason === 'other' && (
                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Précisez (optionnel)
                            </label>
                            <textarea
                              id="description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Décrivez le problème..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={3}
                              maxLength={500}
                              disabled={loading}
                            />
                          </div>
                        )}

                        {error && (
                          <p className="text-sm text-red-600">{error}</p>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                          disabled={loading}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                          disabled={loading || !reason}
                        >
                          {loading ? 'Envoi...' : 'Signaler'}
                        </button>
                      </div>
                    </form>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}