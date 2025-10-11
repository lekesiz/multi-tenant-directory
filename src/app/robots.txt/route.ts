import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const domain = hostname.replace('www.', '');
  const baseUrl = `https://${domain}`;

  const robotsTxt = `# Robots.txt for ${domain}

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay (optional, in seconds)
Crawl-delay: 1

# Specific bot rules
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

# Block bad bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

