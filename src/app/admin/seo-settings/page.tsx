import { logger } from '@/lib/logger';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import SEOSettingsForm from '@/components/admin/SEOSettingsForm';

export const metadata = {
  title: 'SEO & Analitik Ayarları - Admin Panel',
  description: 'Domain bazlı SEO ve analitik ayarlarını yönetin',
};

async function getDomains() {
  try {
    const domains = await prisma.domain.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return domains;
  } catch (error) {
    logger.error('Error fetching domains:', error);
    return [];
  }
}

export default async function SEOSettingsPage() {
  const domains = await getDomains();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SEO & Analitik Ayarları</h1>
        <p className="mt-2 text-gray-600">
          Her domain için Google Analytics, Search Console, Ads ve diğer izleme kodlarını yönetin
        </p>
      </div>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <SEOSettingsForm domains={domains} />
      </Suspense>
    </div>
  );
}

