/**
 * SEO Utility Functions
 * Generates meta tags, structured data, and SEO-related content
 */

export interface MetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(domain: string, page: string, data?: any): MetaTags {
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  const baseUrl = `https://${domain}`;

  const defaults: MetaTags = {
    title: `${displayName}.PRO - Les Professionnels de ${displayName}`,
    description: `Trouvez les meilleurs professionnels à ${displayName}. Annuaire complet des entreprises locales : restaurants, services, commerces et plus encore.`,
    keywords: `${displayName}, professionnels, annuaire, entreprises, ${cityName}`,
    ogTitle: `${displayName}.PRO - Annuaire des Professionnels`,
    ogDescription: `Découvrez les meilleurs professionnels à ${displayName}`,
    ogImage: `${baseUrl}/og-image.png`,
    ogUrl: baseUrl,
    twitterCard: 'summary_large_image',
    canonical: baseUrl,
  };

  // Page-specific meta tags
  switch (page) {
    case 'home':
      return defaults;

    case 'annuaire':
      return {
        ...defaults,
        title: `Annuaire des Professionnels - ${displayName}.PRO`,
        description: `Parcourez l'annuaire complet des professionnels à ${displayName}. Trouvez facilement les entreprises locales par catégorie.`,
        keywords: `annuaire, ${displayName}, professionnels, entreprises, recherche`,
        canonical: `${baseUrl}/annuaire`,
      };

    case 'company':
      if (data?.company) {
        const company = data.company;
        return {
          ...defaults,
          title: `${company.name} - ${displayName}.PRO`,
          description: company.customDescription || `${company.name} à ${company.city}. ${company.categories?.join(', ')}.`,
          keywords: `${company.name}, ${company.categories?.join(', ')}, ${displayName}`,
          ogTitle: company.name,
          ogDescription: company.customDescription || `Professionnel à ${displayName}`,
          ogImage: company.logoUrl || defaults.ogImage,
          canonical: `${baseUrl}/companies/${company.slug}`,
        };
      }
      return defaults;

    case 'category':
      if (data?.category) {
        const category = data.category;
        return {
          ...defaults,
          title: `${category} - ${displayName}.PRO`,
          description: `Trouvez les meilleurs professionnels de ${category} à ${displayName}. Comparez les services et contactez facilement.`,
          keywords: `${category}, ${displayName}, professionnels`,
          canonical: `${baseUrl}/categories/${category.toLowerCase()}`,
        };
      }
      return defaults;

    default:
      return defaults;
  }
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema(domain: string) {
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: `${displayName}.PRO`,
    url: `https://${domain}`,
    logo: `https://${domain}/logo.png`,
    description: `Annuaire des professionnels de ${displayName}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: displayName,
      addressCountry: 'FR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-3-67-31-07-70',
      contactType: 'customer service',
      availableLanguage: ['French'],
    },
  };
}

/**
 * Generate JSON-LD structured data for LocalBusiness
 */
export function generateLocalBusinessSchema(company: any, domain: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    image: company.logoUrl || company.coverImageUrl,
    '@id': `https://${domain}/companies/${company.slug}`,
    url: company.website || `https://${domain}/companies/${company.slug}`,
    telephone: company.phone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address,
      addressLocality: company.city,
      postalCode: company.postalCode,
      addressCountry: 'FR',
    },
    geo: company.latitude && company.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: company.latitude,
      longitude: company.longitude,
    } : undefined,
    openingHoursSpecification: company.businessHours ? parseBusinessHours(company.businessHours) : undefined,
  };
}

/**
 * Generate JSON-LD structured data for BreadcrumbList
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD structured data for ItemList (company listing)
 */
export function generateItemListSchema(companies: any[], domain: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: companies.map((company, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://${domain}/companies/${company.slug}`,
      name: company.name,
    })),
  };
}

/**
 * Parse business hours from JSON to OpeningHoursSpecification
 */
function parseBusinessHours(businessHours: any) {
  if (Array.isArray(businessHours)) {
    // If it's an array of strings like ["Lundi: 09:00 - 18:00", ...]
    return businessHours.map((hours: string) => {
      const [day, time] = hours.split(':');
      const [open, close] = time?.split('-').map(t => t.trim()) || [];
      
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: translateDayToEnglish(day?.trim()),
        opens: open,
        closes: close,
      };
    });
  }
  return undefined;
}

/**
 * Translate French day names to English for schema.org
 */
function translateDayToEnglish(frenchDay: string): string {
  const dayMap: Record<string, string> = {
    'Lundi': 'Monday',
    'Mardi': 'Tuesday',
    'Mercredi': 'Wednesday',
    'Jeudi': 'Thursday',
    'Vendredi': 'Friday',
    'Samedi': 'Saturday',
    'Dimanche': 'Sunday',
  };
  return dayMap[frenchDay] || frenchDay;
}

/**
 * Generate robots meta tag
 */
export function generateRobotsMeta(index: boolean = true, follow: boolean = true): string {
  const indexValue = index ? 'index' : 'noindex';
  const followValue = follow ? 'follow' : 'nofollow';
  return `${indexValue}, ${followValue}`;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(domain: string, path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `https://${domain}${cleanPath}`;
}

