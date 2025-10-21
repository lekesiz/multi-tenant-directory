'use client';

import { logger } from '@/lib/logger';
import { generatePageStructuredData, structuredDataToJsonLd, StructuredDataProps } from '@/lib/structured-data';
import { useEffect } from 'react';

/**
 * StructuredData component for adding Schema.org JSON-LD to pages
 * Automatically generates appropriate structured data based on page type
 * Uses client-side rendering to ensure JSON-LD is properly injected
 */
export default function StructuredData(props: StructuredDataProps) {
  const schemas = generatePageStructuredData(props);
  const jsonLd = structuredDataToJsonLd(schemas);

  useEffect(() => {
    // Log structured data for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.info('📊 Structured Data:', JSON.parse(jsonLd));
    }
  }, [jsonLd]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
      suppressHydrationWarning
    />
  );
}

