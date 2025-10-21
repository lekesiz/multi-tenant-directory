'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InquiryStatusFormProps {
  inquiryId: number;
  currentStatus: string;
}

export default function InquiryStatusForm({ inquiryId, currentStatus }: InquiryStatusFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        router.refresh();
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      logger.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {['new', 'read', 'replied', 'closed'].map((s) => (
        <button
          key={s}
          onClick={() => handleStatusChange(s)}
          disabled={isLoading || s === status}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            s === status
              ? s === 'new'
                ? 'bg-blue-600 text-white'
                : s === 'read'
                ? 'bg-yellow-600 text-white'
                : s === 'replied'
                ? 'bg-green-600 text-white'
                : 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {s === 'new'
            ? 'Nouveau'
            : s === 'read'
            ? 'Lu'
            : s === 'replied'
            ? 'Répondu'
            : 'Fermé'}
        </button>
      ))}
    </div>
  );
}

