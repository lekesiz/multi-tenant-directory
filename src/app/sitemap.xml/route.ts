import { NextRequest, NextResponse } from 'next/server';
import { generateSitemapForDomain, generateSitemapXML } from '@/lib/sitemap-generator';

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get('host') || 'localhost:3000';
    
    // Generate sitemap URLs for this domain
    const urls = await generateSitemapForDomain(host);
    
    // Generate XML content
    const sitemapXML = generateSitemapXML(urls);

    return new NextResponse(sitemapXML, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'X-Sitemap-URLs': urls.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback to basic sitemap if database error
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const fallbackSitemap = generateSitemapXML([
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/annuaire`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]);
    
    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Short cache for fallback
      },
    });
  }
}