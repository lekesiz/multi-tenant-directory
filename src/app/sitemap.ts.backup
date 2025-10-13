import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://multi-tenant-directory.vercel.app';

  // Get all companies
  const companies = await prisma.company.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const companyUrls = companies.map((company) => ({
    url: `${baseUrl}/companies/${company.slug}`,
    lastModified: company.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/annuaire`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...companyUrls,
  ];
}

