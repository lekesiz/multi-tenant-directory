'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteBusinessOwnerButtonProps {
  ownerId: string;
}

export default function DeleteBusinessOwnerButton({ ownerId }: DeleteBusinessOwnerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/business-owners/${ownerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/business-owners');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting business owner:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Supprimer le Compte
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Suppression...' : 'Confirmer'}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={isDeleting}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Annuler
      </button>
    </div>
  );
}

