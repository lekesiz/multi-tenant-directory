'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type PricingButtonProps = {
  planSlug: string;
  period: 'month' | 'year';
  label: string;
  highlighted?: boolean;
};

export default function PricingButton({
  planSlug,
  period,
  label,
  highlighted = false,
}: PricingButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      // Check if user is logged in
      if (status === 'unauthenticated') {
        // Redirect to business register with return URL
        const returnUrl = `/dashboard/subscription/checkout?plan=${planSlug}&period=${period}`;
        router.push(`/business/register?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      // Check if user has a company
      const response = await fetch('/api/user/company');
      const data = await response.json();

      if (!data.company) {
        // User doesn't have a company, redirect to company creation
        alert('Vous devez d\'abord créer un profil d\'entreprise');
        router.push('/business/register');
        return;
      }

      // Everything is OK, redirect to checkout
      router.push(
        `/dashboard/subscription/checkout?plan=${planSlug}&period=${period}&companyId=${data.company.id}`
      );
    } catch (error) {
      logger.error('Error handling pricing button click:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || status === 'loading'}
      className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
        highlighted
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg disabled:opacity-50'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50'
      }`}
    >
      {loading || status === 'loading' ? 'Chargement...' : label}
    </button>
  );
}

