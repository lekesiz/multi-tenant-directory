import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || '';
    const domain = hostname.replace('www.', '');
    
    // Get domain from database
    const domainData = await prisma.domain.findUnique({
      where: { name: domain },
    });

    if (!domainData) {
      return new NextResponse('Domain not found', { status: 404 });
    }

    // Get all visible companies for this domain
    const companyContents = await prisma.companyContent.findMany({
      where: {
        domainId: domainData.id,
        isVisible: true,
      },
      include: {
        company: true,
      },
    });

    const baseUrl = `https://${domain}`;
    const currentDate = new Date().toISOString();

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Annuaire Page -->
  <url>
    <loc>${baseUrl}/annuaire</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Company Pages -->
  ${companyContents
    .map(
      (content) => `
  <url>
    <loc>${baseUrl}/companies/${content.company.slug}</loc>
    <lastmod>${content.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
  
  <!-- Category Pages -->
  ${getUniqueCategories(companyContents)
    .map(
      (category) => `
  <url>
    <loc>${baseUrl}/categories/${encodeURIComponent(category.toLowerCase())}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
    
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getUniqueCategories(companyContents: any[]): string[] {
  const categories = new Set<string>();
  
  companyContents.forEach((content) => {
    if (content.company.categories && Array.isArray(content.company.categories)) {
      content.company.categories.forEach((cat: string) => categories.add(cat));
    }
  });
  
  return Array.from(categories);
}

