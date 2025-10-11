import Head from 'next/head';
import { MetaTags } from '@/lib/seo';

interface SEOHeadProps {
  metaTags: MetaTags;
  structuredData?: any[];
}

export default function SEOHead({ metaTags, structuredData }: SEOHeadProps) {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      {metaTags.keywords && <meta name="keywords" content={metaTags.keywords} />}
      
      {/* Canonical URL */}
      {metaTags.canonical && <link rel="canonical" href={metaTags.canonical} />}
      
      {/* Robots */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTags.ogTitle || metaTags.title} />
      <meta property="og:description" content={metaTags.ogDescription || metaTags.description} />
      {metaTags.ogImage && <meta property="og:image" content={metaTags.ogImage} />}
      {metaTags.ogUrl && <meta property="og:url" content={metaTags.ogUrl} />}
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content={metaTags.title.split(' - ')[0]} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={metaTags.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={metaTags.twitterTitle || metaTags.ogTitle || metaTags.title} />
      <meta name="twitter:description" content={metaTags.twitterDescription || metaTags.ogDescription || metaTags.description} />
      {metaTags.twitterImage && <meta name="twitter:image" content={metaTags.twitterImage || metaTags.ogImage} />}
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="French" />
      <meta name="author" content={metaTags.title.split(' - ')[0]} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && structuredData.map((data, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  );
}

