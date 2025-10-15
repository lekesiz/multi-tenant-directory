import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static domains list to avoid database access during build
  const domains = [
    { name: 'bas-rhin.pro' },
    { name: 'bischwiller.pro' },
    { name: 'bouxwiller.pro' },
    { name: 'brumath.pro' },
    { name: 'erstein.pro' },
    { name: 'geispolsheim.pro' },
    { name: 'haguenau.pro' },
    { name: 'hoerdt.pro' },
    { name: 'illkirch.pro' },
    { name: 'ingwiller.pro' },
    { name: 'ittenheim.pro' },
    { name: 'ostwald.pro' },
    { name: 'saverne.pro' },
    { name: 'schiltigheim.pro' },
    { name: 'schweighouse.pro' },
    { name: 'souffelweyersheim.pro' },
    { name: 'soufflenheim.pro' },
    { name: 'vendenheim.pro' },
    { name: 'wissembourg.pro' },
    { name: 'mutzig.pro' }
  ];

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
