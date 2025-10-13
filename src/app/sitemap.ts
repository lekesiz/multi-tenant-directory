import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all domains
  const domains = await prisma.domain.findMany({
    select: {
      name: true,
    },
  });

  const sitemap: MetadataRoute.Sitemap = [];

  // Add pages for each domain
  for (const domain of domains) {
    sitemap.push({
      url: `https://${domain.name}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    });

    sitemap.push({
      url: `https://${domain.name}/annuaire`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    sitemap.push({
      url: `https://${domain.name}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Legal pages
    sitemap.push({
      url: `https://${domain.name}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    });

    sitemap.push({
      url: `https://${domain.name}/politique-confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    });

    sitemap.push({
      url: `https://${domain.name}/cgu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    });

    sitemap.push({
      url: `https://${domain.name}/tarifs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return sitemap;
}
