import { generatePageStructuredData, structuredDataToJsonLd, StructuredDataProps } from '@/lib/structured-data';

/**
 * StructuredData component for adding Schema.org JSON-LD to pages
 * Automatically generates appropriate structured data based on page type
 */
export default function StructuredData(props: StructuredDataProps) {
  const schemas = generatePageStructuredData(props);
  const jsonLd = structuredDataToJsonLd(schemas);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}