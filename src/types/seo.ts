/**
 * SEO and metadata type definitions
 */

export interface SEOSettings {
  defaultTitle?: string;
  defaultDescription?: string;
  keywords?: string[];
  ogImage?: string;
  twitterHandle?: string;
  canonicalUrl?: string;
  robots?: {
    index: boolean;
    follow: boolean;
  };
}

export interface DomainSettings {
  seo?: SEOSettings;
  [key: string]: unknown;
}

export interface StructuredDataSchema {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
}
