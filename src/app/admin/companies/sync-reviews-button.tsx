'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';

export default function SyncReviewsButton({ companyId }: { companyId?: number }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/reviews/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          syncAll: !companyId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (companyId) {
          setMessage(`✅ ${data.reviewsAdded} yeni yorum eklendi`);
        } else {
          setMessage(`✅ ${data.totalReviewsAdded} yeni yorum eklendi (${data.companiesProcessed} şirket)`);
        }
        
        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`❌ Hata: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Bir hata oluştu');
      logger.error('Sync error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleSync}
        disabled={loading}
        className={`${
          companyId
            ? 'bg-green-500 hover:bg-green-600 px-2 py-1 text-xs'
            : 'bg-green-600 hover:bg-green-700 px-4 py-2 text-sm'
        } text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`}
        title={loading ? 'Senkronize ediliyor...' : companyId ? 'Google yorumlarını çek' : 'Tüm işletmeler için Google yorumlarını çek'}
      >
        <svg
          className={`${companyId ? 'w-3.5 h-3.5' : 'w-5 h-5'} ${loading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {loading ? (companyId ? '...' : 'Sync...') : companyId ? 'Sync' : 'Sync Tous'}
      </button>
      {message && (
        <p className={`mt-2 text-xs ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
      )}
    </div>
  );
}

