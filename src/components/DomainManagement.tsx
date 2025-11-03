'use client';

import { useState } from 'react';

interface Domain {
  id: number;
  name: string;
  isActive: boolean;
  siteTitle: string | null;
  siteDescription: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  _count: {
    content: number;
  };
}

export default function DomainManagement({
  domains: initialDomains,
}: {
  domains: Domain[];
}) {
  const [domains, setDomains] = useState(initialDomains);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editForm, setEditForm] = useState({
    siteTitle: '',
    siteDescription: '',
    primaryColor: '#3B82F6',
  });

  const handleEdit = (domain: Domain) => {
    setEditingId(domain.id);
    setEditForm({
      siteTitle: domain.siteTitle || domain.name,
      siteDescription:
        domain.siteDescription ||
        `Annuaire des professionnels à ${domain.name.split('.')[0]}`,
      primaryColor: domain.primaryColor || '#3B82F6',
    });
  };

  const handleSave = async (domainId: number) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedDomain = await response.json();
        setDomains(
          domains.map((d) => (d.id === domainId ? updatedDomain : d))
        );
        setEditingId(null);
        setSuccess('Domain ayarları güncellendi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Güncelleme sırasında bir hata oluştu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (domainId: number, isActive: boolean) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        const updatedDomain = await response.json();
        setDomains(
          domains.map((d) => (d.id === domainId ? updatedDomain : d))
        );
        setSuccess(`Domain ${!isActive ? 'aktif' : 'pasif'} edildi`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('İşlem sırasında bir hata oluştu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Notifications */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Domains Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {domains.map((domain) => (
          <div key={domain.id} className="bg-white rounded-lg shadow">
            {editingId === domain.id ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {domain.name}
                  </h3>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Başlığı
                    </label>
                    <input
                      type="text"
                      value={editForm.siteTitle}
                      onChange={(e) =>
                        setEditForm({ ...editForm, siteTitle: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Açıklaması
                    </label>
                    <textarea
                      value={editForm.siteDescription}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          siteDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ana Renk
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editForm.primaryColor}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editForm.primaryColor}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            primaryColor: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => handleSave(domain.id)}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {domain.name}
                      </h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={domain.isActive}
                          onChange={() =>
                            handleToggleActive(domain.id, domain.isActive)
                          }
                          disabled={loading}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {domain.siteDescription ||
                        `Annuaire des professionnels à ${
                          domain.name.split('.')[0]
                        }`}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        {domain._count.content} şirket
                      </span>
                      {domain.primaryColor && (
                        <span className="flex items-center">
                          <span
                            className="w-4 h-4 rounded mr-1 border border-gray-300"
                            style={{ backgroundColor: domain.primaryColor }}
                          ></span>
                          {domain.primaryColor}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(domain)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/admin/domains/${domain.id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Gérer les entreprises
                  </a>
                  <a
                    href={`https://${domain.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Siteyi Görüntüle
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

