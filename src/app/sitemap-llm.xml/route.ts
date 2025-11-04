import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { generateLLMSitemap } from '@/lib/llm-sitemap-generator';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * LLM-specific Sitemap
 * Provides AI-friendly URLs for structured data extraction
 * Complements the standard /sitemap.xml for AI crawlers
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'haguenau.pro';

    // Extract and validate domain
    let domain = host.split(':')[0];
    domain = domain.replace('www.', '');

    // Get or create domain record
    const domainRecord = await prisma.domain.findUnique({
      where: { name: domain },
    });

    if (!domainRecord) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }
      );
    }

    const baseUrl = `https://${domain}`;

    // Generate sitemap
    const xml = await generateLLMSitemap(domainRecord.id, baseUrl);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1 hour cache
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Last-Modified': new Date().toUTCString(),
      },
    });
  } catch (error) {
    logger.error('Error generating LLM sitemap:', error);

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
      }
    );
  }
}

// Revalidate cache
export const revalidate = 3600; // 1 hour
