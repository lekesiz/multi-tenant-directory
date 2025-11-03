'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Domain {
  id: number;
  name: string;
  settings: any;
}

interface SEOSettingsFormProps {
  domains: Domain[];
}

interface SEOSettings {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleSearchConsoleVerification?: string;
  googleAdsId?: string;
  facebookPixelId?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  linkedinPartnerId?: string;
  hotjarId?: string;
  clarityId?: string;
  customScripts?: string;
  customBodyScripts?: string;
}

export default function SEOSettingsForm({ domains }: SEOSettingsFormProps) {
  const router = useRouter();
  const [selectedDomainId, setSelectedDomainId] = useState<number>(domains[0]?.id || 0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedDomain = domains.find(d => d.id === selectedDomainId);
  const currentSettings: SEOSettings = (selectedDomain?.settings as any)?.seo || {};

  const [formData, setFormData] = useState<SEOSettings>(currentSettings);

  const handleDomainChange = (domainId: number) => {
    setSelectedDomainId(domainId);
    const domain = domains.find(d => d.id === domainId);
    const settings: SEOSettings = (domain?.settings as any)?.seo || {};
    setFormData(settings);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/domains/${selectedDomainId}/seo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seo: formData }),
      });

      if (!response.ok) {
        throw new Error('Kaydetme başarısız');
      }

      setMessage({ type: 'success', text: 'SEO ayarları başarıyla kaydedildi!' });
      router.refresh();
    } catch (error) {
      logger.error('Error saving SEO settings:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  if (domains.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Henüz aktif domain bulunmuyor.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Domain Seçici */}
      <div className="bg-white shadow rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Domain Seçin
        </label>
        <select
          value={selectedDomainId}
          onChange={(e) => handleDomainChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>
      </div>

      {/* Google Services */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Google Servisleri</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Analytics ID
            </label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={formData.googleAnalyticsId || ''}
              onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Örnek: G-XXXXXXXXXX</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Tag Manager ID
            </label>
            <input
              type="text"
              placeholder="GTM-XXXXXXX"
              value={formData.googleTagManagerId || ''}
              onChange={(e) => setFormData({ ...formData, googleTagManagerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Örnek: GTM-XXXXXXX - Otomatik olarak head ve body'ye eklenir</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Search Console Verification Code
            </label>
            <input
              type="text"
              placeholder="google-site-verification=..."
              value={formData.googleSearchConsoleVerification || ''}
              onChange={(e) => setFormData({ ...formData, googleSearchConsoleVerification: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Meta tag içeriği</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Ads ID
            </label>
            <input
              type="text"
              placeholder="AW-XXXXXXXXXX"
              value={formData.googleAdsId || ''}
              onChange={(e) => setFormData({ ...formData, googleAdsId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Social Media Pixels */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Sosyal Medya Pikselleri</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook Pixel ID
            </label>
            <input
              type="text"
              placeholder="XXXXXXXXXXXXXXX"
              value={formData.facebookPixelId || ''}
              onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Pixel ID
            </label>
            <input
              type="text"
              placeholder="XXXXXXXXXXXXXXX"
              value={formData.metaPixelId || ''}
              onChange={(e) => setFormData({ ...formData, metaPixelId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TikTok Pixel ID
            </label>
            <input
              type="text"
              placeholder="XXXXXXXXXXXXXXX"
              value={formData.tiktokPixelId || ''}
              onChange={(e) => setFormData({ ...formData, tiktokPixelId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Partner ID
            </label>
            <input
              type="text"
              placeholder="XXXXXXX"
              value={formData.linkedinPartnerId || ''}
              onChange={(e) => setFormData({ ...formData, linkedinPartnerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Other Analytics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Diğer Analitik Araçları</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotjar Site ID
            </label>
            <input
              type="text"
              placeholder="XXXXXXX"
              value={formData.hotjarId || ''}
              onChange={(e) => setFormData({ ...formData, hotjarId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Microsoft Clarity ID
            </label>
            <input
              type="text"
              placeholder="XXXXXXXXXX"
              value={formData.clarityId || ''}
              onChange={(e) => setFormData({ ...formData, clarityId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Custom Scripts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Özel Scriptler</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Scripts (Head)
            </label>
            <textarea
              rows={6}
              placeholder="<script>...</script>"
              value={formData.customScripts || ''}
              onChange={(e) => setFormData({ ...formData, customScripts: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              HTML head içine eklenecek özel script kodları
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Scripts (Body)
            </label>
            <textarea
              rows={6}
              placeholder="<noscript>...</noscript>"
              value={formData.customBodyScripts || ''}
              onChange={(e) => setFormData({ ...formData, customBodyScripts: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              HTML body başlangıcına eklenecek özel script kodları (örn: GTM noscript)
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}

