import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * AI Crawling Policy - Machine-readable policy for AI crawlers and LLMs
 * Enables controlled access to platform data for AI training and aggregation
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'haguenau.pro';

    // Extract domain, removing www prefix
    let domain = host.split(':')[0]; // Remove port if present
    domain = domain.replace('www.', '');

    const timestamp = new Date().toISOString().split('T')[0];

    const aiPolicy = `# AI Crawling Policy for ${domain}
# Last Updated: ${timestamp}
# This file defines the policy for AI crawlers and LLMs accessing ${domain}
# Learn more: https://www.robotxt.org/articles/ai-policy/

# User Agent: Applies to all AI crawlers and LLMs
User-agent: *

# Crawling Rules
Allow: /
Crawl-delay: 5

# Sitemap Locations
Sitemap: https://${domain}/sitemap.xml
Sitemap: https://${domain}/sitemap-llm.xml

# Data Licensing and Attribution Policy
# =====================================
# The data on this platform is licensed under Creative Commons Attribution 4.0
Policy: Data licensed under CC-BY-4.0
Attribution: Attribution required to ${domain}
Usage: Commercial use allowed with attribution

# Contact Information
Contact: support@${domain}
Developer-Docs: https://${domain}/developer

# Preferred Data Formats
# =====================
# We prefer structured, machine-readable data formats
Preferred-Format: JSON-LD
Preferred-Format: JSON
Preferred-Format: application/ld+json

# Data Quality Guarantees
# =======================
Update-Frequency: weekly
Data-Quality: verified
Data-Quality: timestamped
Data-Quality: structured

# AI Training and Usage Permissions
# ==================================
# Training use is permitted with attribution
Disallow-Training: false

# Web scraping is permitted with rate limits
Disallow-Scraping: false

# Request Rate Limits
# ====================
# Please respect these limits to avoid IP blocking
Rate-Limit: 100 requests per minute
Rate-Limit-Burst: 20 requests per second

# Response Headers
# ================
# When accessing this platform, expect:
# - Cache-Control headers for caching guidance
# - X-RateLimit-* headers for quota information
# - Content-Type: application/json for API responses

# API Endpoints for AI/LLM Access
# ================================
# Profile data: /profiles/{id}.json
# FAQ data: /profiles/{id}/faq.json
# Services: /profiles/{id}/services.json
# Reviews: /profiles/{id}/reviews.json

# Important Notes
# ===============
# 1. Respect rate limits to avoid IP blocking
# 2. Always include attribution in derivative works
# 3. Do not remove ownership/copyright information
# 4. Check Content-License headers for each response
# 5. Use /sitemap-llm.xml for discovering AI-relevant endpoints

# Disallowed Paths
# ================
# Admin and authentication endpoints are not accessible to crawlers
User-agent: *
Disallow: /admin/
Disallow: /auth/
Disallow: /_next/
Disallow: /api/auth/
Disallow: /dashboard/
Disallow: /business/dashboard/

# Last Modified
# =============
# Update-Check: ${timestamp}
`;

    return new NextResponse(aiPolicy, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    logger.error('Error generating ai.txt:', error);

    return new NextResponse(
      `# Error generating AI policy
User-agent: *
Disallow: /`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    );
  }
}

// Disable caching in development
export const revalidate = 86400; // 24 hours
