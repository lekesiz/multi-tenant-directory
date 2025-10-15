# Dynamic Sitemap Generator Documentation

## Overview

Dynamic sitemap generation system for multi-tenant directory platform that creates SEO-optimized XML sitemaps for each domain with real-time content updates.

## Features

### ✅ Dynamic Content Generation
- **Company pages**: All visible companies per domain
- **Category pages**: Dynamic categories based on company listings
- **Legal pages**: Domain-specific and global legal pages
- **Static pages**: Homepage, directory, contact, etc.

### ✅ SEO Optimization
- **Priority-based ranking**: Featured companies get higher priority (0.8 vs 0.6)
- **Smart caching**: 1-hour cache for performance, 5-minute fallback cache
- **Proper XML structure**: Full XML sitemap specification compliance
- **Last modified dates**: Real company/page update timestamps

### ✅ Multi-Tenant Support
- **Domain-specific content**: Each domain gets its own sitemap
- **Tenant isolation**: Only visible content for each domain
- **Fallback handling**: Graceful degradation if database unavailable

## File Structure

```
src/
├── app/
│   ├── sitemap.xml/
│   │   └── route.ts          # Dynamic sitemap endpoint
│   ├── robots.txt/
│   │   └── route.ts          # Dynamic robots.txt
│   ├── sitemap.ts            # Static sitemap fallback
│   └── admin/
│       └── sitemap/
│           └── page.tsx      # Admin sitemap management
├── lib/
│   └── sitemap-generator.ts  # Core sitemap generation logic
└── docs/
    └── SITEMAP_GENERATOR.md  # This documentation
```

## API Endpoints

### Dynamic Sitemap
```
GET /sitemap.xml
```

**Response Headers:**
- `Content-Type: application/xml`
- `Cache-Control: public, max-age=3600`
- `X-Sitemap-URLs: {count}`

**Example Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://haguenau.pro</loc>
    <lastmod>2025-01-15T10:30:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- More URLs... -->
</urlset>
```

### Dynamic Robots.txt
```
GET /robots.txt
```

**Response Headers:**
- `Content-Type: text/plain`
- `Cache-Control: public, max-age=86400`

## Core Functions

### `generateSitemapForDomain(domainName: string)`

Generates complete sitemap URL list for a specific domain.

**Returns:** `SitemapUrl[]`

**Example Usage:**
```typescript
import { generateSitemapForDomain } from '@/lib/sitemap-generator';

const urls = await generateSitemapForDomain('haguenau.pro');
console.log(`Generated ${urls.length} URLs`);
```

### `generateSitemapXML(urls: SitemapUrl[])`

Converts URL list to valid XML sitemap format.

**Returns:** `string` (XML content)

### `getSitemapStats(domainName: string)`

Get sitemap statistics for monitoring and admin dashboard.

**Returns:**
```typescript
{
  domain: string;
  totalUrls: number;
  companies: number;
  categories: number;
  legalPages: number;
  staticPages: number;
  lastGenerated: string;
}
```

### `generateAllSitemaps()`

Generate sitemaps for all active domains (admin function).

**Returns:** Array of generation results with success/error status.

## URL Structure & Priorities

### Priority Levels
- **1.0**: Homepage (highest)
- **0.9**: Directory page (`/annuaire`)
- **0.8**: Categories page + Featured companies
- **0.7**: Individual category pages
- **0.6**: Regular company pages + Contact page
- **0.5**: Pricing page
- **0.3**: Legal pages (lowest)

### URL Patterns
```
Homepage:           https://domain.tld/
Directory:          https://domain.tld/annuaire
Categories:         https://domain.tld/categories
Category Page:      https://domain.tld/categories/restaurants
Company Page:       https://domain.tld/companies/restaurant-abc
Contact:            https://domain.tld/contact
Join:               https://domain.tld/rejoindre
Pricing:            https://domain.tld/tarifs
Legal:              https://domain.tld/mentions-legales
```

## Performance Optimizations

### 1. Smart Caching
```typescript
// 1 hour cache for normal operation
'Cache-Control': 'public, max-age=3600, s-maxage=3600'

// 5 minute cache for fallback
'Cache-Control': 'public, max-age=300, s-maxage=300'
```

### 2. Database Query Optimization
- **Single optimized query** for companies with tenant filtering
- **Efficient category extraction** from company data
- **Minimal database calls** with proper includes

### 3. Fallback Mechanism
```typescript
// If database fails, serve minimal sitemap
const fallbackSitemap = generateSitemapXML([
  { url: baseUrl, priority: 1.0, changeFrequency: 'daily' },
  { url: `${baseUrl}/annuaire`, priority: 0.9, changeFrequency: 'daily' }
]);
```

## Admin Management

### Sitemap Dashboard
Access: `/admin/sitemap`

**Features:**
- View sitemap statistics for all domains
- Generate sitemaps for all domains
- Direct links to view XML sitemaps
- Real-time URL count monitoring

**Statistics Displayed:**
- Total URLs per domain
- Company count
- Category count  
- Legal page count
- Last generation timestamp

### Manual Generation
```typescript
// From admin dashboard
const results = await generateAllSitemaps();

// Results show success/failure for each domain
console.table(results);
```

## SEO Best Practices

### 1. URL Structure
- **Clean URLs**: No query parameters or complex paths
- **Consistent naming**: kebab-case for categories
- **Encoded URLs**: Proper URL encoding for special characters

### 2. Priority Assignment
- **Featured companies**: Higher priority (0.8) for better visibility
- **Fresh content**: Recently updated companies get prominence
- **Static importance**: Core pages (homepage, directory) highest priority

### 3. Change Frequency
- **Daily**: Homepage, directory (dynamic content)
- **Weekly**: Companies, categories (moderate updates)
- **Monthly**: Contact, pricing (stable content)
- **Yearly**: Legal pages (rarely change)

### 4. Last Modified
- **Real timestamps**: Actual company/page update dates
- **Current date fallback**: For pages without update tracking

## Monitoring & Analytics

### 1. URL Count Tracking
```typescript
// Monitor sitemap size growth
const stats = await getSitemapStats('haguenau.pro');
console.log(`${stats.totalUrls} URLs in sitemap`);
```

### 2. Generation Success Rate
```typescript
// Track generation failures
const results = await generateAllSitemaps();
const successRate = results.filter(r => r.success).length / results.length;
```

### 3. Performance Metrics
- **Generation time**: Monitor sitemap generation speed
- **Cache hit rate**: Track cache effectiveness
- **Error rate**: Monitor database connection failures

## Integration with Search Engines

### 1. Google Search Console
```bash
# Submit sitemap to GSC
https://search.google.com/search-console/

# Add sitemap URL:
https://yourdomain.pro/sitemap.xml
```

### 2. Robots.txt Reference
```
# Automatic robots.txt inclusion
Sitemap: https://yourdomain.pro/sitemap.xml
```

### 3. Monitoring Indexing
- Check GSC for sitemap submission status
- Monitor URL indexing rates
- Track crawl errors and warnings

## Troubleshooting

### 1. Empty Sitemap
**Cause:** No visible companies for domain
**Solution:** Check company visibility settings and domain configuration

### 2. Database Connection Errors
**Cause:** Database unavailable during generation
**Solution:** Fallback sitemap served automatically

### 3. Large Sitemap Size
**Cause:** Too many companies (>50,000 URLs)
**Solution:** Consider sitemap index files for very large datasets

### 4. Slow Generation
**Cause:** Database queries not optimized
**Solution:** Check database indexes and query performance

## Development

### Testing Locally
```bash
# Test sitemap generation
curl http://localhost:3000/sitemap.xml

# Check robots.txt
curl http://localhost:3000/robots.txt

# Test specific domain
curl -H "Host: haguenau.pro" http://localhost:3000/sitemap.xml
```

### Adding New URL Types
```typescript
// In sitemap-generator.ts
const newUrls: SitemapUrl[] = [
  {
    url: `${baseUrl}/new-section`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }
];

urls.push(...newUrls);
```

### Custom Priority Logic
```typescript
// Custom priority calculation
const priority = company.content[0]?.priority > 80 ? 0.9 :
                 company.content[0]?.priority > 50 ? 0.8 : 0.6;
```

## Production Deployment

### 1. Environment Variables
No additional environment variables required - uses existing database connection.

### 2. CDN Caching
Configure CDN to cache sitemap.xml with appropriate TTL:
```
Cache-Control: public, max-age=3600
```

### 3. Monitoring Alerts
Set up alerts for:
- Sitemap generation failures
- Unusual sitemap size changes
- Performance degradation

## Future Enhancements

### 1. Sitemap Index
For very large sites (>50k URLs):
```xml
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://domain.tld/sitemap-companies.xml</loc>
    <lastmod>2025-01-15T10:30:00.000Z</lastmod>
  </sitemap>
</sitemapindex>
```

### 2. Image Sitemaps
Include company images:
```xml
<url>
  <loc>https://domain.tld/companies/restaurant-abc</loc>
  <image:image>
    <image:loc>https://domain.tld/images/restaurant-logo.jpg</image:loc>
    <image:title>Restaurant ABC Logo</image:title>
  </image:image>
</url>
```

### 3. News Sitemaps
For blog/news content:
```xml
<url>
  <loc>https://domain.tld/news/article-slug</loc>
  <news:news>
    <news:publication>
      <news:name>Directory News</news:name>
      <news:language>fr</news:language>
    </news:publication>
  </news:news>
</url>
```

## Impact Summary

**SEO Benefits:**
- ✅ Complete URL discovery for search engines
- ✅ Priority-based crawling guidance
- ✅ Real-time content updates reflected
- ✅ Multi-tenant SEO optimization

**Performance Benefits:**  
- ✅ Cached sitemap generation (1 hour TTL)
- ✅ Optimized database queries
- ✅ Graceful fallback handling
- ✅ Minimal server resource usage

**Management Benefits:**
- ✅ Admin dashboard for monitoring
- ✅ Automated generation for all domains
- ✅ Statistics and health checking
- ✅ Manual regeneration capability