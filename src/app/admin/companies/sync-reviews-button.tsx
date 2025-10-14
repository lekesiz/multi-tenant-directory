'use client';

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
      console.error('Sync error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg
          className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
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
        {loading ? 'Senkronize ediliyor...' : companyId ? 'Yorumları Çek' : 'Tüm Yorumları Çek'}
      </button>
      {message && (
        <p className="mt-2 text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}

