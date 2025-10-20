'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteInquiryButtonProps {
  inquiryId: number;
}

export default function DeleteInquiryButton({ inquiryId }: DeleteInquiryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/inquiries');
        router.refresh();
      } else {
        alert('Erreur lors de la suppression du message');
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Erreur lors de la suppression du message');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? 'Suppression...' : 'Supprimer'}
    </button>
  );
}

