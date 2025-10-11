import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
}

export function generateSEO({
  title,
  description,
  url,
  image,
  type = 'website',
  siteName = 'Multi-Tenant Directory',
}: SEOProps): Metadata {
  const fullTitle = `${title} | ${siteName}`;
  const defaultImage = '/og-image.png';

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      images: [
        {
          url: image || defaultImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image || defaultImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateCompanySEO(company: {
  name: string;
  city?: string;
  categories: string[];
  logoUrl?: string;
  customDescription?: string;
}) {
  const title = `${company.name}${company.city ? ` - ${company.city}` : ''}`;
  const description =
    company.customDescription ||
    `Découvrez ${company.name}, ${company.categories.join(', ')} à ${company.city || 'votre région'}. Consultez les avis, horaires et coordonnées.`;

  return generateSEO({
    title,
    description,
    image: company.logoUrl,
    type: 'profile',
  });
}

export function generateDomainSEO(domain: {
  name: string;
  siteTitle?: string;
  siteDescription?: string;
}) {
  const cityName = domain.name.split('.')[0];
  const capitalizedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return generateSEO({
    title: domain.siteTitle || `${capitalizedCity} - Annuaire des Professionnels`,
    description:
      domain.siteDescription ||
      `Trouvez les meilleurs professionnels à ${capitalizedCity}. Annuaire complet des entreprises locales avec avis, coordonnées et horaires.`,
    siteName: domain.siteTitle || `${capitalizedCity}.pro`,
  });
}

