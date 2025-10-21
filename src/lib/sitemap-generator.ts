import { logger } from '@/lib/logger';
import { prisma } from './prisma';

export interface SitemapUrl {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Generate sitemap URLs for a specific domain
 */
export async function generateSitemapForDomain(
  domainName: string
): Promise<SitemapUrl[]> {
  const baseUrl = `https://${domainName}`;
  const currentDate = new Date().toISOString();
  const urls: SitemapUrl[] = [];

  try {
    // Get domain info
    const domain = await prisma.domain.findUnique({
      where: { name: domainName },
    });

    if (!domain) {
      throw new Error(`Domain ${domainName} not found`);
    }

    // Homepage - highest priority
    urls.push({
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    });

    // Main directory page
    urls.push({
      url: `${baseUrl}/annuaire`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Categories main page
    urls.push({
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Get visible companies for this domain
    const companies = await prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId: domain.id,
            isVisible: true,
          },
        },
      },
      include: {
        content: {
          where: {
            domainId: domain.id,
            isVisible: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Individual company pages
    companies.forEach(company => {
      const lastmod = company.updatedAt ? company.updatedAt.toISOString() : currentDate;
      const priority = company.content[0]?.priority > 50 ? 0.8 : 0.6;
      
      urls.push({
        url: `${baseUrl}/companies/${company.slug}`,
        lastModified: lastmod,
        changeFrequency: 'weekly',
        priority,
      });
    });

    // Get unique categories
    const allCategories = companies.flatMap(c => c.categories);
    const uniqueCategories = [...new Set(allCategories)].filter(Boolean);

    // Individual category pages
    uniqueCategories.forEach(category => {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      urls.push({
        url: `${baseUrl}/categories/${encodeURIComponent(categorySlug)}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    // Static pages
    const staticPages = [
      { path: '/contact', priority: 0.6, changeFreq: 'monthly' as const },
      { path: '/rejoindre', priority: 0.7, changeFreq: 'monthly' as const },
      { path: '/tarifs', priority: 0.5, changeFreq: 'monthly' as const },
    ];

    staticPages.forEach(page => {
      urls.push({
        url: `${baseUrl}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.changeFreq,
        priority: page.priority,
      });
    });

    // Legal pages
    const legalPages = await prisma.legalPage.findMany({
      where: {
        OR: [
          { domainId: domain.id },
          { domainId: null }, // Global pages
        ],
        isActive: true,
      },
    });

    legalPages.forEach(page => {
      urls.push({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt.toISOString(),
        changeFrequency: 'yearly',
        priority: 0.3,
      });
    });

    return urls;

  } catch (error) {
    logger.error(`Error generating sitemap for domain ${domainName}:`, error);
    throw error;
  }
}

/**
 * Generate XML sitemap content
 */
export function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlEntries}
</urlset>`;
}

/**
 * Get sitemap statistics for a domain
 */
export async function getSitemapStats(domainName: string) {
  try {
    const domain = await prisma.domain.findUnique({
      where: { name: domainName },
    });

    if (!domain) {
      throw new Error(`Domain ${domainName} not found`);
    }

    const [
      companyCount,
      categoryCount,
      legalPageCount,
    ] = await Promise.all([
      prisma.company.count({
        where: {
          content: {
            some: {
              domainId: domain.id,
              isVisible: true,
            },
          },
        },
      }),
      // Get unique categories count
      prisma.company.findMany({
        where: {
          content: {
            some: {
              domainId: domain.id,
              isVisible: true,
            },
          },
        },
        select: { categories: true },
      }).then(companies => {
        const allCategories = companies.flatMap(c => c.categories);
        return new Set(allCategories).size;
      }),
      prisma.legalPage.count({
        where: {
          OR: [
            { domainId: domain.id },
            { domainId: null },
          ],
          isActive: true,
        },
      }),
    ]);

    const staticPageCount = 6; // Homepage, annuaire, categories, contact, rejoindre, tarifs
    const totalUrls = companyCount + categoryCount + legalPageCount + staticPageCount;

    return {
      domain: domainName,
      totalUrls,
      companies: companyCount,
      categories: categoryCount,
      legalPages: legalPageCount,
      staticPages: staticPageCount,
      lastGenerated: new Date().toISOString(),
    };

  } catch (error) {
    logger.error(`Error getting sitemap stats for domain ${domainName}:`, error);
    throw error;
  }
}

/**
 * Generate sitemaps for all active domains
 */
export async function generateAllSitemaps() {
  try {
    const domains = await prisma.domain.findMany({
      where: { isActive: true },
      select: { name: true },
    });

    const results = [];

    for (const domain of domains) {
      try {
        const urls = await generateSitemapForDomain(domain.name);
        const stats = await getSitemapStats(domain.name);
        
        results.push({
          domain: domain.name,
          success: true,
          urlCount: urls.length,
          stats,
        });
      } catch (error) {
        results.push({
          domain: domain.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;

  } catch (error) {
    logger.error('Error generating all sitemaps:', error);
    throw error;
  }
}