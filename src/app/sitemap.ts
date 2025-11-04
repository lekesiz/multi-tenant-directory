import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

// Force dynamic rendering for sitemap
export const dynamic = 'force-dynamic';

async function getDomainFromHost(host: string) {
  let domain = host.split(':')[0];
  domain = domain.replace('www.', '');
  return await prisma.domain.findUnique({
    where: { name: domain },
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'bas-rhin.pro';
    const currentDomain = await getDomainFromHost(host);

    if (!currentDomain) {
      // Fallback to default domain
      return getDefaultSitemap('haguenau.pro');
    }

    const baseUrl = `https://${currentDomain.name}`;
    const currentDate = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/annuaire`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/rejoindre`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/tarifs`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/mentions-legales`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/politique-de-confidentialite`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/cgu`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.3,
      },
    ];

    // Get all companies for this domain
    const companies = await prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId: currentDomain.id,
            isVisible: true,
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 1000, // Limit to prevent too large sitemaps
    });

    // Company pages
    const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
      url: `${baseUrl}/companies/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Get all unique categories
    const categoriesResult = await prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId: currentDomain.id,
            isVisible: true,
          },
        },
        categories: {
          isEmpty: false,
        },
      },
      select: {
        categories: true,
      },
    });

    const uniqueCategories = new Set<string>();
    categoriesResult.forEach((company) => {
      company.categories.forEach((category: string) => {
        if (category && category.trim()) {
          uniqueCategories.add(category);
        }
      });
    });

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = Array.from(uniqueCategories).map(
      (category) => {
        const slug = category
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing -

        return {
          url: `${baseUrl}/categories/${slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      }
    );

    logger.info('Sitemap generated', {
      domain: currentDomain.name,
      staticPages: staticPages.length,
      companyPages: companyPages.length,
      categoryPages: categoryPages.length,
      totalUrls: staticPages.length + companyPages.length + categoryPages.length,
    });

    // Combine all pages
    return [...staticPages, ...companyPages, ...categoryPages];
  } catch (error) {
    logger.error('Error generating sitemap', error);
    // Return default sitemap on error
    return getDefaultSitemap('haguenau.pro');
  }
}

// Fallback sitemap
function getDefaultSitemap(domain: string): MetadataRoute.Sitemap {
  const baseUrl = `https://${domain}`;
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/annuaire`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}

