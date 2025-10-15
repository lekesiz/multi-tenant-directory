import { Company, Review } from '@prisma/client';
import type { StructuredDataSchema } from '@/types/seo';

/**
 * Schema.org structured data generator for SEO optimization
 * Supports LocalBusiness, Organization, Review, and breadcrumb schemas
 */

export interface StructuredDataProps {
  domain: string;
  company?: Company & { 
    reviews?: Review[]; 
    _count?: { reviews: number }; 
    content?: Array<{ customDescription?: string | null }> 
  };
  reviews?: Review[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  type?: 'homepage' | 'company' | 'directory' | 'category';
  categoryName?: string;
  companies?: (Company & { content?: Array<{ customDescription?: string | null }> })[];
}

/**
 * Generate Organization schema for homepage
 */
export function generateOrganizationSchema(domain: string) {
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: `${displayName}.PRO`,
    description: `Annuaire des professionnels de ${displayName} - Trouvez les meilleures entreprises locales`,
    url: `https://${domain}`,
    logo: `https://${domain}/logo.png`,
    sameAs: [
      `https://${domain}/annuaire`,
      `https://${domain}/categories`,
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: displayName,
      addressCountry: 'FR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `https://${domain}/contact`,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Annuaire des professionnels',
      itemListElement: `https://${domain}/annuaire`,
    },
  };
}

/**
 * Generate LocalBusiness schema for company pages
 */
export function generateLocalBusinessSchema(
  company: Company & { reviews?: Review[]; _count?: { reviews: number }; content?: Array<{ customDescription?: string | null }> },
  domain: string
) {
  const averageRating = company.reviews && company.reviews.length > 0
    ? company.reviews.reduce((sum, review) => sum + review.rating, 0) / company.reviews.length
    : undefined;

  const schema: StructuredDataSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Organization'],
    name: company.name,
    description: company.content?.[0]?.customDescription || `Professionnel à ${company.city || 'France'}`,
    url: `https://${domain}/companies/${company.slug}`,
    image: company.coverImageUrl || company.logoUrl,
    logo: company.logoUrl,
    telephone: company.phone,
    email: company.email,
    sameAs: company.website ? [company.website] : undefined,
  };

  // Address
  if (company.address || company.city || company.postalCode) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: company.address,
      addressLocality: company.city,
      postalCode: company.postalCode,
      addressCountry: 'FR',
    };
  }

  // Operating hours
  if (company.businessHours) {
    schema.openingHours = company.businessHours;
  }

  // Categories/services
  if (company.categories && company.categories.length > 0) {
    schema.knowsAbout = company.categories;
    schema.additionalType = company.categories.map(cat => 
      `https://schema.org/${cat.replace(/\s+/g, '')}`
    );
  }

  // Aggregate rating
  if (averageRating && company._count?.reviews && company._count.reviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: company._count.reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Reviews
  if (company.reviews && company.reviews.length > 0) {
    schema.review = company.reviews.slice(0, 5).map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.authorName,
        image: review.authorPhoto,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment,
      datePublished: review.reviewDate,
      publisher: {
        '@type': 'Organization',
        name: review.source === 'google' ? 'Google' : 'Local',
      },
    }));
  }

  // Geo coordinates (if available)
  if (company.latitude && company.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: company.latitude,
      longitude: company.longitude,
    };
  }

  return schema;
}

/**
 * Generate ItemList schema for directory/category pages
 */
export function generateItemListSchema(
  companies: (Company & { content?: Array<{ customDescription?: string | null }> })[],
  domain: string,
  listName?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName || 'Annuaire des professionnels',
    description: `Liste des professionnels disponibles sur ${domain}`,
    url: `https://${domain}/annuaire`,
    numberOfItems: companies.length,
    itemListElement: companies.map((company, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: company.name,
        description: company.content?.[0]?.customDescription,
        url: `https://${domain}/companies/${company.slug}`,
        image: company.coverImageUrl || company.logoUrl,
        address: {
          '@type': 'PostalAddress',
          addressLocality: company.city,
          addressCountry: 'FR',
        },
        telephone: company.phone,
        email: company.email,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbListSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate WebSite schema with search functionality
 */
export function generateWebSiteSchema(domain: string) {
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${displayName}.PRO`,
    description: `Annuaire des professionnels de ${displayName}`,
    url: `https://${domain}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://${domain}/annuaire?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate FAQPage schema (for company pages with common questions)
 */
export function generateFAQPageSchema(company: Company & { content?: Array<{ customDescription?: string | null }> }) {
  const cityName = company.city || 'votre ville';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Comment contacter ${company.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: company.phone 
            ? `Vous pouvez contacter ${company.name} par téléphone au ${company.phone}${company.email ? ` ou par email à ${company.email}` : ''}.`
            : `Contactez ${company.name} via notre annuaire des professionnels.`,
        },
      },
      {
        '@type': 'Question',
        name: `Où se trouve ${company.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: company.address 
            ? `${company.name} se trouve à ${company.address}${company.city ? `, ${company.city}` : ''}.`
            : `${company.name} est situé à ${cityName}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Quels services propose ${company.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: company.content?.[0]?.customDescription || 
                (company.categories && company.categories.length > 0
                  ? `${company.name} propose des services dans les domaines suivants : ${company.categories.join(', ')}.`
                  : `${company.name} est un professionnel référencé dans notre annuaire.`),
        },
      },
    ],
  };
}

/**
 * Generate complete structured data for a page
 */
export function generatePageStructuredData(props: StructuredDataProps) {
  const schemas: StructuredDataSchema[] = [];

  // Always include WebSite schema
  schemas.push(generateWebSiteSchema(props.domain));

  // Add breadcrumbs if provided
  if (props.breadcrumbs && props.breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbListSchema(props.breadcrumbs));
  }

  // Add type-specific schemas
  switch (props.type) {
    case 'homepage':
      schemas.push(generateOrganizationSchema(props.domain));
      break;

    case 'company':
      if (props.company) {
        schemas.push(generateLocalBusinessSchema(props.company, props.domain));
        schemas.push(generateFAQPageSchema(props.company));
      }
      break;

    case 'directory':
    case 'category':
      if (props.companies) {
        const listName = props.type === 'category' && props.categoryName
          ? `Professionnels - ${props.categoryName}`
          : 'Annuaire des professionnels';
        schemas.push(generateItemListSchema(props.companies, props.domain, listName));
      }
      break;
  }

  return schemas;
}

/**
 * Convert structured data to JSON-LD script tag content
 */
export function structuredDataToJsonLd(schemas: StructuredDataSchema[]): string {
  if (schemas.length === 1) {
    return JSON.stringify(schemas[0], null, 2);
  }
  
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemas,
  }, null, 2);
}