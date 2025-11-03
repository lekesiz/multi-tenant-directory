import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * Generate LLM-optimized sitemap for AI crawlers
 * Includes JSON endpoints for structured data extraction
 */
export async function generateLLMSitemap(
  domainId: number,
  baseUrl: string
): Promise<string> {
  try {
    // Fetch all visible companies for this domain
    const companies = await prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId,
            isVisible: true,
          },
        },
      },
      select: {
        id: true,
        slug: true,
        googlePlaceId: true,
        updatedAt: true,
        name: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Fetch all categories for this domain
    const categoriesData = await prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId,
            isVisible: true,
          },
        },
      },
      select: {
        categories: true,
        updatedAt: true,
      },
    });

    // Extract unique categories
    const categories = Array.from(
      new Set(
        categoriesData.flatMap((c) => c.categories).filter((cat) => !!cat)
      )
    );

    // Build URL entries for sitemap
    const urlEntries: Array<{
      loc: string;
      lastmod: string;
      changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority: string;
    }> = [];

    // Add company profile endpoints
    for (const company of companies) {
      const identifier = company.googlePlaceId || company.id.toString();
      const lastmod = company.updatedAt.toISOString().split('T')[0];

      // Profile data - most important
      urlEntries.push({
        loc: `${baseUrl}/api/profiles/${identifier}.json`,
        lastmod,
        changefreq: 'weekly',
        priority: '1.0',
      });

      // Reviews data
      urlEntries.push({
        loc: `${baseUrl}/api/profiles/${identifier}/reviews.json`,
        lastmod,
        changefreq: 'daily',
        priority: '0.9',
      });

      // FAQ/Services
      urlEntries.push({
        loc: `${baseUrl}/api/profiles/${identifier}/services.json`,
        lastmod,
        changefreq: 'monthly',
        priority: '0.8',
      });

      // Business hours
      urlEntries.push({
        loc: `${baseUrl}/api/profiles/${identifier}/hours.json`,
        lastmod,
        changefreq: 'monthly',
        priority: '0.7',
      });
    }

    // Add category listing endpoints
    for (const category of categories) {
      urlEntries.push({
        loc: `${baseUrl}/api/categories/${encodeURIComponent(category)}.json`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    // Add domain metadata
    urlEntries.push({
      loc: `${baseUrl}/api/metadata.json`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.9',
    });

    // Generate XML
    const xml = generateSitemapXML(urlEntries);

    return xml;
  } catch (error) {
    logger.error('Error generating LLM sitemap:', error);
    throw error;
  }
}

/**
 * Generate XML sitemap from URL entries
 */
function generateSitemapXML(
  urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }>
): string {
  const urlsXml = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlsXml}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/[<]/g, '&lt;')
    .replace(/[>]/g, '&gt;')
    .replace(/[&]/g, '&amp;')
    .replace(/['"]/g, (char) => (char === '"' ? '&quot;' : '&#039;'));
}

/**
 * Get metadata about a domain for AI consumption
 */
export async function getDomainMetadata(domainId: number, domain: string) {
  const companies = await prisma.company.count({
    where: {
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
    },
  });

  const reviews = await prisma.review.count({
    where: {
      company: {
        content: {
          some: {
            domainId,
          },
        },
      },
    },
  });

  return {
    domain,
    totalCompanies: companies,
    totalReviews: reviews,
    generatedAt: new Date().toISOString(),
    apiVersion: '1.0',
    license: 'CC-BY-4.0',
    attribution: `Attribution required to ${domain}`,
  };
}
