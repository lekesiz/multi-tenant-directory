'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface CompanyStatusToggleProps {
  companyId: number;
  isActive: boolean;
  companyName: string;
  onStatusChange?: (isActive: boolean) => void;
}

export default function CompanyStatusToggle({
  companyId,
  isActive,
  companyName,
  onStatusChange,
}: CompanyStatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isActive);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update company status');

      setCurrentStatus(!currentStatus);
      toast.success(currentStatus ? `${companyName} désactivée` : `${companyName} activée`);

      if (onStatusChange) {
        onStatusChange(!currentStatus);
      }

      // Refresh page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error('Error toggling status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
        currentStatus
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-red-100 text-red-800 hover:bg-red-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={loading ? 'Mise à jour...' : currentStatus ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
    >
      {loading ? (
        <>
          <svg className="w-3 h-3 inline mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          ...
        </>
      ) : currentStatus ? (
        '✓ Actif'
      ) : (
        '🚫 Inactif'
      )}
    </button>
  );
}
