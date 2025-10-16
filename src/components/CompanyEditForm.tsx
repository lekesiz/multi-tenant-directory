'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BusinessHoursForm from './BusinessHoursForm';

interface Company {
  id: number;
  name: string;
  slug: string;
  googlePlaceId: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  categories: string[];
  logoUrl: string | null;
  coverImageUrl: string | null;
  content: Array<{
    id: number;
    domainId: number;
    isVisible: boolean;
    customDescription: string | null;
    customImages: any;
    promotions: string | null;
    priority: number;
    featuredUntil: Date | null;
    domain: {
      id: number;
      name: string;
    };
  }>;
  reviews: Array<{
    id: number;
    authorName: string;
    authorPhoto: string | null;
    rating: number;
    comment: string | null;
    source: string;
    reviewDate: Date;
    isApproved: boolean;
  }>;
}

interface Domain {
  id: number;
  name: string;
  isActive: boolean;
}

export default function CompanyEditForm({
  company,
  domains,
}: {
  company: Company;
  domains: Domain[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'hours' | 'domains' | 'reviews'>(
    'info'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: company.name,
    slug: company.slug,
    address: company.address || '',
    city: company.city || '',
    postalCode: company.postalCode || '',
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || '',
    latitude: company.latitude?.toString() || '',
    longitude: company.longitude?.toString() || '',
    categories: company.categories,
  });

  const [domainSettings, setDomainSettings] = useState<
    Record<
      number,
      {
        isVisible: boolean;
        customDescription: string;
        promotions: string;
        priority: number;
        featuredUntil: string;
      }
    >
  >(
    domains.reduce((acc, domain) => {
      const content = company.content.find((c) => c.domainId === domain.id);
      acc[domain.id] = {
        isVisible: content?.isVisible || false,
        customDescription: content?.customDescription || '',
        promotions: content?.promotions || '',
        priority: content?.priority || 0,
        featuredUntil: content?.featuredUntil ? new Date(content.featuredUntil).toISOString().split('T')[0] : '',
      };
      return acc;
    }, {} as any)
  );

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Şirket bilgileri güncellendi');
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

  const handleDomainSettingsSave = async (domainId: number) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/companies/${company.id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domainId,
          ...domainSettings[domainId],
        }),
      });

      if (response.ok) {
        setSuccess('Domain ayarları kaydedildi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Kaydetme sırasında bir hata oluştu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu şirketi silmek istediğinizden emin misiniz?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/companies');
      } else {
        setError('Silme sırasında bir hata oluştu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600 mt-2">Şirket bilgilerini düzenleyin</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/companies"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Geri Dön
            </Link>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900"
            >
              Şirketi Sil
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Temel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hours'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Horaires d'ouverture
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'domains'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Domain Yönetimi
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Yorumlar ({company.reviews.length})
          </button>
        </nav>
      </div>

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

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Temel Bilgiler
          </h2>

          <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posta Kodu
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Coordinates Section */}
              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Konum Koordinatları (GPS)
                  </h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Haritadaki konumunu ayarlamak için enlem (latitude) ve boylam (longitude) değerlerini girin.
                    Google Maps'ten alabilirsiniz.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enlem (Latitude)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData({ ...formData, latitude: e.target.value })
                        }
                        placeholder="48.8156"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Boylam (Longitude)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData({ ...formData, longitude: e.target.value })
                        }
                        placeholder="7.7889"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <div className="mt-2 text-xs text-green-700">
                      ✓ Koordinatlar ayarlandı: {formData.latitude}, {formData.longitude}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'hours' && (
        <BusinessHoursForm companyId={company.id} />
      )}

      {activeTab === 'domains' && (
        <div className="space-y-6">
          {domains.map((domain) => {
            const settings = domainSettings[domain.id];
            return (
              <div key={domain.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {domain.name}
                    </h3>
                    <label className="ml-4 flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.isVisible}
                        onChange={(e) =>
                          setDomainSettings({
                            ...domainSettings,
                            [domain.id]: {
                              ...settings,
                              isVisible: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Bu sitede görünür
                      </span>
                    </label>
                  </div>
                  <button
                    onClick={() => handleDomainSettingsSave(domain.id)}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                  >
                    Kaydet
                  </button>
                </div>

                {settings.isVisible && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Özel Açıklama
                      </label>
                      <textarea
                        value={settings.customDescription}
                        onChange={(e) =>
                          setDomainSettings({
                            ...domainSettings,
                            [domain.id]: {
                              ...settings,
                              customDescription: e.target.value,
                            },
                          })
                        }
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder={`${domain.name} için özel açıklama...`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Promosyonlar / Özel Teklifler
                      </label>
                      <textarea
                        value={settings.promotions}
                        onChange={(e) =>
                          setDomainSettings({
                            ...domainSettings,
                            [domain.id]: {
                              ...settings,
                              promotions: e.target.value,
                            },
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Özel teklifler, indirimler..."
                      />
                    </div>

                    {/* Featured Section */}
                    <div className="border-t pt-4 mt-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-amber-900 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Entreprise Mise en Avant
                        </h4>
                        <p className="text-xs text-amber-700 mb-3">
                          Les entreprises mises en avant apparaissent en premier dans les résultats de recherche
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Priorité (0-100)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={settings.priority}
                              onChange={(e) =>
                                setDomainSettings({
                                  ...domainSettings,
                                  [domain.id]: {
                                    ...settings,
                                    priority: parseInt(e.target.value) || 0,
                                  },
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              placeholder="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Plus élevé = Plus visible
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mise en avant jusqu'au
                            </label>
                            <input
                              type="date"
                              value={settings.featuredUntil}
                              onChange={(e) =>
                                setDomainSettings({
                                  ...domainSettings,
                                  [domain.id]: {
                                    ...settings,
                                    featuredUntil: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Laissez vide pour illimité
                            </p>
                          </div>
                        </div>

                        {settings.priority > 0 && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                            ✓ Cette entreprise sera mise en avant sur {domain.name}
                            {settings.featuredUntil && ` jusqu'au ${new Date(settings.featuredUntil).toLocaleDateString('fr-FR')}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Google Yorumları
          </h2>

          {company.reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz yorum yok
            </div>
          ) : (
            <div className="space-y-4">
              {company.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">
                      {review.authorName}
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-semibold">{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(review.reviewDate).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

